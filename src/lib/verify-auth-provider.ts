import { User } from "@supabase/supabase-js";

/**
 * Determine whether a user can change password locally (email/password).
 * Uses strict typing to check if 'email' exists in identities or metadata.
 */
export function canChangePassword(user: User | null | undefined): boolean {
	if (!user) return false;

	// 1. Check identities array (the most reliable source)
	// user.identities is typed as UserIdentity[] | undefined
	if (user.identities && user.identities.length > 0) {
		return user.identities.some((identity) => identity.provider === "email");
	}

	// 2. Fallback to app_metadata.provider (singular string)
	const provider = user.app_metadata?.provider;
	if (typeof provider === "string") {
		return provider.toLowerCase() === "email";
	}

	// 3. Fallback to app_metadata.providers (array of strings)
	const providers = user.app_metadata?.providers;
	if (Array.isArray(providers)) {
		return providers.includes("email");
	}

	return false;
}

/**
 * Permission check for avatar/profile-picture editing.
 * Social providers (Google/GitHub) manage avatars externally.
 */
export function canEditProfilePicture(user: User | null | undefined): boolean {
	// Reusing the same logic: if they have an email identity, they are a local user.
	return canChangePassword(user);
}
