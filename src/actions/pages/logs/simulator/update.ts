"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { SimulatorSessionPayload } from "@/types/logs";

/**
 * Update an existing simulator session log entry
 */
export async function updateSimulatorSession(
  sessionId: string,
  data: SimulatorSessionPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    const { error } = await supabase
      .from("simulator_sessions")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating simulator session:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error updating simulator session:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
