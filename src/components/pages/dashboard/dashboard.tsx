import { getAirportCoords, getDashboardData } from "@/actions/pages/dashboard/fetch";

import { getDistance } from "geolib";

import { DistanceUnit } from "@/types/airports";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorContainer } from "@/components/ui/error-container";
import { DashboardStats } from "@/components/pages/dashboard/stats";
import ActivityTimeline from "@/components/pages/dashboard/timeline";
import { MovementsCard } from "@/components/pages/dashboard/movements";
import { TimesByFunctionChart } from "@/components/pages/dashboard/function-time";
import { TopAircraftChart } from "@/components/pages/dashboard/aircraft-card";
import { TopCrewChart } from "@/components/pages/dashboard/crew-card";
import { AirportsCard } from "@/components/pages/dashboard/airport-card";
import JourneysCard from "@/components/pages/dashboard/journeys-card";


export default async function Dashboard() {
  const { data, error } = await getDashboardData();

  const defaultUnit: DistanceUnit = (data.distanceUnit as DistanceUnit) ?? "nm";

  // Always compute in nm — the card handles display-unit conversion client-side
  async function routeDistanceNm(dep: string, dest: string): Promise<number | null> {
    const from = await getAirportCoords(dep);
    const to = await getAirportCoords(dest);
    if (!from || !to) return null;
    return Math.round(getDistance(from, to) / 1852);
  }

  const totalDistanceNm = (
    await Promise.all(
      data.routes.map(async (route) => {
        const nm = await routeDistanceNm(route.departure, route.destination);
        return (nm ?? 0) * route.count;
      })
    )
  ).reduce((sum, d) => sum + d, 0);

  const longestFlight = data.longestFlight
    ? {
      ...data.longestFlight,
      distanceNm: await routeDistanceNm(
        data.longestFlight.departure,
        data.longestFlight.destination
      ) ?? undefined,
    }
    : null;

  const mostFrequentRoute = data.mostFrequentRoute
    ? {
      ...data.mostFrequentRoute,
      distanceNm: await routeDistanceNm(
        data.mostFrequentRoute.departure,
        data.mostFrequentRoute.destination
      ) ?? undefined,
    }
    : null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        backHref=""
        showBackButton={false}
        isTopLevelPage={true}
      />
      <div className="flex flex-col gap-6 p-4 md:p-6 mx-auto w-full">
        {error && <ErrorContainer title="Something went wrong fetching the dashboard" message={error} />}

        <DashboardStats stats={data.stats} />

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Experience</h2>
          <ActivityTimeline data={data} />
          {/* <FlightHeatmap
            data={data.heatmapData}
            availableYears={data.availableYears}
            selectedYear={2025}
          />

          <TimeChart monthlyData={data.monthlyData} /> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MovementsCard stats={data.stats} />
            <TimesByFunctionChart
              specialTimes={data.specialTimes}
              timeByFunction={data.timeByFunction}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Fleet & Personnel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TopAircraftChart
              types={data.allAircraftTypes}
              registrations={data.allAircraftRegistrations}
            />
            <TopCrewChart crew={data.topCrew} totalCrew={data.totalCrew} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Network & Navigation</h2>
          <AirportsCard airports={data.allAirports} routes={data.routes} />
          <JourneysCard
            totalDistanceNm={totalDistanceNm}
            longestFlight={longestFlight}
            mostFrequentRoute={mostFrequentRoute}
            defaultUnit={defaultUnit}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Mission Analytics</h2>
        </div>
      </div>
    </div>
  );
}