"use server";
import * as z from "zod";
import { NewPasswordFormSchema } from "@/types/auth/new-password";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const newPassword = async (
  values: z.infer<typeof NewPasswordFormSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();

    // Verify token by attempting to exchange it for a session
    const { error: verificationError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verificationError) {
      console.error("Token verification error:", verificationError);
      return { error: "Invalid or expired password reset link" };
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Password updated successfully", redirectTo: "/login" };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}` };
  }
};
