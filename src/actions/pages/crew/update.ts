"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { CrewForm } from "@/types/crew";

/**
 * Update an existing crew member
 */
export async function updateCrew(
  crewId: string,
  data: CrewForm
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
      .from("crew")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", crewId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating crew member:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error updating crew member:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
