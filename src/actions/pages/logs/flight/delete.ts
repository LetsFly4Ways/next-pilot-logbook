"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";

/**
 * Delete a flight log entry
 */
export async function deleteFlight(
	flightId: string,
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
			.from("flights")
			.delete()
			.eq("id", flightId)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error deleting flight:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Unexpected error deleting flight:", error);
		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}
