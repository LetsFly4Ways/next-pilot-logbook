"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import {
  getDefaultPreferences,
  UserPreferences,
  UserPreferencesContentSchema,
  UserPreferencesRow,
} from "@/types/user-preferences";

// Helper function for deep merge with proper typing
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key as keyof T] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      output[key as keyof T] = sourceValue as T[keyof T];
    }
  });

  return output;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

// Get user preferences
export async function getPreferences() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated", preferences: null };
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No preferences exist - create defaults
        const defaults = getDefaultPreferences();

        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            preferences: defaults,
          });

        if (insertError) {
          console.error("Failed to create default preferences:", insertError);
          return { success: true, preferences: defaults }; // Still return defaults
        }

        return { success: true, preferences: defaults };
      }
      return { success: false, error: error.message, preferences: null };
    }

    const validated = UserPreferencesContentSchema.safeParse(data.preferences);

    if (!validated.success) {
      return {
        success: false,
        error: "Invalid preferences data",
        preferences: null,
      };
    }

    return {
      success: true,
      preferences: validated.data,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      preferences: null,
    };
  }
}

// Update user preferences (partial update with deep merge)
export async function updatePreferences(updates: Partial<UserPreferences>) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch current preferences
    const { data: currentPrefs } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single();

    // Get default preferences
    const defaultPreferences = UserPreferencesContentSchema.parse({});

    // Parse current preferences or use defaults
    const current = currentPrefs?.preferences
      ? UserPreferencesContentSchema.parse(currentPrefs.preferences)
      : defaultPreferences;

    // Deep merge with new preferences
    const updatedPreferences = deepMerge(current, updates);

    // Validate merged preferences
    const validated = UserPreferencesContentSchema.parse(updatedPreferences);

    // Upsert (insert or update)
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        preferences: validated,
      } as unknown as UserPreferencesRow,
      { onConflict: "user_id" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");

    return {
      success: true,
      preferences: validated,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

// Reset preferences to default
export async function resetPreferences() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Use Zod defaults
    const defaultPreferences = getDefaultPreferences();

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        preferences: defaultPreferences,
      } as unknown as UserPreferencesRow,
      { onConflict: "user_id" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
