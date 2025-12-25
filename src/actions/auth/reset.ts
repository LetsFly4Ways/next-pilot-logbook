"use server";

import * as z from "zod";
import { ResetFormSchema } from "@/types/auth/reset";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const resetPassword = async (
  values: z.infer<typeof ResetFormSchema>
) => {
  const validatedFields = ResetFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/new-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Reset email sent!",
      redirectTo: "/login",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "An unexpected error occurred" };
  }
};
