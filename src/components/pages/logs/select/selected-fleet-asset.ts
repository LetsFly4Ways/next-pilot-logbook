import { Fleet } from "@/types/fleet";

const KEY = "selected-fleet-asset";

export function saveSelectedFleet(id: Fleet) {
	sessionStorage.setItem(KEY, JSON.stringify(id));
}

export function readSelectedFleet(): Fleet | null {
	const raw = sessionStorage.getItem(KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearSelectedFleet() {
	sessionStorage.removeItem(KEY);
}
