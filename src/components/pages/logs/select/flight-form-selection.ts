import { SelectedAircraft, SelectedAirport } from "@/types/logs";
import { Crew } from "@/types/crew";
import { Airport } from "@/types/airports";

const KEY = "flight-form-selection";

export type FlightFormSelectionType =
  | "aircraft"
  | "crew"
  | "departure_airport"
  | "destination_airport"
  | "approaches";

export type FlightFormSelectionPayload =
  | { type: "aircraft"; payload: SelectedAircraft }
  | {
      type: "crew";
      payload: {
        id: string | null;
        first_name: string;
        last_name: string;
        code: string;
        pic_is_self?: boolean;
      };
    }
  | {
      type: "departure_airport";
      payload: { airport: SelectedAirport; runway: string | null };
    }
  | {
      type: "destination_airport";
      payload: { airport: SelectedAirport; runway: string | null };
    }
  | { type: "approaches"; payload: string[] };

export function writeFlightFormSelection(
  selection: FlightFormSelectionPayload,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(selection));
}

export function readFlightFormSelection(): FlightFormSelectionPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FlightFormSelectionPayload;
  } catch {
    return null;
  }
}

export function clearFlightFormSelection(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(KEY);
}

/** Map Fleet (from API) to SelectedAircraft for form */
export function fleetToSelectedAircraft(fleet: {
  id: string;
  registration: string;
  type: string | null;
  model: string | null;
  is_simulator: boolean;
}): SelectedAircraft {
  return {
    id: fleet.id,
    registration: fleet.registration,
    type: fleet.type ?? "",
    model: fleet.model ?? "",
    isSimulator: fleet.is_simulator,
  };
}

/** Map Crew to minimal payload for form (pic_id + display) */
export function crewToSelectionPayload(crew: Crew): {
  id: string;
  first_name: string;
  last_name: string;
  code: string;
} {
  return {
    id: crew.id,
    first_name: crew.first_name,
    last_name: crew.last_name ?? "",
    code: crew.company_id ?? "",
  };
}

/** Create a "self" payload for PIC selection (pic_id = null, pic_is_self = true) */
export function selfToSelectionPayload(): {
  id: null;
  first_name: string;
  last_name: string;
  code: string;
  pic_is_self: boolean;
} {
  return {
    id: null,
    first_name: "Self",
    last_name: "",
    code: "SELF",
    pic_is_self: true,
  };
}

/** Map Airport (from API) to SelectedAirport for form */
export function airportToSelectedAirport(airport: Airport): SelectedAirport {
  const iata = airport.iata && airport.iata.length === 3 ? airport.iata : null;
  return {
    icao: airport.icao,
    iata,
    name: airport.name ?? "",
    city: airport.city ?? null,
    country: airport.countryName ?? "",
    lat: airport.lat ?? null,
    lon: airport.lon ?? null,
  };
}
