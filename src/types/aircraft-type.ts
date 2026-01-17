import { z } from "zod";

/**
 * Raw aircraft record as stored in JSON
 */
export const AircraftTypeSchema = z.object({
	Model: z.string(),
	Type: z.string(),
	Manufacturer: z.string(),
	Category: z.string(),
	EngineCount: z.number().int().nonnegative(),
	EngineType: z.string(),
});

export type AircraftType = z.infer<typeof AircraftTypeSchema>;

/**
 * Result wrapper (reuse same Result pattern as airports)
 */
export interface Result<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * JSON database shape
 */
export const AircraftDatabaseSchema = z.object({
	aircraft: z.array(AircraftTypeSchema),
});

export type AircraftDatabase = z.infer<typeof AircraftDatabaseSchema>;
