import { Crew } from "@/types/crew";
import { Fleet } from "@/types/fleet";

const KEY = "simulator-form-selection";

export type SimulatorFormSelectionType = "simulator" | "crew";

/**
 * Payload for crew selections; when picking an existing crew member we store
 * the full object so that callers have access to other fields (email, phone,
 * etc).  The special self entry simply sets `id` to `null` and adds a
 * `instructor_is_self` flag.
 */
export type CrewSelectionPayload = Crew & { instructor_is_self?: boolean };

export type SimulatorFormSelectionPayload =
  | { type: "simulator"; payload: Fleet }
  | { type: "crew"; payload: CrewSelectionPayload };

export function writeSimulatorFormSelection(
  selection: SimulatorFormSelectionPayload,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(selection));
}

export function readSimulatorFormSelection(): SimulatorFormSelectionPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SimulatorFormSelectionPayload;
  } catch {
    return null;
  }
}

export function clearSimulatorFormSelection(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(KEY);
}

/** Map Crew to minimal payload for form (instructor_id + display) */
export function crewToSelectionPayload(crew: Crew): CrewSelectionPayload {
  // the crew object already satisfies `CrewSelectionPayload` (extra fields
  // are fine), so we just return it directly.  callers can add
  // `instructor_is_self` themselves by modifying the object if needed.
  return crew;
}

/** Create a "self" payload for instructor selection (instructor_id = null, instructor_is_self = true) */
export function selfToSelectionPayload(): Crew & {
  id: null;
  full_name: string;
} {
  return {
    id: null,
    user_id: "",
    first_name: "Self",
    last_name: "",
    email: null,
    phone: null,
    address: null,
    license_number: null,
    company: null,
    company_id: "SELF",
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    full_name: "Self",
  } as Crew & { id: null; full_name: string };
}
