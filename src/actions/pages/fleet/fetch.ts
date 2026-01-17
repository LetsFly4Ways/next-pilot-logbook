"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { Fleet } from "@/types/fleet";

export interface FetchFleetParams {
	searchQuery?: string;
	page?: number;
	pageSize?: number;
}

export interface FetchFleetResult {
	fleet: Fleet[];
	totalCount: number;
	hasMore: boolean;
	error?: string;
}

/**
 * Fetch fleet from Supabase with pagination and search
 */
export async function fetchFleet({
	searchQuery = "",
	page = 1,
	pageSize = 50,
}: FetchFleetParams = {}): Promise<FetchFleetResult> {
	try {
		const auth = await getAuthenticatedUser();

		if (!auth) {
			return {
				fleet: [],
				totalCount: 0,
				hasMore: false,
				error: "Authentication required",
			};
		}

		const { supabase, user } = auth;

		// Build the query with sorting based on sortBy preference
		let query = supabase
			.from("fleet")
			.select("*", { count: "exact" })
			.eq("user_id", user.id);

		// Add search filter if provided
		if (searchQuery.trim()) {
			query = query.or(
				`registration.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%,operator.ilike.%${searchQuery}%`,
			);
		}

		// Add pagination
		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		// Execute query
		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching fleet:", error);
			return {
				fleet: [],
				totalCount: 0,
				hasMore: false,
				error: error.message,
			};
		}

		const totalCount = count || 0;
		const hasMore = from + (data?.length || 0) < totalCount;

		return {
			fleet: (data as Fleet[]) || [],
			totalCount,
			hasMore,
		};
	} catch (error) {
		console.error("Unexpected error fetching fleet:", error);
		return {
			fleet: [],
			totalCount: 0,
			hasMore: false,
			error: "An unexpected error occurred",
		};
	}
}

export async function fetchAsset(
	assetId: string,
): Promise<{ asset: Fleet | null; error?: string }> {
	try {
		const auth = await getAuthenticatedUser();

		if (!auth) {
			return {
				asset: null,
				error: "Authentication required",
			};
		}

		const { supabase, user } = auth;

		const { data, error } = await supabase
			.from("fleet")
			.select("*")
			.eq("id", assetId)
			.eq("user_id", user.id)
			.single();

		if (error) {
			console.error("Error fetching fleet asset:", error);
			return {
				asset: null,
				error: error.message,
			};
		}

		return {
			asset: data as Fleet,
		};
	} catch (error) {
		console.error("Unexpected error fetching fleet asset:", error);
		return {
			asset: null,
			error: "An unexpected error occurred",
		};
	}
}

export async function fetchAssetsByIds(
	ids: string[],
): Promise<{ assets: Fleet[]; error?: string }> {
	if (!ids.length) return { assets: [] };

	const auth = await getAuthenticatedUser();
	if (!auth) {
		return { assets: [], error: "Authentication required" };
	}

	const { supabase, user } = auth;

	const { data, error } = await supabase
		.from("fleet")
		.select("*")
		.eq("user_id", user.id)
		.in("id", ids);

	if (error) {
		console.error(error);
		return { assets: [], error: error.message };
	}

	return { assets: data as Fleet[] };
}
