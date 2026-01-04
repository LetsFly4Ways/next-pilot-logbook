import { z } from "zod";

// Runway schema
const RunwaySchema = z.object({
  ident: z.string(),
  heading: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  elevation_ft: z.string(),
  displaced_threshold_ft: z.string(),
  length_ft: z.string(),
  width_ft: z.string(),
  surface: z.string(),
  lighted: z.boolean(),
  closed: z.boolean(),
});

// Airprot schema
const AirportSchema = z.object({
  icao: z.string(),
  iata: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  elevation: z.number(),
  lat: z.number(),
  lon: z.number(),
  tz: z.string(),
  countryCode: z.string(),
  countryName: z.string(),
  runways: z.array(RunwaySchema),
});

// Country processing metadata schema
const CountryProcessingSchema = z.object({
  total_airports: z.number(),
  countries_resolved: z.number(),
  countries_not_found: z.number(),
  no_country_code: z.number(),
});

// Sources schema
const SourcesSchema = z.object({
  airports: z.string().url(),
  runways: z.string().url(),
});

// Metadata schema
const MetadataSchema = z.object({
  last_updated: z.string().datetime(),
  total_airports: z.number(),
  airports_with_runways: z.number(),
  country_processing: CountryProcessingSchema,
  sources: SourcesSchema,
});

// Main database schema
export const AirportDatabaseSchema = z.object({
  metadata: MetadataSchema,
  airports: z.record(z.string(), AirportSchema),
});

// Type exports for TypeScript usage
export type Runway = z.infer<typeof RunwaySchema>;
export type Airport = z.infer<typeof AirportSchema>;
export type CountryProcessing = z.infer<typeof CountryProcessingSchema>;
export type Sources = z.infer<typeof SourcesSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type AirportDatabase = z.infer<typeof AirportDatabaseSchema>;

// Custom error types for better error handling
export class AirportDataError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "AirportDataError";
  }
}

// Result type for error handling
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type SortBy = "country" | "icao" | "iata";
