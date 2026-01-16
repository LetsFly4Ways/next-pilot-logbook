"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { FleetForm } from "@/types/fleet";

/**
 * Update an existing fleet asset
 */
export async function updateFleet(
	fleetId: string,
	data: FleetForm
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
			.update({
				...data,
				updated_at: new Date().toISOString(),
			})
			.eq("id", fleetId)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error updating fleet asset:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Unexpected error updating fleet asset:", error);
		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}
