import { getDashboardData } from "@/actions/pages/dashboard/fetch";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorContainer } from "@/components/ui/error-container";
import { DashboardStats } from "@/components/pages/dashboard/stats";
import { MovementsCard } from "./movements";
import { TimesByFunctionChart } from "./function-time";
import { FlightHeatmap } from "./heatmap";
import { TopAircraftChart } from "./top-aircraft-card";
import { TopCrewChart } from "./top-crew-card";
import { AirportsCard } from "./airport-card";

export default async function Dashboard() {
  const { data, error } = await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        backHref=""
        showBackButton={false}
        isTopLevelPage={true}
      // action button with filter
      />
      {/* Content */}
      <div className="flex flex-col gap-6 p-4 md:p-6 mx-auto w-full">
        {error && <ErrorContainer title="Something went wrong fetching the dashboard" message={error} />}

        {/* Stats cards */}
        <DashboardStats stats={data.stats} />

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Flight Experience</h2>

          {/* Heatmap */}
          <FlightHeatmap
            data={data.heatmapData}
            availableYears={data.availableYears}
            selectedYear={2025}
          />

          {/* Time Chart */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Movements */}
            <MovementsCard stats={data.stats} />

            {/* Specific Times */}
            <TimesByFunctionChart
              specialTimes={data.specialTimes}
              timeByFunction={data.timeByFunction}
            />
          </div>
        </div>



        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Fleet & Personnel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Aircraft */}
            <TopAircraftChart
              types={data.allAircraftTypes}
              registrations={data.allAircraftRegistrations}
            />

            {/* Crew */}
            <TopCrewChart crew={data.topCrew} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Network & Navigation</h2>
          <AirportsCard airports={data.allAirports} routes={data.routes} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Mission Analytics</h2>

        </div>
      </div>
    </div>
  )
}