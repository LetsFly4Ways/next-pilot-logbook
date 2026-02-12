// Utility to determine app version string based on environment
// - In development: returns "DEV"
// - In production: returns version from package.json

import packageJson from "../../package.json";

export function getAppVersion(): string {
	const isDev = process.env.NODE_ENV !== "production";
	if (isDev) return "Development";

	// Prefer package.json version if available
	const version = (packageJson as { version?: string }).version;
	return version || "0.0.0";
}
