"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import { Provider } from "@/types/auth/sso";

export async function signInWithOAuthProvider(provider: Provider) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/callback?next=/app`,
      },
    });

    if (error) {
      console.log("OAuth sign-in error:", error);
      return { url: null, error: error.message };
    }

    if (data?.url) {
      return { url: data.url, error: null };
    }

    return { url: null, error: "No URL returned from OAuth provider" };
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during OAuth login";

    return { url: null, error: `OAuth Login failed: ${errorMessage}` };
  }
}
