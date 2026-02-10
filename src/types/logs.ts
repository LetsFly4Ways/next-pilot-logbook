import { z } from "zod";

// ============================================================================
// Selected Aircraft Schemas
// ============================================================================

export const SelectedAircraftSchema = z.object({
  id: z.uuid(), // aircraft_id for submission
  registration: z.string(), // for UI display
  type: z.string(), // ICAO type
  model: z.string(), // aircraft model
  isSimulator: z.boolean().optional().default(false),
});
export type SelectedAircraft = z.infer<typeof SelectedAircraftSchema>;

// ============================================================================
// Selected Airprot Schemas
// ============================================================================

export const SelectedAirportSchema = z.object({
  icao: z.string().min(3).max(4),
  iata: z.string().min(3).max(3).nullable(),
  name: z.string(),
  city: z.string().nullable(),
  country: z.string(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
});

export type SelectedAirport = z.infer<typeof SelectedAirportSchema>;

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
  duty_time_minutes: z.number().int().min(0).optional().default(0),
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
  total_air_minutes: z.number().int().min(0).optional().default(0),
  night_time_minutes: z.number().int().min(0).optional().default(0),
  ifr_time_minutes: z.number().int().min(0).optional().default(0),
  xc_time_minutes: z.number().int().min(0).optional().default(0),
  pic_time_minutes: z.number().int().min(0).optional().default(0),
  dual_time_minutes: z.number().int().min(0).optional().default(0),
  copilot_time_minutes: z.number().int().min(0).optional().default(0),
  instructor_time_minutes: z.number().int().min(0).optional().default(0),

  // Maneuvers
  day_takeoffs: z.number().int().min(0).optional().default(0),
  night_takeoffs: z.number().int().min(0).optional().default(0),
  day_landings: z.number().int().min(0).optional().default(0),
  night_landings: z.number().int().min(0).optional().default(0),
  go_arounds: z.number().int().min(0).optional().default(0),

  // Approaches
  approaches: z.array(z.string()).optional().default([]),

  // Flight status flags
  is_pic: z.boolean().optional().default(false),
  is_solo: z.boolean().optional().default(false),
  is_spic: z.boolean().optional().default(false),
  is_picus: z.boolean().optional().default(false),
  pilot_flying: z.boolean().optional().default(false),

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
 * Flight Input schema for form
 */
export const FlightFormInputSchema = FlightFormSchema.extend({
  // This is only for form convenience; not submitted
  aircraft: SelectedAircraftSchema.optional().nullable(),
  departure_airport: SelectedAirportSchema.nullable(),
  destination_airport: SelectedAirportSchema.nullable(),
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
  instructor_is_self: z.boolean().default(false),
  session_minutes: z.number().int().min(0),
}).superRefine((data, ctx) => {
  if (!data.instructor_is_self && data.instructor_id === null) {
    ctx.addIssue({
      code: "custom",
      path: ["instructor_id"],
      message: "instructor_id is required when instructor_is_self is false",
    });
  }
});

/**
 * Flight Input schema for form
 */
export const SimulatorSessionFormInputSchema =
  SimulatorSessionFormSchema.extend({
    // This is only for form convenience; not submitted
    simulator: SelectedAircraftSchema.optional().nullable(),
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
// Type Exports
// ============================================================================

export type Flight = z.infer<typeof FlightSchema>;
export type FlightForm = z.infer<typeof FlightFormSchema>;
export type FlightFormInput = z.input<typeof FlightFormInputSchema>;
export type SimulatorSession = z.infer<typeof SimulatorSessionSchema>;
export type SimulatorSessionForm = z.infer<typeof SimulatorSessionFormSchema>;
export type SimulatorSessionFormInput = z.input<
  typeof SimulatorSessionFormInputSchema
>;

/**
 * Union type representing any log entry (flight or simulator session)
 */
export type Log =
  | (Flight & { _type: "flight" })
  | (SimulatorSession & { _type: "simulator" });
