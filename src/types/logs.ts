import { z } from "zod";
import { UserPreferences } from "@/types/user-preferences";
import { FleetSchema } from "@/types/fleet";
import { CrewSchema } from "@/types/crew";

// ============================================================================
// Selected Airport Schemas
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
// Pilot Function Schema
// ============================================================================

export const FunctionSchema = z.enum([
  "PIC",
  "Co-Pilot",
  "Dual",
  "Instructor",
  "Solo",
  "SPIC",
  "PICUS",
]);

export type PilotFunction = z.infer<typeof FunctionSchema>;

export const functionOptions = FunctionSchema.options.map((val) => ({
  label: val === "PICUS" ? "PICUS" : val, // Customize labels if needed
  value: val,
}));

/** Functions available when the logged-in user is themselves PIC (pic_id === null). */
export const SELF_PIC_FUNCTIONS: string[] = [
  "PIC",
  "Solo",
  "Instructor",
] satisfies PilotFunction[];

export const OTHER_PIC_FUNCTIONS: string[] = [
  "Co-Pilot",
  "Dual",
  "SPIC",
  "PICUS",
] satisfies PilotFunction[];

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Common fields shared between flights and simulator sessions
 */
const BaseLogSchema = z.object({
  // the date field comes from a native HTML <input type="date" /> which
  // always produces a string ("YYYY-MM-DD"). we accept both Date objects and
  // strings here by preprocessing so that callers of `parse` don't have to
  // worry about converting the value first. this also keeps the schema
  // compatible with drafts that are serialized to/from JSON.
  date: z.preprocess((val) => {
    if (val instanceof Date) return val;
    if (typeof val === "string" && val) {
      // `new Date("YYYY-MM-DD")` produces a valid date in local time
      return new Date(val);
    }
    return val;
  }, z.date()),
  aircraft_id: z.uuid("Aircraft is required"),
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
export const FlightPayloadSchema = BaseLogSchema.extend({
  pic_id: z.uuid().nullable(),
  pic_is_self: z.boolean().default(false),

  // Route information
  departure_airport_code: z
    .string()
    .min(3, "Departure airport is required")
    .max(4, "Departure airport invalid")
    .toUpperCase(),
  departure_runway: z.string().max(10).nullable().optional(),
  destination_airport_code: z
    .string()
    .min(3, "Destination airport is required")
    .max(4, "Destination airport invalid")
    .toUpperCase(),
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

  // Maneuvers
  day_takeoffs: z.number().int().min(0).optional().default(0),
  night_takeoffs: z.number().int().min(0).optional().default(0),
  day_landings: z.number().int().min(0).optional().default(0),
  night_landings: z.number().int().min(0).optional().default(0),
  go_arounds: z.number().int().min(0).optional().default(0),

  // Approaches
  approaches: z.array(z.string()).nullable().default([]),

  // Flight status flags
  function: FunctionSchema,
  pilot_flying: z.boolean().default(false),

  // Additional metrics
  tach_start: z.number().nonnegative().nullable().optional(),
  tach_end: z.number().nonnegative().nullable().optional(),
  fuel: z.number().int().nonnegative().nullable().optional(),
  passengers: z.number().int().min(0).nullable().optional(),

  // Metadata
  flight_number: z.string().max(20).nullable().optional(),
}).superRefine((data, ctx) => {
  if (!data.pic_is_self && data.pic_id === null) {
    ctx.addIssue({
      code: "custom",
      path: ["pic_id"],
      message: "PIC is required",
    });
  }
});

export type FlightPayload = z.infer<typeof FlightPayloadSchema>;

/**
 * Flight Input schema for form
 */
export const FlightFormSchema = FlightPayloadSchema.extend({
  // Form convenience; not submitted
  aircraft: FleetSchema.optional().nullable(),
  departure_airport: SelectedAirportSchema.nullable(),
  destination_airport: SelectedAirportSchema.nullable(),
  pic: CrewSchema.nullable().optional(),
});

export type FlightFormValues = z.input<typeof FlightFormSchema>;

/**
 * Complete flight schema with database fields
 */
export const FlightRowSchema = FlightPayloadSchema.extend({
  id: z.uuid(),
  user_id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type FlightRow = Omit<z.infer<typeof FlightRowSchema>, "date"> & {
  date: string;
};

// ============================================================================
// Simulator Session Schemas
// ============================================================================

/**
 * Simulator session form schema - used for creating/editing simulator sessions
 */
export const SimulatorSessionPayloadSchema = BaseLogSchema.extend({
  instructor_id: z.uuid().nullable(),
  instructor_is_self: z.boolean().default(false),
  session_minutes: z.number().int().min(0),
}).superRefine((data, ctx) => {
  if (!data.instructor_is_self && data.instructor_id === null) {
    ctx.addIssue({
      code: "custom",
      path: ["instructor_id"],
      message: "Instructor is required",
    });
  }
});

export type SimulatorSessionPayload = z.infer<
  typeof SimulatorSessionPayloadSchema
>;

/**
 * Flight Input schema for form
 */
export const SimulatorSessionFormSchema = SimulatorSessionPayloadSchema.extend({
  // This is only for form convenience; not submitted
  simulator: FleetSchema.optional().nullable(),
  instructor: CrewSchema.nullable().optional(),
});

export type SimulatorSessionFormValues = z.input<
  typeof SimulatorSessionFormSchema
>;

/**
 * Complete simulator session schema with database fields
 */
export const SimulatorSessionRowSchema = SimulatorSessionPayloadSchema.extend({
  id: z.uuid(),
  user_id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type SimulatorSessionRow = Omit<
  z.infer<typeof SimulatorSessionRowSchema>,
  "date"
> & { date: string };

// ============================================================================
// Discriminated Union Schema
// ============================================================================

/**
 * Discriminated union for form data - allows type-safe handling of either flight or simulator
 */
export const DiscriminatedSchema = z.discriminatedUnion("type", [
  FlightPayloadSchema.extend({ type: z.literal("flight") }),
  SimulatorSessionPayloadSchema.extend({ type: z.literal("simulator") }),
]);

// ============================================================================
// Logging Fields
// ============================================================================

// Define a record of all logging fields with their display labels
// If you add a field to the Zod schema and not here, TS will throw an error.
export const LOGGING_FIELD_LABELS: Record<
  keyof UserPreferences["logging"]["fields"],
  string
> = {
  hobbs: "Hobbs Time",
  tach: "Tach Time",
  duty: "Duty Time",
  scheduled: "Scheduled Time",
  xc: "Cross-Country Time",
  go_arounds: "Go-Arounds",
  approaches: "Approaches",
  fuel: "Fuel",
  passengers: "Passengers",
  training: "Training Description",
};

// ============================================================================
// Type Export
// ============================================================================

/**
 * Union type representing any log entry (flight or simulator session)
 */
export type Log =
  | (FlightRow & { _type: "flight" })
  | (SimulatorSessionRow & { _type: "simulator" });
