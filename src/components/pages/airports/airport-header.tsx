import { Airport } from "@/types/airports";

import { Skeleton } from "@/components/ui/skeleton";

interface AirportHeaderProps {
  airport: Airport;
}

export function AirportHeader({ airport }: AirportHeaderProps) {
  return (
    <div className="space-y-2 px-2">
      <div className="w-full flex justify-between items-start">
        <div className="flex space-x-2 text-2xl font-semibold">
          <h2>{airport.icao}</h2>
          {airport.iata && (
            <>
              <span>|</span>
              <h2 className="text-muted-foreground">{airport.iata}</h2>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="font-medium">{airport.name || "Unknown Airport"}</div>
        <div className="flex space-x-2 text-sm text-muted-foreground">
          <span>{`${airport.city}, ${
            airport.state || "Unknown Location"
          }`}</span>
          <span>•</span>
          <span>{airport.countryName}</span>
        </div>
      </div>
    </div>
  );
}

export function AirportHeaderSkeleton() {
  return (
    <div className="space-y-3 px-2">
      <div className="w-full flex justify-between">
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
