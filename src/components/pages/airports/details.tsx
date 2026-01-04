import { useEffect, useState } from "react";
import { Airport } from "@/types/airport";
import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";
import { decimalToSexagesimal } from "geolib";
import Runways from "@/components/pages/airports/runways";
import { Skeleton } from "@/components/ui/skeleton";

import { Clock, Earth, Mountain, Star } from "lucide-react";
import { TbWorldLatitude, TbWorldLongitude } from "react-icons/tb";
import { PiSunHorizon } from "react-icons/pi";
import { FiSunrise, FiSunset } from "react-icons/fi";

interface AirportDetailsProps {
  airport: Airport | null;
  loading: boolean;
}

export default function AirportDetails({
  airport,
  loading,
}: AirportDetailsProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sunTimes, setSunTimes] = useState<{
    sunrise: string;
    sunset: string;
    civilDawn: string;
    civilDusk: string;
  } | null>(null);
  const [sunTimesLoading, setSunTimesLoading] = useState(true);

  // Fetch sun times from API
  useEffect(() => {
    const fetchSunTimes = async () => {
      setSunTimesLoading(true);
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");
      const url = `https://api.sunrise-sunset.org/json?lat=${airport?.lat}&lng=${airport?.lon}&date=${formattedDate}&formatted=0`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          setSunTimes({
            sunrise: formatInTimeZone(
              new Date(data.results.sunrise),
              tz,
              "HH:mm"
            ),
            sunset: formatInTimeZone(
              new Date(data.results.sunset),
              tz,
              "HH:mm"
            ),
            civilDawn: formatInTimeZone(
              new Date(data.results.civil_twilight_begin),
              tz,
              "HH:mm"
            ),
            civilDusk: formatInTimeZone(
              new Date(data.results.civil_twilight_end),
              tz,
              "HH:mm"
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching sun times:", error);
      } finally {
        setSunTimesLoading(false);
      }
    };

    fetchSunTimes();
  }, [airport?.lat, airport?.lon]); // Recalculate if coordinates change

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

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

  const lonDMS = formatCoordinate(airport?.lon || 0, true);
  const latDMS = formatCoordinate(airport?.lat || 0, false);

  const tz = airport?.tz ?? "";
  const date = new Date();
  const utcOffset = formatInTimeZone(date, tz, "X");

  const localTime = formatInTimeZone(currentTime, tz, "HH:mm");
  const utcTime = formatInTimeZone(currentTime, "UTC", "HH:mm");

  const runways = airport?.runways;

  if (loading || !airport || !currentTime) {
    return (
      <div className="p-4">
        {/* Header Skeleton */}
        <div className="py-4 space-y-3">
          <div className="w-full flex justify-between">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Details Skeleton */}
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

          {/* Row 4 */}
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

          {/* Row 5 */}
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
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="space-y-3 px-2">
        <div className="w-full flex justify-between">
          <div className="flex space-x-2 text-2xl font-semibold">
            <h2>{airport?.icao}</h2>
            {airport?.iata && (
              <>
                <span>|</span>{" "}
                <h2 className="text-muted-foreground">{airport?.iata}</h2>
              </>
            )}
          </div>
          {/* Future favourite icon */}
          {/* <div>
            <Star />
          </div> */}
        </div>

        <div>
          <div className="font-medium">
            {airport?.name || "Unknown Airport"}
          </div>
          <div className="flex space-x-2 text-sm text-muted-foreground">
            <span>{`${airport?.city}, ${
              airport?.state || "Unknown Location"
            }`}</span>
            <span>•</span>
            <span>{airport?.countryName}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="border-y divide-y">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">World Time</div>
              <div className="text-sm font-medium">{utcTime} UTC</div>
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
              <div className="text-sm font-medium">{localTime} LT</div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3">
            <Earth className="h-6 w-6 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Timezone</div>
              <div className="text-sm font-medium">
                {airport?.tz || "Unknown Timezone"} (UTC{utcOffset})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Mountain className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Elevation</div>
              <div className="text-sm font-medium">
                {airport?.elevation || "Unknown Elevation"} ft
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <TbWorldLatitude className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Latitude</div>
              <div className="text-sm font-medium">{latDMS}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <TbWorldLongitude className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Longitude</div>
              <div className="text-sm font-medium">{lonDMS}</div>
            </div>
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <PiSunHorizon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Civil Twilight
              </div>
              <div className="flex items-center space-x-1 text-sm font-medium">
                {sunTimesLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p>{sunTimes?.civilDawn}</p>
                )}{" "}
                <p>LT</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <FiSunrise className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sunrise</div>
              <div className="flex items-center space-x-1 text-sm font-medium">
                {sunTimesLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p>{sunTimes?.sunrise}</p>
                )}{" "}
                <p>LT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 5 */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <FiSunset className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sunset</div>
              <div className="flex items-center space-x-1 text-sm font-medium">
                {sunTimesLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p>{sunTimes?.sunset}</p>
                )}{" "}
                <p>LT</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <PiSunHorizon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Civil Twilight
              </div>
              <div className="flex items-center space-x-1 text-sm font-medium">
                {sunTimesLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p>{sunTimes?.civilDusk}</p>
                )}{" "}
                <p>LT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 6 - Runways */}
        <div className="py-4 flex flex-col items-center justify-center space-y-4">
          {runways && runways.length > 0 ? (
            <Runways runways={runways} />
          ) : (
            <div className="text-center text-muted-foreground">
              No runway data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
