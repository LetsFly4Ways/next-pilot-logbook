"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";

import { UserInfoForm, UserInfoFormSchema } from "@/types/account";

export async function getAccountData() {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: "Not authenticated" };

	const { data: profile } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.single();

	return { profile, authUser: user };
}

export async function updateAccount(formData: UserInfoForm) {
	const validated = UserInfoFormSchema.parse(formData);
	const supabase = await createServerSupabaseClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: "User not found" };

	const fullName = `${validated.first_name} ${validated.last_name}`.trim();

	// 1. Update Supabase Auth Metadata (Identity)
	const { error: authError } = await supabase.auth.updateUser({
		data: {
			first_name: validated.first_name,
			last_name: validated.last_name,
			full_name: fullName,
			display_name: fullName,
		},
	});

	if (authError) return { error: authError.message };

	// 2. Update Profiles Database Table
	const { error: dbError } = await supabase
		.from("profiles")
		.update({
			first_name: validated.first_name,
			last_name: validated.last_name,
			phone: validated.phone,
			company: validated.company,
			company_id: validated.company_id,
			license_number: validated.license_number,
		})
		.eq("id", user.id);

	if (dbError) return { error: dbError.message };

	revalidatePath("/app/settings/account");
	return { success: true };
}
