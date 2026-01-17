"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { FleetForm } from "@/types/fleet";

/**
 * Create a new fleet asset
 */
export async function createFleet(
	data: FleetForm
): Promise<{ success: boolean; error?: string; fleetId?: string }> {
	try {
		const auth = await getAuthenticatedUser();

		if (!auth) {
			return {
				success: false,
				error: "Authentication required",
			};
		}

		const { supabase, user } = auth;

		const { data: newFleet, error } = await supabase
			.from("fleet")
			.insert({
				user_id: user.id,
				...data,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating fleet asset:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
			fleetId: newFleet.id,
		};
	} catch (error) {
		console.error("Unexpected error creating fleet asset:", error);
		return {
			success: false,
			error: "An unexpected error occurred",
		};
	}
}
