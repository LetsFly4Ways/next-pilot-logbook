"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";

/**
 * Delete a simulator session log entry
 */
export async function deleteSimulatorSession(
	sessionId: string,
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
			.delete()
			.eq("id", sessionId)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error deleting simulator session:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Unexpected error deleting simulator session:", error);
		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}
