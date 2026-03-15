"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { FlightPayload } from "@/types/logs";

/**
 * Create a new flight log entry
 */
export async function createFlight(
  data: FlightPayload,
): Promise<{ success: boolean; error?: string; flightId?: string }> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    const { data: newFlight, error } = await supabase
      .from("flights")
      .insert({
        user_id: user.id,
        ...data,
        date: new Date(data.date).toDateString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flight:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      flightId: newFlight.id,
    };
  } catch (error) {
    console.error("Unexpected error creating flight:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
