"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server/server";

export async function uploadAvatar(file: File) {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return {
				success: false,
				error: (userError || new Error("No user found")).message,
			};
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			return { error: "Invalid file type" };
		}

		// Validate file size (e.g., 5MB max)
		if (file.size > 5 * 1024 * 1024) {
			return { error: "File too large (max 5MB)" };
		}

		// Upload the avatar to Supabase Storage
		const fileExt = file.name.split(".").pop();
		const filePath = `${user.id}/avatar.${fileExt}`;

		const { data, error: uploadError } = await supabase.storage
			.from("avatars")
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: true,
				contentType: file.type,
			});

		console.log(data);

		if (uploadError) {
			return { success: false, error: uploadError.message };
		}

		const { data: signedUrlData, error: signedUrlError } =
			await supabase.storage
				.from("avatars")
				.createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

		if (signedUrlError) {
			return { success: false, error: signedUrlError.message };
		}

		// Update user with signed URL
		const { error: updateError } = await supabase.auth.updateUser({
			data: { avatar_url: signedUrlData.signedUrl },
		});

		if (updateError) {
			return { success: false, error: updateError.message };
		}

		return { success: true, data: signedUrlData.signedUrl };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function deleteAvatar() {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return {
				success: false,
				error: (userError || new Error("No user found")).message,
			};
		}

		const { data: files, error: listError } = await supabase.storage
			.from("avatars")
			.list(user.id);

		if (listError) {
			return { success: false, error: listError.message };
		}

		if (files && files.length > 0) {
			// Delete all files in the user's folder
			const filePaths = files.map((file) => `${user.id}/${file.name}`);

			const { error: deleteError } = await supabase.storage
				.from("avatars")
				.remove(filePaths);

			if (deleteError) {
				return { success: false, error: deleteError.message };
			}
		}

		// Update user metadata to remove avatar URL
		const { error: updateError } = await supabase.auth.updateUser({
			data: { avatar_url: null },
		});

		if (updateError) {
			return { success: false, error: updateError.message };
		}

		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
