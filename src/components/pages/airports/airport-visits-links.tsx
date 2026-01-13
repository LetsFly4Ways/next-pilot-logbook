"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { AirportVisit } from "@/actions/pages/airports/fetch-visits";

import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";

import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AirportVisitsLinksProps {
  icao: string;
  visitsPromise: Promise<AirportVisit | null>;
}

export function AirportVisitsLinks({
  icao,
  visitsPromise,
}: AirportVisitsLinksProps) {
  const router = useRouter();
  const visits = use(visitsPromise);

  return (
    <div>
      <PositionedGroup>
        <PositionedItem
          className="p-3 flex items-center justify-between cursor-pointer"
          onClick={() => router.push(`/app/airports/${icao}/departures`)}
        >
          <span className="text-sm font-medium text-foreground">
            Departures
          </span>
          <div className="flex space-x-2 items-center">
            <span className="text-sm text-muted-foreground">
              {visits?.departures || 0}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </PositionedItem>
        <PositionedItem
          className="p-3 flex items-center justify-between cursor-pointer"
          onClick={() => router.push(`/app/airports/${icao}/arrivals`)}
        >
          <span className="text-sm font-medium text-foreground">Arrivals</span>
          <div className="flex space-x-2 items-center">
            <span className="text-sm text-muted-foreground">
              {visits?.arrivals || 0}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </PositionedItem>
      </PositionedGroup>
    </div>
  );
}

export function AirportVisitsLinksSkeleton() {
  return (
    <PositionedGroup>
      <PositionedItem className="p-3 flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-foreground">Departures</span>
        <div className="flex space-x-2 items-center">
          <Skeleton className="h-6 w-6" />
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </PositionedItem>

      <PositionedItem className="p-3 flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-foreground">Arrivals</span>
        <div className="flex space-x-2 items-center">
          <Skeleton className="h-6 w-6" />
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </PositionedItem>
    </PositionedGroup>
  );
}
