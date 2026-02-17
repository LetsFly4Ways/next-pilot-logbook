const CONTEXT_KEY = "flight-form-select-context";

export interface SelectContext {
  current?: string | null;
  return: string;
  role?: "departure" | "destination";
  selected?: string; // For approaches: pipe-separated titles
  runway?: string | null; // For airport detail: current runway selection
}

export function writeSelectContext(context: SelectContext): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
}

export function readSelectContext(): SelectContext | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectContext;
  } catch {
    return null;
  }
}

export function clearSelectContext(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(CONTEXT_KEY);
}
