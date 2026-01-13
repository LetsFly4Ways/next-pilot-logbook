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
      // If validation fails, merge with defaults to recover
      const defaults = getDefaultPreferences();
      const merged = deepMerge(defaults, data.preferences || {});
      const recovered = UserPreferencesContentSchema.safeParse(merged);

      if (recovered.success) {
        // Save the recovered preferences back to the database
        await supabase
          .from("user_preferences")
          .update({ preferences: recovered.data })
          .eq("user_id", user.id);

        return {
          success: true,
          preferences: recovered.data,
        };
      }

      // If recovery also fails, return defaults
      return {
        success: true,
        preferences: defaults,
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
    const defaultPreferences = getDefaultPreferences();

    // Parse current preferences or use defaults (with error recovery)
    let current = defaultPreferences;
    if (currentPrefs?.preferences) {
      const parsed = UserPreferencesContentSchema.safeParse(
        currentPrefs.preferences
      );
      if (parsed.success) {
        current = parsed.data;
      } else {
        // If current preferences are invalid, merge with defaults to recover
        current = deepMerge(defaultPreferences, currentPrefs.preferences || {});
        // Validate the recovered preferences
        const recovered = UserPreferencesContentSchema.safeParse(current);
        if (!recovered.success) {
          // If recovery fails, just use defaults
          current = defaultPreferences;
        } else {
          current = recovered.data;
        }
      }
    }

    // Validate nested objects in updates before merging
    // This ensures we catch invalid values early and provides better error messages
    if (updates.airports) {
      const airportsSchema = UserPreferencesContentSchema.shape.airports;
      const airportsValidation = airportsSchema.safeParse(updates.airports);
      if (!airportsValidation.success) {
        return {
          success: false,
          error: `Invalid airports preferences: ${JSON.stringify(
            airportsValidation.error.issues
          )}`,
        };
      }
      // Use validated value for merge
      updates.airports = airportsValidation.data;
    }

    if (updates.logging) {
      const loggingSchema = UserPreferencesContentSchema.shape.logging;
      const loggingValidation = loggingSchema.safeParse(updates.logging);
      if (!loggingValidation.success) {
        return {
          success: false,
          error: `Invalid logging preferences: ${JSON.stringify(
            loggingValidation.error.issues
          )}`,
        };
      }
      updates.logging = loggingValidation.data;
    }

    if (updates.fleet) {
      const fleetSchema = UserPreferencesContentSchema.shape.fleet;
      const fleetValidation = fleetSchema.safeParse(updates.fleet);
      if (!fleetValidation.success) {
        return {
          success: false,
          error: `Invalid fleet preferences: ${JSON.stringify(
            fleetValidation.error.issues
          )}`,
        };
      }
      updates.fleet = fleetValidation.data;
    }

    if (updates.nameDisplay !== undefined) {
      const nameDisplaySchema = UserPreferencesContentSchema.shape.nameDisplay;
      const nameDisplayValidation = nameDisplaySchema.safeParse(
        updates.nameDisplay
      );
      if (!nameDisplayValidation.success) {
        return {
          success: false,
          error: `Invalid nameDisplay preference: ${JSON.stringify(
            nameDisplayValidation.error.issues
          )}`,
        };
      }
      updates.nameDisplay = nameDisplayValidation.data;
    }

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
