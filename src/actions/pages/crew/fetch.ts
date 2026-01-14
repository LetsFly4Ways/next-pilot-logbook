"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { Crew } from "@/types/crew";

export interface FetchCrewParams {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  nameDisplay?: "first-last" | "last-first";
}

export interface FetchCrewResult {
  crews: Crew[];
  totalCount: number;
  hasMore: boolean;
  error?: string;
}

/**
 * Fetch crew members from Supabase with pagination and search
 */
export async function fetchCrewMembers({
  searchQuery = "",
  page = 1,
  pageSize = 50,
  nameDisplay = "first-last",
}: FetchCrewParams = {}): Promise<FetchCrewResult> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        crews: [],
        totalCount: 0,
        hasMore: false,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    // Build the query
    let query = supabase
      .from("crew")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    // Sort based on name display preference
    if (nameDisplay === "last-first") {
      query = query
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true });
    } else {
      query = query
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true });
    }

    // Add search filter if provided
    if (searchQuery.trim()) {
      query = query.or(
        `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`
      );
    }

    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching crew members:", error);
      return {
        crews: [],
        totalCount: 0,
        hasMore: false,
        error: error.message,
      };
    }

    const totalCount = count || 0;
    const hasMore = from + (data?.length || 0) < totalCount;

    return {
      crews: (data as Crew[]) || [],
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("Unexpected error fetching crew members:", error);
    return {
      crews: [],
      totalCount: 0,
      hasMore: false,
      error: "An unexpected error occurred",
    };
  }
}
