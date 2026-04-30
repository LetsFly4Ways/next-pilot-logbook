import { FlightFormValues, SimulatorSessionFormValues } from "@/types/logs";

const FLIGHT_FORM_PREFILL_KEY = "nplb_flight_form_prefill";
const SIMULATOR_FORM_PREFILL_KEY = "nplb_simulator_form_prefill";

function readStorage<T>(key: string): T | null {
  if (typeof sessionStorage === "undefined") return null;

  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof sessionStorage === "undefined") return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures in browsers with restricted storage.
  }
}

function clearStorage(key: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(key);
}

export function saveFlightFormPrefill(data: FlightFormValues) {
  writeStorage<FlightFormValues>(FLIGHT_FORM_PREFILL_KEY, data);
}

export function readFlightFormPrefill(): FlightFormValues | null {
  return readStorage<FlightFormValues>(FLIGHT_FORM_PREFILL_KEY);
}

export function clearFlightFormPrefill() {
  clearStorage(FLIGHT_FORM_PREFILL_KEY);
}

export function saveSimulatorFormPrefill(data: SimulatorSessionFormValues) {
  writeStorage<SimulatorSessionFormValues>(SIMULATOR_FORM_PREFILL_KEY, data);
}

export function readSimulatorFormPrefill(): SimulatorSessionFormValues | null {
  return readStorage<SimulatorSessionFormValues>(SIMULATOR_FORM_PREFILL_KEY);
}

export function clearSimulatorFormPrefill() {
  clearStorage(SIMULATOR_FORM_PREFILL_KEY);
}
