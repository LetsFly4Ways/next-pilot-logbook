import { Flight } from "@/types/logs";

export function formatMovement(day: number, night: number): string {
	if (day === 0 && night === 0) return "0";
	if (night === 0) return `${day} D`;
	if (day === 0) return `${night} N`;
	return `${day}D / ${night}N`;
}

interface ArrayToTextProps {
	items: (string | number)[] | undefined;
	separator?: string;
}

export function ArrayToText({ items, separator = ", " }: ArrayToTextProps) {
	// Return empty string if items is undefined or null
	if (!items || !Array.isArray(items)) {
		return "";
	}

	// Filter out null, undefined, and empty values
	const validItems = items.filter(
		(item) => item !== null && item !== undefined && item !== "",
	);

	// Convert to string and join
	const text = validItems.join(separator);

	return text;
}

// Utility to get selected function/role for a flight item
export function getSelectedFunction(item: Flight): string | null {
	// if (!Flight(item)) return null;
	if (item.is_solo) return "SOLO";
	if (item.is_spic) return "SPIC";
	if (item.is_picus) return "PICUS";
	if (item.is_pic) return "PIC";
	if (item.dual_time_minutes) return "DUAL";
	if (item.copilot_time_minutes) return "COPILOT";
	if (item.instructor_time_minutes) return "INSTRUCTOR";
	return "?";
}
