"use server";

import * as z from "zod";
import { RegisterFormSchema } from "@/types/auth/register";
import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export const register = async (values: z.infer<typeof RegisterFormSchema>) => {
  const validatedFields = RegisterFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    const supabase = await createServerSupabaseClient();
    const { error: registerError } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("Register error:", registerError);

    if (registerError) {
      return { error: registerError.message };
    }

    return {
      success: "User created successfully",
      redirectTo: `/verify-email?user="${email}"`,
    };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}` };
  }
};
