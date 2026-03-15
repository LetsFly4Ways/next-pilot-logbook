import { Crew } from "@/types/crew";

export type NameFormatPreference = "first-last" | "last-first";

/**
 * Helper function to format crew member name based on preference
 */
export function formatCrewName(
	firstName?: string | null,
	lastName?: string | null,
	format: NameFormatPreference = "first-last",
): string {
	if (!firstName && !lastName) return "";

	if (format === "last-first" && lastName) {
		return firstName ? `${lastName}, ${firstName}` : lastName;
	}

	return [firstName, lastName].filter(Boolean).join(" ");
}

export function formatCrewMember(crew: Crew, nameFormat: NameFormatPreference) {
	const fullName = formatCrewName(crew.first_name, crew.last_name, nameFormat);

	return {
		id: crew.id,
		fullName,
		companyId: crew.company_id ?? undefined,
		displayName: crew.company_id
			? `${fullName} • ${crew.company_id}`
			: fullName,
	};
}
