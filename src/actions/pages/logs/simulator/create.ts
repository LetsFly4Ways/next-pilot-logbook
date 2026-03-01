"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { SimulatorSessionPayload } from "@/types/logs";

/**
 * Create a new simulator session log entry
 */
export async function createSimulatorSession(
  data: SimulatorSessionPayload,
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    const { data: newSession, error } = await supabase
      .from("simulator_sessions")
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating simulator session:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      sessionId: newSession.id,
    };
  } catch (error) {
    console.error("Unexpected error creating simulator session:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
