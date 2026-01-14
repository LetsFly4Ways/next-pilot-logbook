import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAirportByIcao } from "@/actions/pages/airports/fetch";
import { getAirportVisits } from "@/actions/pages/airports/fetch-visits";
import { isAirportFavorited } from "@/actions/pages/airports/favorites";

import { PageHeader } from "@/components/layout/page-header";
import { FavoriteButton } from "@/components/pages/airports/favorite-button";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
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

import { MapPin } from "lucide-react";

export default async function AirportPage({ id }: { id: string }) {
  const icao = id.toUpperCase();

  // Fetch airport data and favorite status in parallel
  const [airportResult, isFavorited] = await Promise.all([
    getAirportByIcao(icao),
    isAirportFavorited(icao),
  ]);

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
          <FavoriteButton
            icao={airport.icao}
            initialIsFavorited={isFavorited}
          />
        }
      />

      <div className="p-6 space-y-4">
        <div className="h-80 md:h-100 w-full rounded-lg overflow-hidden">
          <Map center={[airport.lon, airport.lat]} zoom={13}>
            <MapMarker
              key={airport.icao}
              longitude={airport.lon}
              latitude={airport.lat}
            >
              <MarkerContent>
                <MapPin />
              </MarkerContent>
              <MarkerTooltip>{airport.icao}</MarkerTooltip>
            </MapMarker>
          </Map>
        </div>

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
