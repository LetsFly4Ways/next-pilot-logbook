import { getAuthenticatedUser } from "@/actions/get-auth-user";
import {
  DashboardData,
  DashboardFilter,
  DashboardResult,
  DashboardStatsData,
} from "@/types/statistics";

// ── Empty states ──────────────────────────────────────────────────────────────

const EMPTY_STATS: DashboardStatsData = {
  totalLogs: 0,
  totalFlightLogs: 0,
  totalSimLogs: 0,
  totalBlockMinutes: 0,
  flightBlockMinutes: 0,
  simBlockMinutes: 0,
  totalAirMinutes: 0,
  totalTaxiMinutes: 0,
  picMinutes: 0,
  flightsLast30: 0,
  blockMinutesLast30: 0,
  // longestFlightMinutes: 0,
  dayTakeoffs: 0,
  nightTakeoffs: 0,
  dayLandings: 0,
  nightLandings: 0,
  goArounds: 0,
  scheduledFlights: 0,
  avgDepartureDelayMin: 0,
  avgArrivalDelayMin: 0,
  delayedDepartures: 0,
  delayedArrivals: 0,
  totalFuel: 0,
  totalPassengers: 0,
  flightsWithPassengers: 0,
};

const EMPTY_DASHBOARD: DashboardData = {
  stats: EMPTY_STATS,
  specialTimes: { nightMinutes: 0, ifrMinutes: 0, xcMinutes: 0 },
  timeByFunction: {},
  monthlyData: [],
  currency: {
    dayTakeoffsLast90: 0,
    nightTakeoffsLast90: 0,
    dayLandingsLast90: 0,
    nightLandingsLast90: 0,
    goAroundsLast90: 0,
    daysSinceLastFlight: null,
    flightsLast90: 0,
  },
  allAirports: [],
  routes: [],
  allAircraftTypes: [],
  allAircraftRegistrations: [],
  topCrew: [],
  topApproaches: [],
  heatmapData: [],
  availableYears: [new Date().getFullYear()],
};

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getDashboardData(
  filter: DashboardFilter = "all",
): Promise<DashboardResult> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) return { data: EMPTY_DASHBOARD, error: "Not authenticated." };

    const { supabase } = auth;

    const { data, error } = await supabase.rpc("get_dashboard_data", {
      p_filter: filter,
    });

    if (error) {
      console.error("get_dashboard_data RPC error:", error);
      return { data: EMPTY_DASHBOARD, error: error.message };
    }

    return { data: data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Unexpected error fetching dashboard data:", error);
    return { data: EMPTY_DASHBOARD, error: message };
  }
}
