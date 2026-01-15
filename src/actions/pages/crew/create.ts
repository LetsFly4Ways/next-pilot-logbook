"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { CrewForm } from "@/types/crew";

/**
 * Create a new crew member
 */
export async function createCrew(
  data: CrewForm
): Promise<{ success: boolean; error?: string; crewId?: string }> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    const { data: newCrew, error } = await supabase
      .from("crew")
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating crew member:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      crewId: newCrew.id,
    };
  } catch (error) {
    console.error("Unexpected error creating crew member:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
