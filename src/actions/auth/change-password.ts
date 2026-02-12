"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";
import {
	ChangePasswordForm,
	ChangePasswordFormSchema,
} from "@/types/auth/change-password";

export async function changePassword(values: ChangePasswordForm) {
	const supabase = await createServerSupabaseClient();

	// 1. Validate the schema
	const validatedFields = ChangePasswordFormSchema.safeParse(values);
	if (!validatedFields.success) {
		return { error: "Invalid fields" };
	}

	const { current_password, new_password } = validatedFields.data;

	// 2. Get the current user to get their email
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user?.email) {
		return { error: "User session not found" };
	}

	// 3. Verify the "Old Password" by attempting a sign-in
	// This is the standard way to check a password in a Server Action
	const { error: verifyError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: current_password,
	});

	if (verifyError) {
		return { error: "Incorrect current password" };
	}

	// 4. Update to the new password
	const { error: updateError } = await supabase.auth.updateUser({
		password: new_password,
	});

	if (updateError) {
		return { error: updateError.message };
	}

	return { success: "Password updated successfully" };
}
