import { AircraftType } from "@/types/aircraft-type";

const KEY = "selected-aircraft-type";

export function saveSelectedAircraft(type: AircraftType) {
	sessionStorage.setItem(KEY, JSON.stringify(type));
}

export function readSelectedAircraft(): AircraftType | null {
	const raw = sessionStorage.getItem(KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearSelectedAircraft() {
	sessionStorage.removeItem(KEY);
}
