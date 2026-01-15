"use server";

import { getAuthenticatedUser } from "@/actions/get-auth-user";
import { Crew } from "@/types/crew";

export interface FetchCrewParams {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "first-last" | "last-first";
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
  sortBy = "last-first",
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

    // Build the query with sorting based on sortBy preference
    let query = supabase
      .from("crew")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Sort based on sort preference (always group by last name)
    if (sortBy === "last-first") {
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

/**
 * Fetch a single crew member by ID
 */
export async function fetchCrewMember(
  crewId: string
): Promise<{ crew: Crew | null; error?: string }> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return {
        crew: null,
        error: "Authentication required",
      };
    }

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("crew")
      .select("*")
      .eq("id", crewId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching crew member:", error);
      return {
        crew: null,
        error: error.message,
      };
    }

    return {
      crew: data as Crew,
    };
  } catch (error) {
    console.error("Unexpected error fetching crew member:", error);
    return {
      crew: null,
      error: "An unexpected error occurred",
    };
  }
}
