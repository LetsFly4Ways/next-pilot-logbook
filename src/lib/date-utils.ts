/**
 * Time formatting options
 */
export type TimeFormat =
	| "HH:mm" // 12:45
	| "HHhmm" // 12h 45m
	| "HH:mm:ss" // 12:45:30
	| "HH.mm" // 12.45
	| "decimal"; // 12.75

/**
 * Format time with various display options
 *
 * @param input - Minutes (number) or Date object
 * @param format - Display format (default: "HH:mm")
 * @param showZero - Show "00:00" or "--:--" for zero/null values (default: false shows "--:--")
 * @returns Formatted time string
 */
export function formatTime(
	input: number | Date | null | undefined,
	format: TimeFormat = "HH:mm",
	showZero: boolean = false,
): string {
	// Handle null/undefined
	if (input === null || input === undefined) {
		return showZero ? "00:00" : "--:--";
	}

	let totalMinutes: number;

	// Convert input to minutes
	if (input instanceof Date) {
		totalMinutes = input.getHours() * 60 + input.getMinutes();
	} else {
		totalMinutes = input;
	}

	// Handle zero values
	if (totalMinutes === 0) {
		if (format === "HHhmm") return showZero ? "0h 0m" : "--";
		if (format === "decimal") return showZero ? "0.00" : "--";
		return showZero ? "00:00" : "--:--";
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const seconds = Math.floor((totalMinutes % 1) * 60); // For fractional minutes

	switch (format) {
		case "HH:mm":
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

		case "HHhmm":
			if (minutes === 0) return `${hours}h`;
			return `${hours}h ${minutes}m`;

		case "HH:mm:ss":
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

		case "HH.mm":
			return `${hours.toString().padStart(2, "0")}.${minutes.toString().padStart(2, "0")}`;

		case "decimal":
			return (totalMinutes / 60).toFixed(2);

		default:
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
	}
}

/**
 * Format time with "h" suffix (legacy compatibility)
 * Example: "12:45h" or "12h 45m"
 */
export function formatTimeWithSuffix(
	minutes: number | null | undefined,
	format: "compact" | "verbose" = "compact",
): string {
	if (minutes === null || minutes === undefined || minutes === 0) {
		return format === "compact" ? "0:00h" : "0h 0m";
	}

	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;

	if (format === "compact") {
		return `${hours}:${mins.toString().padStart(2, "0")}h`;
	} else {
		if (mins === 0) return `${hours}h`;
		return `${hours}h ${mins}m`;
	}
}

/**
 * Format ISO time string to HH:MM
 */
export function formatTimeString(time: string | null | undefined): string {
	if (!time) return "--:--";
	return time.slice(0, 5);
}

/**
 * Date formatting options
 */
export type DateFormat =
	| "short" // Jan 17, 2026
	| "long" // January 17, 2026
	| "full" // Saturday, January 17, 2026
	| "iso" // 2026-01-17
	| "numeric" // 01/17/2026
	| "monthYear"; // January 2026

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
			return date.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
			});

		case "long":
			return date.toLocaleDateString(undefined, {
				month: "long",
				day: "numeric",
				year: "numeric",
			});

		case "full":
			return date.toLocaleDateString(undefined, {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			});

		case "iso":
			return date.toISOString().split("T")[0];

		case "numeric":
			return date.toLocaleDateString(undefined, {
				month: "2-digit",
				day: "2-digit",
				year: "numeric",
			});

		case "monthYear":
			return date.toLocaleDateString(undefined, {
				month: "long",
				year: "numeric",
			});

		default:
			return date.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
	}
}
