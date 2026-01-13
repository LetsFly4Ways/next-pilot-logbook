import { createServerSupabaseClient } from "@/lib/supabase/server/server";

/**
 * Helper function to get authenticated user
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not authenticated:", userError);
    return null;
  }

  return { supabase, user };
}
