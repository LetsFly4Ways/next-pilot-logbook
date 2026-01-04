import { useRouter } from "next/navigation";

import { Airport } from "@/types/airports";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ListItemProps {
  airport: Airport;
}

export default function AirportListItem({ airport }: ListItemProps) {
  const router = useRouter();

  return (
    <div
      className="p-3 py-4 flex space-x-4 cursor-pointer hover:bg-muted"
      onClick={() => router.push(`/app/airports/${airport.icao}`)}
    >
      <div>
        <Badge
          className="flex flex-col items-center justify-center h-12 w-12 px-3 py-2"
          variant="basic"
        >
          <span className="text-xs font-medium">{airport.icao}</span>
          {airport.iata && (
            <span className="text-xs font-medium">{airport.iata}</span>
          )}
        </Badge>
      </div>
      <div>
        <div className="font-medium">{airport.name}</div>
        <div className="text-sm text-muted-foreground">
          {/* Only show bullet separator if both city and countryName are present */}
          {airport.city && airport.countryName
            ? `${airport.city} • ${airport.countryName}`
            : airport.city || airport.countryName || "Unknown location"}
        </div>
      </div>
    </div>
  );
}

export function AirportItemSkeleton() {
  return (
    <div className="p-3 py-4 flex space-x-4">
      <div>
        <Skeleton className="h-12 w-16 rounded-sm" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
