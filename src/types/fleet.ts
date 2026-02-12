import { z } from "zod";

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Fleet form schema - used for creating/editing aircraft and simulators
 */

export const FleetFormSchema = z.object({
	registration: z.string().min(1, "Registration is required."),
	is_simulator: z.boolean(),
	type: z.string().nullable(),
	model: z.string().nullable(),
	manufacturer: z.string().nullable(),
	category: z.string(), // refine Single Pilot - Single Engine
	engine_count: z.number().int(),
	engine_type: z.string().nullable(),
	passenger_seats: z.number().int(),
	operator: z.string().nullable(),
	status: z.string().nullable(),
	note: z.string().nullable(),
});

/**
 * Complete crew schema with database fields
 */
export const FleetSchema = FleetFormSchema.extend({
	id: z.uuid(),
	user_id: z.uuid(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Fleet = z.infer<typeof FleetSchema>;
export type FleetForm = z.infer<typeof FleetFormSchema>;

// ============================================================================
// Grouping Of Fleet
// ============================================================================

export const FleetGroupBySchema = z.enum(["operator", "icaoType", "type"]);

export type FleetGroupBy = z.infer<typeof FleetGroupBySchema>;

export const GROUP_BY_LABELS: Record<FleetGroupBy, string> = {
	operator: "Operator",
	type: "Aircraft / Sim Type",
	icaoType: "ICAO Type",
};
