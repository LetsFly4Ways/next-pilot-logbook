"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";

/**
 * Delete a crew member
 */
export async function deleteCrew(
  crewId: string
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
      .delete()
      .eq("id", crewId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting crew member:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error deleting crew member:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
