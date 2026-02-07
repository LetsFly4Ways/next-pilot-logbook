/**
 * Date formatting options
 */
export type DateFormat =
	| "short" // 17 Jan 2026
	| "long" // 17 January 2026
	| "full" // Saturday, 17 January, 2026
	| "iso" // 2026-01-17
	| "numeric" // 01/17/2026
	| "monthYear" // January 2026
	| "dateMonth"; // 17 Jan

/**
 * Format date with various display options
 *
 * @param input - Date object or ISO string
 * @param format - Display format (default: "short")
 * @returns Formatted date string
 */
export function formatDate(
	input: Date | string | null | undefined,
	format: DateFormat = "short",
): string {
	if (!input) return "--";

	// Convert to Date object if string
	const date = typeof input === "string" ? new Date(input) : input;

	// Validate date
	if (isNaN(date.getTime())) return "--";

	switch (format) {
		case "short":
			return date.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});

		case "long":
			return date.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});

		case "full":
			return date.toLocaleDateString("en-GB", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			});

		case "iso":
			return date.toISOString().split("T")[0];

		case "numeric":
			return date.toLocaleDateString("en-GB", {
				month: "2-digit",
				day: "2-digit",
				year: "numeric",
			});

		case "monthYear":
			return date.toLocaleDateString("en-GB", {
				month: "long",
				year: "numeric",
			});

		case "dateMonth":
			return date.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
			});

		default:
			return date.toLocaleDateString("en-GB", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
	}
}
