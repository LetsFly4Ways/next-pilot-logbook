"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { Log } from "@/types/flight";

export interface AirportVisit {
  departures: number;
  arrivals: number;
  total: number;
}

/**
 * Get count of departures and arrivals for a specific airport
 */
export async function getAirportVisits(
  icao: string
): Promise<AirportVisit | null> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return null;

    const { supabase, user } = auth;

    // Fetch both departures and arrivals in parallel
    const [departuresResult, arrivalsResult] = await Promise.all([
      supabase
        .from("flights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("departure_airport_code", icao),
      supabase
        .from("flights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("destination_airport_code", icao),
    ]);

    // Check for errors
    if (departuresResult.error) {
      console.error("Error fetching departures count:", departuresResult.error);
      return null;
    }

    if (arrivalsResult.error) {
      console.error("Error fetching arrivals count:", arrivalsResult.error);
      return null;
    }

    const departures = departuresResult.count || 0;
    const arrivals = arrivalsResult.count || 0;

    return {
      departures,
      arrivals,
      total: departures + arrivals,
    };
  } catch (error) {
    console.error("Error in getAirportVisits:", error);
    return null;
  }
}

/**
 * Get all departure flights from a specific airport
 */
export async function getDeparturesFromAirport(icao: string): Promise<Log[]> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return [];

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("flights")
      .select("*")
      .eq("user_id", user.id)
      .eq("departure_airport_code", icao)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching departures:", error);
      return [];
    }

    return (data as Log[]) || [];
  } catch (error) {
    console.error("Error in getDeparturesFromAirport:", error);
    return [];
  }
}

/**
 * Get all arrival flights to a specific airport
 */
export async function getArrivalsToAirport(icao: string): Promise<Log[]> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return [];

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("flights")
      .select("*")
      .eq("user_id", user.id)
      .eq("destination_airport_code", icao)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching arrivals:", error);
      return [];
    }

    return (data as Log[]) || [];
  } catch (error) {
    console.error("Error in getArrivalsToAirport:", error);
    return [];
  }
}

/**
 * Get the top visited airports for the authenticated user
 */
export async function getTopVisitedAirports(limit: number = 10) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return null;

    const { supabase, user } = auth;

    // Fetch all flights with just airport codes
    const { data: flights, error } = await supabase
      .from("flights")
      .select("departure_airport_code, destination_airport_code")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching flights:", error);
      return null;
    }

    if (!flights || flights.length === 0) {
      return [];
    }

    // Count visits per airport
    const airportCounts = new Map<string, number>();

    flights.forEach((flight) => {
      // Count departure airport
      if (flight.departure_airport_code) {
        const current = airportCounts.get(flight.departure_airport_code) || 0;
        airportCounts.set(flight.departure_airport_code, current + 1);
      }

      // Count destination airport
      if (flight.destination_airport_code) {
        const current = airportCounts.get(flight.destination_airport_code) || 0;
        airportCounts.set(flight.destination_airport_code, current + 1);
      }
    });

    // Convert to array, sort, and limit
    const topAirports = Array.from(airportCounts.entries())
      .map(([icao, visits]) => ({ icao, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, limit);

    return topAirports;
  } catch (error) {
    console.error("Error in getTopVisitedAirports:", error);
    return null;
  }
}
