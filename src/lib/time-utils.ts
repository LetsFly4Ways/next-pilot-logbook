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
 * Calculate the difference between two time strings in minutes
 * @param start - Start time in HH:MM format
 * @param end - End time in HH:MM format
 * @returns Total minutes between start and end time (handles overnight periods)
 */
export function calculateDurationMinutes(
	start: string | null,
	end: string | null,
): number {
	if (!start || !end) return 0;

	const [startHours, startMinutes] = start.split(":").map(Number);
	const [endHours, endMinutes] = end.split(":").map(Number);

	const startTotalMinutes = startHours * 60 + startMinutes;
	let endTotalMinutes = endHours * 60 + endMinutes;

	// Handle overnight flights (end time is earlier than start time)
	if (endTotalMinutes < startTotalMinutes) {
		endTotalMinutes += 24 * 60; // Add 24 hours
	}

	return endTotalMinutes - startTotalMinutes;
}

/**
 * Format minutes to HH:MM time string
 * @param minutes - Total minutes
 * @returns Time formatted as HH:MM
 */
export function formatMinutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Convert time string to total minutes
 * @param time - Time in HH:MM format
 * @returns Total minutes
 */
export function timeToMinutes(time: string | null): number {
	if (!time) return 0;

	const [hours, minutes] = time.split(":").map(Number);

	// Handle invalid input
	if (isNaN(hours) || isNaN(minutes)) return 0;

	return hours * 60 + minutes;
}
