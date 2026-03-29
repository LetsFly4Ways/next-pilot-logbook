import type { AirportEntry, RouteEntry } from "@/types/statistics";
import { AirportsCardContent } from "./airport-card-content";
import { getAirportCoordinates } from "@/actions/pages/airports/fetch";

export interface ResolvedAirport {
  icao: string;
  lat: number;
  lon: number;
  countryCode: string;
  countryName: string;
}

export interface ResolvedWithCount extends ResolvedAirport {
  code: string;
  count: number;
}

interface Props {
  airports: AirportEntry[];
  routes: RouteEntry[];
}

export async function AirportsCard({ airports, routes }: Props) {
  const codes = airports.map((a) => a.code);
  const result = await getAirportCoordinates(codes);

  const rawResolved: ResolvedAirport[] = result.success ? result.data : [];

  // Pre-merge counts on the server to save client-side computation
  const countMap = new Map(airports.map((a) => [a.code, a.count]));
  const resolvedAirports: ResolvedWithCount[] = rawResolved
    .map((r) => ({
      ...r,
      code: r.icao,
      count: countMap.get(r.icao) ?? 0,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <AirportsCardContent
      airports={airports}
      resolvedAirports={resolvedAirports}
      routes={routes}
    />
  );
}