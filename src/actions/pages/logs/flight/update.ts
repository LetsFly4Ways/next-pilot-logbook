"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { FlightForm } from "@/types/logs";

/**
 * Update an existing flight log entry
 */
export async function updateFlight(
	flightId: string,
	data: FlightForm,
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
			.update({
				...data,
				updated_at: new Date().toISOString(),
			})
			.eq("id", flightId)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error updating flight:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Unexpected error updating flight:", error);
		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}
