/**
 * Time formatting options
 */
export type TimeFormat =
	| "HH:mm" // 12:45
	| "HHhmm" // 12h 45m
	| "HH:mm:ss" // 12:45:30
	| "HH.mm" // 12.45
	| "decimal"; // 12.75

export type FormatTimeOptions = {
	showZero?: boolean; // default false
	suffix?: boolean; // adds "h" in compact modes
	verbose?: boolean; // forces "Xh Ym"
};

/**
 * Format time with various display options
 *
 * @param input - Minutes (number) or Date object
 * @param format - Display format (default: "HH:mm")
 * @param showZero - Show "00:00" or "--:--" for zero/null values (default: false shows "--:--")
 * @returns Formatted time string
 */
export function formatTime(
	input: number | Date | string | null | undefined,
	format: TimeFormat = "HH:mm",
	options: FormatTimeOptions = {},
): string {
	const { showZero = false, suffix = false, verbose = false } = options;

	if (input === null || input === undefined || input === "") {
		return showZero ? zeroValue(format) : placeholder(format);
	}

	// ISO time string: "HH:mm" or "HH:mm:ss"
	if (typeof input === "string") {
		return input.slice(0, 5);
	}

	// Convert to minutes
	const totalMinutes =
		input instanceof Date ? input.getHours() * 60 + input.getMinutes() : input;

	if (totalMinutes === 0) {
		const zero = showZero ? zeroValue(format) : placeholder(format);
		return suffix && format === "HH:mm" ? `${zero}h` : zero;
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const seconds = Math.round((totalMinutes % 1) * 60);

	// Force verbose duration output
	if (verbose) {
		return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
	}

	let result: string;

	switch (format) {
		case "HH:mm":
			result = `${pad(hours)}:${pad(minutes)}`;
			break;

		case "HHhmm":
			result = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
			break;

		case "HH:mm:ss":
			result = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
			break;

		case "HH.mm":
			result = `${pad(hours)}.${pad(minutes)}`;
			break;

		case "decimal":
			result = (totalMinutes / 60).toFixed(2);
			break;
	}

	if (suffix && format === "HH:mm") {
		return `${result}h`;
	}

	return result;
}

/* helpers */

function pad(v: number): string {
	return v.toString().padStart(2, "0");
}

function placeholder(format: TimeFormat): string {
	return format === "decimal" ? "--" : "--:--";
}

function zeroValue(format: TimeFormat): string {
	switch (format) {
		case "HHhmm":
			return "0h 0m";
		case "decimal":
			return "0.00";
		case "HH:mm:ss":
			return "00:00:00";
		default:
			return "00:00";
	}
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
