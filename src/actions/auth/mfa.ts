"use server";

import * as z from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import { Factor } from "@supabase/auth-js";
import { MFAVerifySchema } from "@/types/auth/mfa";

export const getMFAFactors = async (): Promise<{
  factors: Factor[];
  error?: string;
}> => {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      console.error("Error loading MFA factors:", error);
      return { factors: [], error: "Failed to load authentication devices" };
    }

    const totpFactors = data?.totp || [];
    return { factors: totpFactors };
  } catch (error) {
    console.error("Error in getMFAFactors:", error);
    return { factors: [], error: "An unexpected error occurred" };
  }
};

export const verifyMFA = async (
  values: z.infer<typeof MFAVerifySchema>
): Promise<{ success?: string; error?: string }> => {
  const validatedFields = MFAVerifySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input fields" };
  }

  const { factorId, code } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();

    // Create challenge
    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId,
      });

    if (challengeError) {
      console.error("Challenge error:", challengeError);
      return { error: "Failed to create authentication challenge" };
    }

    // Verify the challenge
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      console.error("Verification error:", verifyError);
      return { error: verifyError.message || "Invalid verification code" };
    }

    return { success: "MFA verified successfully" };
  } catch (error) {
    console.error("Error in verifyMFA:", error);
    return { error: "An unexpected error occurred" };
  }
};
