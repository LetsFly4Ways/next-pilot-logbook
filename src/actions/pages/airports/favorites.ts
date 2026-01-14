"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import { revalidatePath } from "next/cache";

/**
 * Get authenticated user helper
 */
async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("User not authenticated:", error);
    return null;
  }

  return { supabase, user };
}

/**
 * Get all favorite airport ICAOs for the current user
 */
export async function getFavoriteAirports(): Promise<string[]> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return [];

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("user_preferences")
      .select("favorite_airports")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching favorite airports:", error);
      return [];
    }

    return data?.favorite_airports || [];
  } catch (error) {
    console.error("Error in getFavoriteAirports:", error);
    return [];
  }
}

/**
 * Check if a specific airport is favorited
 */
export async function isAirportFavorited(icao: string): Promise<boolean> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return false;

    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("user_preferences")
      .select("favorite_airports")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }

    const favorites = data?.favorite_airports || [];
    return favorites.includes(icao.toUpperCase());
  } catch (error) {
    console.error("Error in isAirportFavorited:", error);
    return false;
  }
}

/**
 * Add an airport to favorites
 */
export async function addFavoriteAirport(icao: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return { success: false, error: "Not authenticated" };
    }

    const { supabase, user } = auth;
    const upperIcao = icao.toUpperCase();

    // Get current favorites
    const { data: currentData, error: fetchError } = await supabase
      .from("user_preferences")
      .select("favorite_airports")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching current favorites:", fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentFavorites = currentData?.favorite_airports || [];

    // Don't add if already exists
    if (currentFavorites.includes(upperIcao)) {
      return { success: true };
    }

    // Add to array
    const { error: updateError } = await supabase
      .from("user_preferences")
      .update({
        favorite_airports: [...currentFavorites, upperIcao],
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error adding favorite airport:", updateError);
      return { success: false, error: updateError.message };
    }

    // Revalidate relevant paths
    revalidatePath("/app/airports");
    revalidatePath(`/app/airports/${icao}`);

    return { success: true };
  } catch (error) {
    console.error("Error in addFavoriteAirport:", error);
    return { success: false, error: "Failed to add favorite" };
  }
}

/**
 * Remove an airport from favorites
 */
export async function removeFavoriteAirport(icao: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return { success: false, error: "Not authenticated" };
    }

    const { supabase, user } = auth;
    const upperIcao = icao.toUpperCase();

    // Get current favorites
    const { data: currentData, error: fetchError } = await supabase
      .from("user_preferences")
      .select("favorite_airports")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching current favorites:", fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentFavorites = currentData?.favorite_airports || [];

    // Filter out the airport
    const { error: updateError } = await supabase
      .from("user_preferences")
      .update({
        favorite_airports: currentFavorites.filter(
          (f: string) => f !== upperIcao
        ),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error removing favorite airport:", updateError);
      return { success: false, error: updateError.message };
    }

    // Revalidate relevant paths
    revalidatePath("/app/airports");
    revalidatePath(`/app/airports/${icao}`);

    return { success: true };
  } catch (error) {
    console.error("Error in removeFavoriteAirport:", error);
    return { success: false, error: "Failed to remove favorite" };
  }
}

/**
 * Toggle favorite status for an airport
 */
export async function toggleFavoriteAirport(icao: string): Promise<{
  success: boolean;
  isFavorited: boolean;
  error?: string;
}> {
  try {
    const isFavorited = await isAirportFavorited(icao);

    if (isFavorited) {
      const result = await removeFavoriteAirport(icao);
      return { ...result, isFavorited: false };
    } else {
      const result = await addFavoriteAirport(icao);
      return { ...result, isFavorited: true };
    }
  } catch (error) {
    console.error("Error in toggleFavoriteAirport:", error);
    return {
      success: false,
      isFavorited: false,
      error: "Failed to toggle favorite",
    };
  }
}
