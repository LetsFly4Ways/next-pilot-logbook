"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { fetchAsset } from "@/actions/pages/fleet/fetch";
import { getPreferences } from "@/actions/user-preferences";
import { fetchCrewMember } from "@/actions/pages/crew/fetch";
import { getAirportByIcao } from "@/actions/pages/airports/fetch";

import { Crew } from "@/types/crew";
import { Fleet } from "@/types/fleet";
import type {
  FlightRow,
  Log,
  SelectedAirport,
  SimulatorSessionRow,
} from "@/types/logs";

import { formatCrewName } from "@/lib/format-crew";

export interface FetchLogsParams {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "date-desc" | "date-asc";
}

export interface FetchLogsResult {
  logs: Log[];
  totalCount: number;
  hasMore: boolean;
  error?: string;
}

/**
 * Fetch logs (flights and simulator sessions) with pagination and search
 */
export async function fetchLogs({
  searchQuery = "",
  page = 1,
  pageSize = 50,
  sortBy = "date-desc",
}: FetchLogsParams = {}): Promise<FetchLogsResult> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        logs: [],
        totalCount: 0,
        hasMore: false,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    // Build queries for both flights and simulator sessions
    let flightsQuery = supabase
      .from("flights")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    let simQuery = supabase
      .from("simulator_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Add search filter if provided
    if (searchQuery.trim()) {
      const searchPattern = `%${searchQuery}%`;

      flightsQuery = flightsQuery.or(
        `departure_airport_code.ilike.${searchPattern},destination_airport_code.ilike.${searchPattern},flight_number.ilike.${searchPattern},remarks.ilike.${searchPattern},training_description.ilike.${searchPattern}`,
      );

      simQuery = simQuery.or(
        `remarks.ilike.${searchPattern},training_description.ilike.${searchPattern}`,
      );
    }

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Execute queries in parallel
    const [flightsResult, simResult] = await Promise.all([
      flightsQuery,
      simQuery,
    ]);

    if (flightsResult.error) {
      console.error("Error fetching flights:", flightsResult.error);
      return {
        logs: [],
        totalCount: 0,
        hasMore: false,
        error: flightsResult.error.message,
      };
    }

    if (simResult.error) {
      console.error("Error fetching simulator sessions:", simResult.error);
      return {
        logs: [],
        totalCount: 0,
        hasMore: false,
        error: simResult.error.message,
      };
    }

    // Combine and tag entries
    const flights: Log[] = (flightsResult.data || []).map((f) => ({
      ...f,
      _type: "flight" as const,
    }));

    const sims: Log[] = (simResult.data || []).map((s) => ({
      ...s,
      _type: "simulator" as const,
    }));

    const allLogs = [...flights, ...sims];

    // Sort combined results
    allLogs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortBy === "date-desc") {
        // Sort by date descending, then by time if available
        if (dateB !== dateA) return dateB - dateA;

        // For same date, sort by time
        if (a._type === "flight" && b._type === "flight") {
          const flightA = a as FlightRow & { _type: "flight" };
          const flightB = b as FlightRow & { _type: "flight" };
          return (flightB.block_start || "").localeCompare(
            flightA.block_start || "",
          );
        }

        // Simulators go last on same date
        if (a._type === "simulator" && b._type === "flight") return 1;
        if (a._type === "flight" && b._type === "simulator") return -1;

        return 0;
      } else {
        // Sort by date ascending
        if (dateA !== dateB) return dateA - dateB;

        if (a._type === "flight" && b._type === "flight") {
          const flightA = a as FlightRow & { _type: "flight" };
          const flightB = b as FlightRow & { _type: "flight" };
          return (flightA.block_start || "").localeCompare(
            flightB.block_start || "",
          );
        }

        return 0;
      }
    });

    // Calculate total count
    const totalCount = allLogs.length;

    // Paginate
    const paginatedLogs = allLogs.slice(from, to + 1);
    const hasMore = to + 1 < totalCount;

    return {
      logs: paginatedLogs,
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("Unexpected error fetching logs:", error);
    return {
      logs: [],
      totalCount: 0,
      hasMore: false,
      error: "An unexpected error occurred",
    };
  }
}

// ============================================================================
// Extended types
// ============================================================================

/**
 * Flight with all related display data pre-resolved server-side.
 * Passed directly to the form and info views — no client fetches needed.
 */
export type FlightRecord = FlightRow & {
  _aircraft: Fleet | null;
  _pic: (Crew & { full_name: string }) | null;
  _departure_airport: SelectedAirport | null;
  _destination_airport: SelectedAirport | null;
};

export type SimulatorSessionRecord = SimulatorSessionRow & {
  _simulator: Fleet | null;
  _instructor: (Crew & { full_name: string }) | null;
};

export type LogRecord =
  | (FlightRecord & { _type: "flight" })
  | (SimulatorSessionRecord & { _type: "simulator" });

// ============================================================================
// Helpers
// ============================================================================

async function resolveAircraft(aircraft_id: string): Promise<Fleet | null> {
  try {
    const { asset, error } = await fetchAsset(aircraft_id);

    if (error || !asset) {
      return null;
    }

    return asset as Fleet;
  } catch {
    return null;
  }
}

async function resolveCrew(
  pic_id: string,
): Promise<(Crew & { full_name: string }) | null> {
  const { preferences } = await getPreferences();

  try {
    const { crew, error } = await fetchCrewMember(pic_id);

    if (error || !crew) return null;

    const name = formatCrewName(
      crew.first_name,
      crew.last_name,
      preferences?.nameDisplay,
    );

    return {
      id: crew.id,
      user_id: "",
      first_name: crew.first_name,
      last_name: crew.last_name,
      email: crew.email,
      phone: crew.phone,
      address: crew.address,
      license_number: crew.license_number,
      company: crew.company,
      company_id: crew.company_id ?? null,
      note: crew.note,
      created_at: crew.created_at,
      updated_at: crew.updated_at,
      full_name: name,
    } as Crew & { full_name: string };
  } catch {
    return null;
  }
}

function selfCrew(): Crew & { id: null; full_name: string } {
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

async function resolveAirport(icao: string): Promise<SelectedAirport | null> {
  try {
    const result = await getAirportByIcao(icao);
    if (!result.success) return null;
    const a = result.data;
    return {
      icao: a.icao,
      iata: a.iata ?? null,
      name: a.name,
      city: a.city ?? null,
      country: a.countryName,
      lat: a.lat,
      lon: a.lon,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch a single log entry (flight or simulator session) by ID
 */
export async function fetchLog(
  id: string,
  type: "flight" | "simulator",
): Promise<{ log: LogRecord | null; error?: string }> {
  try {
    const auth = await getAuthenticatedUser();

    // Verify auth
    if (!auth) {
      return {
        log: null,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    // Fetch
    const { data: data, error: error } = await supabase
      .from(type === "flight" ? "flights" : "simulator_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    // Error or no data found
    if (error || !data) {
      console.error("Error fetching log entry:", error);

      return {
        log: null,
        error: `Error fetching log entry: ${error?.message || "Unknown error"}`,
      };
    }

    if (type === "flight") {
      const flight = data as FlightRow;

      const [_aircraft, _pic, _departure_airport, _destination_airport] =
        await Promise.all([
          resolveAircraft(flight.aircraft_id),
          flight.pic_is_self
            ? Promise.resolve(selfCrew())
            : flight.pic_id
              ? resolveCrew(flight.pic_id)
              : Promise.resolve(null),
          flight.departure_airport_code
            ? resolveAirport(flight.departure_airport_code)
            : Promise.resolve(null),
          flight.destination_airport_code
            ? resolveAirport(flight.destination_airport_code)
            : Promise.resolve(null),
        ]);

      return {
        log: {
          ...flight,
          _aircraft,
          _pic,
          _departure_airport,
          _destination_airport,
          _type: "flight",
        },
      };
    } else if (type === "simulator") {
      const session = data as SimulatorSessionRow;

      const [_simulator, _instructor] = await Promise.all([
        resolveAircraft(session.aircraft_id),
        session.instructor_is_self
          ? Promise.resolve(selfCrew())
          : session.instructor_id
            ? resolveCrew(session.instructor_id)
            : Promise.resolve(null),
      ]);

      return {
        log: {
          ...session,
          _simulator,
          _instructor,
          _type: "simulator",
        },
      };
    } else {
      return {
        log: null,
        error: "Invalid log type specified",
      };
    }
  } catch (error) {
    console.error("Unexpected error fetching log:", error);

    return {
      log: null,
      error: `An unexpected error occurred: ${error || "Unknown error"}`,
    };
  }
}
