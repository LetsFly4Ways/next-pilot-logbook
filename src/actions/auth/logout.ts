"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import { revalidatePath } from "next/cache";

export type LogoutResult = {
  redirectTo: string;
};

export const logout = async (): Promise<LogoutResult> => {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { redirectTo: "/" };
};
