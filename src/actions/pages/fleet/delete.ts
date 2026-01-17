"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";

/**
 * Delete a fleet asset
 */
export async function deleteFleet(
  fleetId: string
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
			.from("fleet")
			.delete()
			.eq("id", fleetId)
			.eq("user_id", user.id);

    if (error) {
      console.error("Error deleting fleet asset:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error deleting fleet asset:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
