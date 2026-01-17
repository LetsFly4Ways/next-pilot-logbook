import { z } from "zod";

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Common fields shared between flights and simulator sessions
 */
const BaseLogSchema = z.object({
	date: z.date(),
	aircraft_id: z.uuid(),
	duty_start: z.iso.time().nullable().optional(),
	duty_end: z.iso.time().nullable().optional(),
	duty_time_minutes: z.number().int().min(0).default(0),
	hobbs_start: z.number().nonnegative().nullable().optional(),
	hobbs_end: z.number().nonnegative().nullable().optional(),
	remarks: z.string().max(1000).nullable().optional(),
	training_description: z.string().max(1000).nullable().optional(),
});

// ============================================================================
// Flight Schemas
// ============================================================================

/**
 * Flight form schema - used for creating/editing flights
 */
export const FlightFormSchema = BaseLogSchema.extend({
	pic_id: z.uuid().nullable(),

	// Route information
	departure_airport_code: z.string().min(3).max(4).toUpperCase(),
	departure_runway: z.string().max(10).nullable().optional(),
	destination_airport_code: z.string().min(3).max(4).toUpperCase(),
	destination_runway: z.string().max(10).nullable().optional(),

	// Time information
	block_start: z.iso.time(),
	block_end: z.iso.time(),
	flight_start: z.iso.time(),
	flight_end: z.iso.time(),
	scheduled_start: z.iso.time().nullable().optional(),
	scheduled_end: z.iso.time().nullable().optional(),

	// Duration fields (in minutes)
	total_block_minutes: z.number().int().min(0),
	total_air_minutes: z.number().int().min(0).default(0),
	night_time_minutes: z.number().int().min(0).default(0),
	ifr_time_minutes: z.number().int().min(0).default(0),
	xc_time_minutes: z.number().int().min(0).default(0),
	pic_time_minutes: z.number().int().min(0).default(0),
	dual_time_minutes: z.number().int().min(0).default(0),
	copilot_time_minutes: z.number().int().min(0).default(0),
	instructor_time_minutes: z.number().int().min(0).default(0),

	// Maneuvers
	day_takeoffs: z.number().int().min(0).default(0),
	night_takeoffs: z.number().int().min(0).default(0),
	day_landings: z.number().int().min(0).default(0),
	night_landings: z.number().int().min(0).default(0),
	go_arounds: z.number().int().min(0).default(0),

	// Approaches
	approaches: z.array(z.string()).default([]),

	// Flight status flags
	is_pic: z.boolean().default(false),
	is_solo: z.boolean().default(false),
	is_spic: z.boolean().default(false),
	is_picus: z.boolean().default(false),
	pilot_flying: z.boolean().default(false),

	// Additional metrics
	tach_start: z.number().nonnegative().nullable().optional(),
	tach_end: z.number().nonnegative().nullable().optional(),
	fuel: z.number().int().nonnegative().nullable().optional(),
	passengers: z.number().int().min(0).nullable().optional(),

	// Metadata
	flight_number: z.string().max(20).nullable().optional(),
}).superRefine((data, ctx) => {
	if (!data.is_pic && data.pic_id === null) {
		ctx.addIssue({
			code: "custom",
			path: ["pic_id"],
			message: "pic_id is required when is_pic is false",
		});
	}
});

/**
 * Complete flight schema with database fields
 */
export const FlightSchema = FlightFormSchema.extend({
	id: z.uuid(),
	user_id: z.uuid(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime(),
});

// ============================================================================
// Simulator Session Schemas
// ============================================================================

/**
 * Simulator session form schema - used for creating/editing simulator sessions
 */
export const SimulatorSessionFormSchema = BaseLogSchema.extend({
	instructor_id: z.uuid(),
	session_minutes: z.number().int().min(0),
});

/**
 * Complete simulator session schema with database fields
 */
export const SimulatorSessionSchema = SimulatorSessionFormSchema.extend({
	id: z.uuid(),
	user_id: z.uuid(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime(),
});

// ============================================================================
// Discriminated Union Schema
// ============================================================================

/**
 * Discriminated union for form data - allows type-safe handling of either flight or simulator
 */
export const DiscriminatedSchema = z.discriminatedUnion("type", [
	FlightFormSchema.extend({ type: z.literal("flight") }),
	SimulatorSessionFormSchema.extend({ type: z.literal("simulator") }),
]);

// ============================================================================
// Approach Schema
// ============================================================================

export const ApproachSchema = z.object({
	title: z.string(),
	type: z.enum(["precision", "non-precision", "visual"]).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Flight = z.infer<typeof FlightSchema>;
export type FlightForm = z.infer<typeof FlightFormSchema>;
export type SimulatorSession = z.infer<typeof SimulatorSessionSchema>;
export type SimulatorSessionForm = z.infer<typeof SimulatorSessionFormSchema>;
export type Approach = z.infer<typeof ApproachSchema>;

/**
 * Union type representing any log entry (flight or simulator session)
 */
export type Log =
	| (Flight & { _type: "flight" })
	| (SimulatorSession & { _type: "simulator" });
