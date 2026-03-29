// ── Filter ────────────────────────────────────────────────────────────────────

export type DashboardFilter =
  | "all"
  | "rolling_12m"
  | "rolling_90d"
  | "rolling_30d"
  | (string & {}); // 4-digit year

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DashboardStatsData {
  // Log counts
  totalLogs: number;
  totalFlightLogs: number;
  totalSimLogs: number;

  // Time in minutes
  totalBlockMinutes: number;
  flightBlockMinutes: number;
  simBlockMinutes: number;
  totalAirMinutes: number;
  totalTaxiMinutes: number;
  picMinutes: number;

  // Last 30 days
  flightsLast30: number;
  blockMinutesLast30: number;

  // Movements
  dayTakeoffs: number;
  nightTakeoffs: number;
  dayLandings: number;
  nightLandings: number;
  goArounds: number;

  // Delays
  scheduledFlights: number;
  avgDepartureDelayMin: number;
  avgArrivalDelayMin: number;
  delayedDepartures: number;
  delayedArrivals: number;

  // Fuel & pax
  totalFuel: number;
  totalPassengers: number;
  flightsWithPassengers: number;
}

export interface SpecialTimesData {
  nightMinutes: number;
  ifrMinutes: number;
  xcMinutes: number;
}

export type TimeByFunction = Record<string, number>; // e.g. { PIC: 120, Dual: 36 }

export interface MonthlyDataPoint {
  month: string; // "YYYY-MM"
  blockMinutes: number;
  airMinutes: number;
  flights: number;
  avgDepartureDelayMin: number;
  avgArrivalDelayMin: number;
  cumulativeDepartureDelayHours: number;
}

export interface CurrencyData {
  dayTakeoffsLast90: number;
  nightTakeoffsLast90: number;
  dayLandingsLast90: number;
  nightLandingsLast90: number;
  goAroundsLast90: number;
  daysSinceLastFlight: number | null;
  flightsLast90: number;
}

export interface AirportEntry {
  code: string;
  count: number;
}

export interface RouteEntry {
  departure: string;
  destination: string;
  count: number;
}

export interface AircraftTypeEntry {
  type: string;
  count: number;
  minutes: number;
}

export interface AircraftRegistrationEntry {
  registration: string;
  type: string;
  count: number;
  minutes: number;
}

export interface CrewEntry {
  id: string;
  name: string;
  count: number;
  minutes: number;
}

export interface ApproachEntry {
  type: string;
  count: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  flightCount: number;
  simCount: number;
  minutes: number;
}

export interface DashboardData {
  stats: DashboardStatsData;
  specialTimes: SpecialTimesData;
  timeByFunction: TimeByFunction;
  monthlyData: MonthlyDataPoint[];
  currency: CurrencyData;
  allAirports: AirportEntry[];
  routes: RouteEntry[];
  allAircraftTypes: AircraftTypeEntry[];
  allAircraftRegistrations: AircraftRegistrationEntry[];
  topCrew: CrewEntry[];
  topApproaches: ApproachEntry[];
  heatmapData: HeatmapDay[];
  availableYears: number[];
}

export interface DashboardResult {
  data: DashboardData;
  error: string | null;
}

// ── Recency ───────────────────────────────────────────────────────────────────

export interface RecencyGroupStatus {
  id: string;
  name: string;
  description: string | null;
  types: string[];
  dayTakeoffsLast90: number;
  nightTakeoffsLast90: number;
  dayLandingsLast90: number;
  nightLandingsLast90: number;
  lastFlightDate: string | null;
  daysSinceLastFlight: number | null;
}

export interface RecencyResult {
  data: RecencyGroupStatus[];
  error: string | null;
}
