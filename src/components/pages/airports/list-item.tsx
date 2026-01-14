import { useRouter } from "next/navigation";

import { Airport } from "@/types/airports";

import { Skeleton } from "@/components/ui/skeleton";
import { PositionedItem } from "@/components/ui/positioned-group";

import { ChevronRight, Star } from "lucide-react";

interface ListItemProps {
  airport: Airport;
  isFavorite: boolean;
}

export default function AirportListItem({
  airport,
  isFavorite = false,
}: ListItemProps) {
  const router = useRouter();

  return (
    <PositionedItem
      key={airport.icao}
      className="px-4 py-2 h-fit flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors w-full"
      onClick={() => router.push(`/app/airports/${airport.icao}`)}
    >
      {/* Make sure flex-1 has min-w-0 so it can shrink */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{airport.icao}</span>
          {airport.iata && (
            <span className="text-xs text-muted-foreground truncate">
              {airport.iata}
            </span>
          )}
        </div>

        {/* Truncate needs to be fixed */}
        <span className="text-sm text-muted-foreground w-48 md:w-fit truncate block">
          {airport.name}
        </span>
      </div>

      {/* Right side icons */}
      <div className="font-medium text-sm flex items-center gap-2 shrink-0">
        {isFavorite && (
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </PositionedItem>
  );
}

export function AirportItemSkeleton() {
  return (
    <PositionedItem className="px-4 py-2 h-15 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors w-full">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="font-medium text-sm flex items-center gap-2 shrink-0">
        <Skeleton className="h-4 w-4" />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </PositionedItem>
  );
}
