"use server";

import * as z from "zod";
import { VerificationEmailSchema } from "@/types/auth/verification-email";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const sendVerificationEmail = async (
  values: z.infer<typeof VerificationEmailSchema>,
) => {
  const validatedFields = VerificationEmailSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL ||
          `https://${process.env.VERCEL_URL}` ||
          "http://localhost:3000"
        }/login`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Verification email sent!",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { error: "An unexpected error occurred" };
  }
};
