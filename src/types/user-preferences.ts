import { z } from "zod";
import { FunctionSchema } from "@/types/logs";
import { FleetGroupBySchema } from "@/types/fleet";
import { DistanceUnitSchema, SortAirportBySchema } from "@/types/airports";

// Schema for the preferences JSONB column content
export const UserPreferencesContentSchema = z.object({
  logging: z.object({
    defaultFunction: FunctionSchema,
    fields: z.object({
      hobbs: z.boolean(),
      tach: z.boolean(),
      duty: z.boolean(),
      scheduled: z.boolean(),
      xc: z.boolean(),
      passengers: z.boolean(),
      fuel: z.boolean(),
      approaches: z.boolean(),
      training: z.boolean(),
      go_arounds: z.boolean(),
    }),
  }),
  fleet: z.object({
    grouping: FleetGroupBySchema,
  }),
  airports: z.object({
    sorting: SortAirportBySchema,
    distanceUnit: DistanceUnitSchema,
  }),
  nameDisplay: z.enum(["first-last", "last-first"]),
});

// Schema for the entire user_preferences table row
export const UserPreferencesRowSchema = z.object({
  user_id: z.uuid(),
  preferences: UserPreferencesContentSchema,
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

// Type exports
export type UserPreferences = z.infer<typeof UserPreferencesContentSchema>;
export type UserPreferencesRow = z.infer<typeof UserPreferencesRowSchema>;

// Helper to get default preferences
export function getDefaultPreferences(): UserPreferences {
  return {
    logging: {
      defaultFunction: "PIC",
      fields: {
        hobbs: true,
        tach: true,
        duty: false,
        scheduled: false,
        xc: true,
        passengers: false,
        fuel: false,
        approaches: false,
        training: false,
        go_arounds: true,
      },
    },
    fleet: {
      grouping: "type",
    },
    airports: {
      sorting: "icao",
      distanceUnit: "m",
    },
    nameDisplay: "first-last",
  };
}
