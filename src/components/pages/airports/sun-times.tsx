import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";

import { PiSunHorizon } from "react-icons/pi";
import { FiSunrise, FiSunset } from "react-icons/fi";

interface SunTimesProps {
  lat: number;
  lon: number;
  timezone: string;
}

async function fetchSunTimes(lat: number, lon: number, timezone: string) {
  const today = new Date();
  const formattedDate = format(today, "yyyy-MM-dd");
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${formattedDate}&formatted=0`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await response.json();

    if (data.status === "OK") {
      return {
        sunrise: formatInTimeZone(
          new Date(data.results.sunrise),
          timezone,
          "HH:mm"
        ),
        sunset: formatInTimeZone(
          new Date(data.results.sunset),
          timezone,
          "HH:mm"
        ),
        civilDawn: formatInTimeZone(
          new Date(data.results.civil_twilight_begin),
          timezone,
          "HH:mm"
        ),
        civilDusk: formatInTimeZone(
          new Date(data.results.civil_twilight_end),
          timezone,
          "HH:mm"
        ),
      };
    }
  } catch (error) {
    console.error("Error fetching sun times:", error);
  }

  return null;
}

export async function SunTimes({ lat, lon, timezone }: SunTimesProps) {
  const sunTimes = await fetchSunTimes(lat, lon, timezone);

  if (!sunTimes) {
    return (
      <div className="py-4">
        <div className="text-center text-sm text-muted-foreground">
          Sun times unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {/* Row 1: Civil Dawn & Sunrise */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <PiSunHorizon className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Civil Twilight</div>
            <div className="text-sm font-medium">{sunTimes.civilDawn} LT</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FiSunrise className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Sunrise</div>
            <div className="text-sm font-medium">{sunTimes.sunrise} LT</div>
          </div>
        </div>
      </div>

      {/* Row 2: Sunset & Civil Dusk */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <FiSunset className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Sunset</div>
            <div className="text-sm font-medium">{sunTimes.sunset} LT</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PiSunHorizon className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Civil Twilight</div>
            <div className="text-sm font-medium">{sunTimes.civilDusk} LT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SunTimesSkeleton() {
  return (
    <div className="border-y divide-y">
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20" />
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

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
