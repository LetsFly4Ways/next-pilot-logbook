import { SelectedAirport } from "@/types/logs";
import { Crew } from "@/types/crew";
import { Airport } from "@/types/airports";
import { Fleet } from "@/types/fleet";

const KEY = "flight-form-selection";

export type FlightFormSelectionType =
  | "aircraft"
  | "crew"
  | "departure_airport"
  | "destination_airport"
  | "approaches";

/**
 * Payload for crew selections; when picking an existing crew member we store
 * the full object so that callers have access to other fields (email, phone,
 * etc).  The special self entry simply sets `id` to `null` and adds a
 * `pic_is_self` flag.
 */
export type CrewSelectionPayload = Crew & { pic_is_self?: boolean };

export type FlightFormSelectionPayload =
  | { type: "aircraft"; payload: Fleet }
  | { type: "crew"; payload: CrewSelectionPayload }
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

/** Map Crew to minimal payload for form (pic_id + display) */
export function crewToSelectionPayload(crew: Crew): CrewSelectionPayload {
  // the crew object already satisfies `CrewSelectionPayload` (extra fields
  // are fine), so we just return it directly.  callers can add
  // `pic_is_self` themselves by modifying the object if needed.
  return crew;
}

/** Create a "self" payload for PIC selection (pic_id = null, pic_is_self = true) */
export function selfToSelectionPayload(): Crew & {
  id: null;
  full_name: string;
} {
  return {
    id: null,
    user_id: "",
    first_name: "Self",
    last_name: "",
    email: null,
    phone: null,
    address: null,
    license_number: null,
    company: null,
    company_id: "SELF",
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    full_name: "Self",
  } as Crew & { id: null; full_name: string };
}

/** Map Airport to SelectedAirport for form */
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
