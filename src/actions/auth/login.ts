"use server";

import * as z from "zod";
import { LoginFormSchema } from "@/types/auth/login";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const login = async (values: z.infer<typeof LoginFormSchema>) => {
  const validatedFields = LoginFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      return { error: loginError.message };
    }

    // Check if MFA is required
    const { data: mfaData, error: mfaError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (mfaError) {
      console.error("Error checking MFA:", mfaError);
      return { error: "Failed to verify authentication level" };
    }

    // If next level is aal2 but current isn't, MFA is required
    if (mfaData?.nextLevel === "aal2" && mfaData.currentLevel !== "aal2") {
      return {
        requiresMFA: true,
        redirectTo: "/mfa",
      };
    }

    return {
      success: "Logged in successfully",
      redirectTo: "/app/",
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return { error: "An unexpected error occurred" };
  }
};
