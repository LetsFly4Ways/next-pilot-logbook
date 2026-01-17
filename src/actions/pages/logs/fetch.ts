"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import type { Flight, Log } from "@/types/logs";

export interface FetchLogsParams {
	searchQuery?: string;
	page?: number;
	pageSize?: number;
	sortBy?: "date-desc" | "date-asc";
}

export interface FetchLogsResult {
	logs: Log[];
	totalCount: number;
	hasMore: boolean;
	error?: string;
}

/**
 * Fetch logs (flights and simulator sessions) with pagination and search
 */
export async function fetchLogs({
	searchQuery = "",
	page = 1,
	pageSize = 50,
	sortBy = "date-desc",
}: FetchLogsParams = {}): Promise<FetchLogsResult> {
	try {
		const auth = await getAuthenticatedUser();

		if (!auth) {
			return {
				logs: [],
				totalCount: 0,
				hasMore: false,
				error: "Authentication required",
			};
		}

		const { supabase, user } = auth;

		// Build queries for both flights and simulator sessions
		let flightsQuery = supabase
			.from("flights")
			.select("*", { count: "exact" })
			.eq("user_id", user.id);

		let simQuery = supabase
			.from("simulator_sessions")
			.select("*", { count: "exact" })
			.eq("user_id", user.id);

		// Add search filter if provided
		if (searchQuery.trim()) {
			const searchPattern = `%${searchQuery}%`;

			flightsQuery = flightsQuery.or(
				`departure_airport_code.ilike.${searchPattern},destination_airport_code.ilike.${searchPattern},flight_number.ilike.${searchPattern},remarks.ilike.${searchPattern},training_description.ilike.${searchPattern}`,
			);

			simQuery = simQuery.or(
				`remarks.ilike.${searchPattern},training_description.ilike.${searchPattern}`,
			);
		}

		// Calculate pagination range
		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;

		// Execute queries in parallel
		const [flightsResult, simResult] = await Promise.all([
			flightsQuery,
			simQuery,
		]);

		if (flightsResult.error) {
			console.error("Error fetching flights:", flightsResult.error);
			return {
				logs: [],
				totalCount: 0,
				hasMore: false,
				error: flightsResult.error.message,
			};
		}

		if (simResult.error) {
			console.error("Error fetching simulator sessions:", simResult.error);
			return {
				logs: [],
				totalCount: 0,
				hasMore: false,
				error: simResult.error.message,
			};
		}

		// Combine and tag entries
		const flights: Log[] = (flightsResult.data || []).map((f) => ({
			...f,
			_type: "flight" as const,
		}));

		const sims: Log[] = (simResult.data || []).map((s) => ({
			...s,
			_type: "simulator" as const,
		}));

		const allLogs = [...flights, ...sims];

		// Sort combined results
		allLogs.sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			if (sortBy === "date-desc") {
				// Sort by date descending, then by time if available
				if (dateB !== dateA) return dateB - dateA;

				// For same date, sort by time
				if (a._type === "flight" && b._type === "flight") {
					const flightA = a as Flight & { _type: "flight" };
					const flightB = b as Flight & { _type: "flight" };
					return (flightB.block_start || "").localeCompare(
						flightA.block_start || "",
					);
				}

				// Simulators go last on same date
				if (a._type === "simulator" && b._type === "flight") return 1;
				if (a._type === "flight" && b._type === "simulator") return -1;

				return 0;
			} else {
				// Sort by date ascending
				if (dateA !== dateB) return dateA - dateB;

				if (a._type === "flight" && b._type === "flight") {
					const flightA = a as Flight & { _type: "flight" };
					const flightB = b as Flight & { _type: "flight" };
					return (flightA.block_start || "").localeCompare(
						flightB.block_start || "",
					);
				}

				return 0;
			}
		});

		// Calculate total count
		const totalCount = allLogs.length;

		// Paginate
		const paginatedLogs = allLogs.slice(from, to + 1);
		const hasMore = to + 1 < totalCount;

		return {
			logs: paginatedLogs,
			totalCount,
			hasMore,
		};
	} catch (error) {
		console.error("Unexpected error fetching logs:", error);
		return {
			logs: [],
			totalCount: 0,
			hasMore: false,
			error: "An unexpected error occurred",
		};
	}
}

/**
 * Fetch a single log entry (flight or simulator session) by ID
 */
export async function fetchLog(
	logId: string,
): Promise<{ log: Log | null; error?: string }> {
	try {
		const auth = await getAuthenticatedUser();

		if (!auth) {
			return {
				log: null,
				error: "Authentication required",
			};
		}

		const { supabase, user } = auth;

		// Try fetching as flight first
		const { data: flightData, error: flightError } = await supabase
			.from("flights")
			.select("*")
			.eq("id", logId)
			.eq("user_id", user.id)
			.single();

		if (flightData) {
			return {
				log: { ...flightData, _type: "flight" as const },
			};
		}

		// If not a flight, try simulator session
		const { data: simData, error: simError } = await supabase
			.from("simulator_sessions")
			.select("*")
			.eq("id", logId)
			.eq("user_id", user.id)
			.single();

		if (simData) {
			return {
				log: { ...simData, _type: "simulator" as const },
			};
		}

		if (flightError || simError) {
			console.error("Error fetching log entry:", flightError || simError);
			return {
				log: null,
				error: (flightError || simError)?.message || "Log entry not found",
			};
		}

		// Not found in either table
		return {
			log: null,
			error: "Log entry not found",
		};
	} catch (error) {
		console.error("Unexpected error fetching log:", error);
		return {
			log: null,
			error: "An unexpected error occurred",
		};
	}
}
