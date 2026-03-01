import {
  SimulatorSessionFormValues,
  SimulatorSessionPayload,
} from "@/types/logs";

const DRAFT_COOKIE_NAME = "nplb_simulator_form_draft";
const DRAFT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getDraftFromCookie(): SimulatorSessionPayload | null {
  if (typeof document === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    const draftCookie = cookies.find((c) =>
      c.trim().startsWith(`${DRAFT_COOKIE_NAME}=`),
    );

    if (!draftCookie) return null;

    const value = draftCookie.split("=")[1];
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);

    // Validate the draft has required fields
    if (!parsed.aircraft_id && !parsed.instructor_id) return null;

    return parsed;
  } catch (error) {
    console.error("Failed to parse simulator draft cookie:", error);
    return null;
  }
}

export function saveDraftToCookie(data: SimulatorSessionFormValues) {
  if (typeof document === "undefined") return;

  try {
    const encoded = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${DRAFT_COOKIE_NAME}=${encoded}; path=/; max-age=${DRAFT_COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to save simulator draft cookie:", error);
  }
}

export function clearDraftCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${DRAFT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
