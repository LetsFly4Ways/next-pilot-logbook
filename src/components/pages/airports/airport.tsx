import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAirportByIcao } from "@/actions/pages/airports/fetch";
import { getAirportVisits } from "@/actions/pages/airports/fetch-visits";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  AirportHeader,
  AirportHeaderSkeleton,
} from "@/components/pages/airports/airport-header";
import {
  AirportInfo,
  AirportInfoSkeleton,
} from "@/components/pages/airports/airport-info";
import {
  AirportVisitsLinks,
  AirportVisitsLinksSkeleton,
} from "@/components/pages/airports/airport-visits-links";

import { Star } from "lucide-react";

export default async function AirportPage({ id }: { id: string }) {
  const icao = id.toUpperCase();

  // Fetch airport data
  const airportResult = await getAirportByIcao(icao);

  // Handle errors
  if (!airportResult.success) {
    notFound();
  }

  const airport = airportResult.data;

  // Fetch visits in parallel (non-blocking)
  const visitsPromise = getAirportVisits(icao);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={airport.name || icao}
        backHref="/app/airports"
        showBackButton
        isTopLevelPage={false}
        actionButton={
          <Button variant="ghost" size="icon">
            <Star />
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Header Section */}
        <Suspense fallback={<AirportHeaderSkeleton />}>
          <AirportHeader airport={airport} />
        </Suspense>

        {/* Information (Timezone, Elevation, Coordinates, Sun Times) */}
        <Suspense fallback={<AirportInfoSkeleton />}>
          <AirportInfo airport={airport} />
        </Suspense>

        {/* Visits */}
        <Suspense fallback={<AirportVisitsLinksSkeleton />}>
          <AirportVisitsLinks icao={icao} visitsPromise={visitsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
