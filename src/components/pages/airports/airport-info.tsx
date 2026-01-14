import { Airport } from "@/types/airports";

import { decimalToSexagesimal } from "geolib";
import { formatInTimeZone } from "date-fns-tz";

import { LiveTimeDisplay } from "@/components/pages/airports/live-time-display";
import {
  SunTimes,
  SunTimesSkeleton,
} from "@/components/pages/airports/sun-times";
import {
  AirportRunways,
  AirportRunwaysSkeleton,
} from "@/components/pages/airports/airport-runway";
import { Skeleton } from "@/components/ui/skeleton";

import { Clock, Earth, Mountain } from "lucide-react";
import { TbWorldLatitude, TbWorldLongitude } from "react-icons/tb";

interface AirportInfoProps {
  airport: Airport;
}

type Direction = "N" | "S" | "E" | "W";

function formatCoordinate(decimal: number, isLongitude: boolean): string {
  const dms: string = decimalToSexagesimal(decimal);
  const rounded = dms.replace(/(\d+\.\d+)"/, (match, seconds) => {
    return `${Math.round(parseFloat(seconds))}"`;
  });

  const direction: Direction = isLongitude
    ? decimal >= 0
      ? "E"
      : "W"
    : decimal >= 0
    ? "N"
    : "S";
  return `${rounded} ${direction}`;
}

export function AirportInfo({ airport }: AirportInfoProps) {
  const lonDMS = formatCoordinate(airport.lon || 0, true);
  const latDMS = formatCoordinate(airport.lat || 0, false);

  const date = new Date();
  const utcOffset = formatInTimeZone(date, airport.tz, "X");

  return (
    <div className="border-y divide-y">
      {/* Row 1: Time */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">World Time</div>
            <div className="text-sm font-medium">
              <LiveTimeDisplay timezone="UTC" /> UTC
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
            <div className="text-xs font-medium text-muted-foreground">
              {utcOffset.replace(/^([+-])0/, "$1")}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Local Time</div>
            <div className="text-sm font-medium">
              <LiveTimeDisplay timezone={airport.tz} /> LT
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Timezone & Elevation */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Earth className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Timezone</div>
            <div className="text-sm font-medium">
              {airport.tz || "Unknown"} (UTC{utcOffset})
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mountain className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Elevation</div>
            <div className="text-sm font-medium">
              {airport.elevation || "Unknown"} ft
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Coordinates */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <TbWorldLatitude className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Latitude</div>
            <div className="text-sm font-medium">{latDMS}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TbWorldLongitude className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Longitude</div>
            <div className="text-sm font-medium">{lonDMS}</div>
          </div>
        </div>
      </div>

      {/* Row 4 & 5: Sun Times */}
      <SunTimes lat={airport.lat} lon={airport.lon} timezone={airport.tz} />

      {/* Row 6: Runways */}
      <AirportRunways runways={airport.runways} />
    </div>
  );
}

export function AirportInfoSkeleton() {
  return (
    <div className="border-y divide-y">
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Row 4 & 5 */}
      <SunTimesSkeleton />

      {/* Row 6 */}
      <AirportRunwaysSkeleton />
    </div>
  );
}
