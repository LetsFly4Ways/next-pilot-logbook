"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import { revalidatePath } from "next/cache";

export const logout = async () => {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  return { redirectTo: "/" };
};
