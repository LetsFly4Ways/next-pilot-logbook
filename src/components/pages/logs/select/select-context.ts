function getContextKey(type: "flight" | "simulator"): string {
  return type === "flight" ? "flight-form-select-context" : "simulator-form-select-context";
}

export interface SelectContext {
  type?: "flight" | "simulator"; // Indicates whether this is for a flight or simulator session
  current?: string | null;
  return: string;
  selected?: string; // For approaches: pipe-separated titles
  runway?: string | null; // For airport detail: current runway selection
}

export function writeSelectContext(context: SelectContext, type: "flight" | "simulator"): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(getContextKey(type), JSON.stringify(context));
}

export function readSelectContext(type: "flight" | "simulator"): SelectContext | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(getContextKey(type));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectContext;
  } catch {
    return null;
  }
}

export function clearSelectContext(type: "flight" | "simulator"): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(getContextKey(type));
}
