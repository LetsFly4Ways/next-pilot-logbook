"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import {
  getDefaultPreferences,
  UserPreferences,
  UserPreferencesContentSchema,
} from "@/types/user-preferences";
import {
  getPreferences,
  updatePreferences as updatePrefsAction,
} from "@/actions/user-preferences";

const PREFERENCES_COOKIE_NAME = "nplb_user_preferences";

// Helper to get preferences from cookie
function getPreferencesFromCookie(): UserPreferences | null {
  if (typeof document === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    const prefCookie = cookies.find((c) =>
      c.trim().startsWith(`${PREFERENCES_COOKIE_NAME}=`)
    );

    if (!prefCookie) return null;

    const value = prefCookie.split("=")[1];
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);

    // Validate with Zod schema
    return UserPreferencesContentSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse preferences cookie:", error);
    return null;
  }
}

// Helper to save preferences to cookie
function savePreferencesToCookie(preferences: UserPreferences) {
  if (typeof document === "undefined") return;

  try {
    const encoded = encodeURIComponent(JSON.stringify(preferences));
    // Set cookie with 1 year expiry
    const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds
    document.cookie = `${PREFERENCES_COOKIE_NAME}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to save preferences cookie:", error);
  }
}

interface PreferencesContextType {
  preferences: UserPreferences;
  getPreference: <K extends keyof UserPreferences>(
    key: K
  ) => UserPreferences[K];
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

interface PreferencesProviderProps {
  children: ReactNode;
  initialPreferences?: UserPreferences | null;
}

// Helper function for deep merge (client-side version)
function deepMergePreferences(
  target: UserPreferences,
  source: Partial<UserPreferences>
): UserPreferences {
  const output: Record<string, unknown> = { ...target };

  (Object.keys(source) as Array<keyof UserPreferences>).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (sourceValue === undefined) {
      return;
    }

    if (isObject(sourceValue) && isObject(targetValue)) {
      // Deep merge for nested objects
      output[key] = {
        ...targetValue,
        ...sourceValue,
      };
    } else {
      // Direct assignment for primitives
      output[key] = sourceValue;
    }
  });

  return output as UserPreferences;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

// Provider for user preferences for global layout
export function PreferencesProvider({
  children,
  initialPreferences,
}: PreferencesProviderProps) {
  // Get defaults from Zod schema
  const defaultPreferences = getDefaultPreferences();

  // Always use initialPreferences or defaults for initial state to avoid hydration mismatch
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || defaultPreferences
  );
  const [isLoading, setIsLoading] = useState(!initialPreferences);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refresh preferences from server
  const refreshPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPreferences();

      if (result.success && result.preferences) {
        // Validate with Zod schema
        const validated = UserPreferencesContentSchema.parse(
          result.preferences
        );
        setPreferences(validated);
        // Update cookie with fresh data
        savePreferencesToCookie(validated);
      } else if (result.success && !result.preferences) {
        // No preferences found in DB - use defaults
        setPreferences(defaultPreferences);
        savePreferencesToCookie(defaultPreferences);
      } else {
        console.error("Failed to fetch preferences:", result.error);
        // Keep current preferences on error
      }
    } catch (error) {
      console.error("Failed to refresh preferences:", error);
      // Keep current preferences on error
    } finally {
      setIsLoading(false);
    }
  }, [defaultPreferences]);

  // Hydrate from cookie OR server preferences after mount (client-side only)
  useEffect(() => {
    if (!isInitialized) {
      if (initialPreferences) {
        // Server preferences take priority - update cookie to match
        setPreferences(initialPreferences);
        savePreferencesToCookie(initialPreferences);
        setIsLoading(false);
      } else {
        // No server preferences - try cookie first for instant display
        const cookiePrefs = getPreferencesFromCookie();
        if (cookiePrefs) {
          try {
            // Validate cookie preferences with current schema
            const validated = UserPreferencesContentSchema.parse(cookiePrefs);
            setPreferences(validated);
            setIsLoading(false);
            // Still fetch from Supabase in background to ensure sync
            refreshPreferences();
          } catch (error) {
            console.error(
              "Cookie preferences invalid, fetching from server:",
              error
            );
            refreshPreferences();
          }
        } else {
          // No cookie either - fetch from server with loading state
          refreshPreferences();
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized, initialPreferences, refreshPreferences]);

  // Debug: Log initial preferences
  //   useEffect(() => {
  //     console.log(
  //       "PreferencesProvider - Initial preferences:",
  //       initialPreferences
  //     );
  //     console.log(
  //       "PreferencesProvider - Cookie preferences:",
  //       getPreferencesFromCookie()
  //     );
  //     console.log("PreferencesProvider - Current preferences:", preferences);
  //   }, [initialPreferences, preferences]);

  // Get a specific preference
  const getPreference = <K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] => {
    return preferences[key];
  };

  // Update a single preference
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    // Optimistic update
    const previousPreferences = preferences;
    const newPreferences: UserPreferences = {
      ...preferences,
      [key]: value,
    };

    setPreferences(newPreferences);
    // Update cookie immediately for instant persistence
    savePreferencesToCookie(newPreferences);

    try {
      const result = await updatePrefsAction({
        [key]: value,
      } as Partial<UserPreferences>);

      if (!result.success) {
        // Revert on error
        setPreferences(previousPreferences);
        savePreferencesToCookie(previousPreferences);
        throw new Error(result.error || "Failed to update preference");
      }

      // Update with server response
      if (result.preferences) {
        const validated = UserPreferencesContentSchema.parse(
          result.preferences
        );
        setPreferences(validated);
        savePreferencesToCookie(validated);
      }
    } catch (error) {
      console.error("Failed to update preference:", error);
      throw error;
    }
  };

  // Update multiple preferences
  const updatePreferencesFunc = async (prefs: Partial<UserPreferences>) => {
    // Optimistic update with deep merge for nested objects
    const previousPreferences = preferences;

    // Deep merge for nested updates
    const newPreferences = deepMergePreferences(preferences, prefs);

    setPreferences(newPreferences);
    // Update cookie immediately for instant persistence
    savePreferencesToCookie(newPreferences);

    try {
      const result = await updatePrefsAction(prefs);

      if (!result.success) {
        // Revert on error
        setPreferences(previousPreferences);
        savePreferencesToCookie(previousPreferences);
        throw new Error(result.error || "Failed to update preferences");
      }

      // Update with server response
      if (result.preferences) {
        const validated = UserPreferencesContentSchema.parse(
          result.preferences
        );
        setPreferences(validated);
        savePreferencesToCookie(validated);
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        getPreference,
        updatePreference,
        updatePreferences: updatePreferencesFunc,
        refreshPreferences,
        isLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

// Export context
export { PreferencesContext };

// Custom hook to use preferences
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
