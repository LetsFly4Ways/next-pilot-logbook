"use server";

import { cacheLife } from "next/cache";
import { AircraftType, Result, AircraftDatabase } from "@/types/aircraft-type";

export async function fetchAircraftTypes(): Promise<Result<AircraftType[]>> {
	"use cache";
	cacheLife("hours");

	try {
		const fs = await import("fs/promises");
		const path = await import("path");

		const filePath = path.join(process.cwd(), "public/data/aircraft.json");

		// Check if file exists
		try {
			await fs.access(filePath);
		} catch {
			return {
				success: false,
				error:
					"Aircraft data file not found. Please ensure airports.json exists in public/data/",
			};
		}

		const fileContents = await fs.readFile(filePath, "utf8");

		let data: AircraftDatabase;
		try {
			data = JSON.parse(fileContents);
		} catch (parseError) {
			return {
				success: false,
				error: `Failed to parse aircraft data. The JSON file may be corrupt. ${parseError}`,
			};
		}

		if (!Array.isArray(data)) {
			return {
				success: false,
				error: "Invalid aircraft data format. Expected an array.",
			};
		}

		if (data.length === 0) {
			return { success: false, error: "No aircraft found in data file." };
		}

		return { success: true, data: data };
	} catch (error) {
		console.error("Failed to fetch aircraft types:", error);
		return {
			success: false,
			error: "Failed to load aircraft data.",
		};
	}
}

export async function getAircraftTypesGroupedByManufacturer(): Promise<
	Result<Record<string, AircraftType[]>>
> {
	const result = await fetchAircraftTypes();
	if (!result.success) {
		return {
			success: false,
			error: result.error,
		};
	}

	try {
		const grouped = result.data!.reduce<Record<string, AircraftType[]>>(
			(acc, aircraft) => {
				const manufacturer =
					aircraft.Manufacturer?.trim() || "Unknown Manufacturer";

				if (!acc[manufacturer]) {
					acc[manufacturer] = [];
				}

				acc[manufacturer].push(aircraft);
				return acc;
			},
			{}
		);

		// Optional: sort manufacturers alphabetically
		const sorted = Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b))
			.reduce((acc, key) => {
				acc[key] = grouped[key];
				return acc;
			}, {} as Record<string, AircraftType[]>);

		return { success: true, data: sorted };
	} catch (error) {
		console.error("Failed to group aircraft by manufacturer:", error);
		return {
			success: false,
			error: "Failed to organize aircraft by manufacturer.",
		};
	}
}

export async function searchAircraftTypes(
	query: string
): Promise<Result<AircraftType[]>> {
	const result = await fetchAircraftTypes();
	if (!result.success) return result;

	if (!query.trim()) {
		return result;
	}

	const normalized = query.toLowerCase().replace(/\s+/g, "");

	const filtered = result.data!.filter((a) => {
		const model = a.Model.toLowerCase().replace(/\s+/g, "");
		const type = a.Type.toLowerCase().replace(/\s+/g, "");
		const manufacturer = a.Manufacturer.toLowerCase().replace(/\s+/g, "");

		return (
			model.includes(normalized) ||
			type.includes(normalized) ||
			manufacturer.includes(normalized)
		);
	});

	return { success: true, data: filtered };
}
