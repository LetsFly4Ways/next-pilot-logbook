"use client";

import { useRouter } from "next/navigation";

import type { Flight } from "@/types/logs";
import { Fleet } from "@/types/fleet";

import { formatDate, formatTime } from "@/lib/date-utils";

import { PositionedItem } from "@/components/ui/positioned-group";

import { ChevronRight } from "lucide-react";

interface FlightListItemProps {
  flight: Flight;
  aircraft?: Fleet;
}

export function FlightListItem({ flight, aircraft }: FlightListItemProps) {
  const router = useRouter();

  return (
    <PositionedItem
      className="px-4 py-3 h-fit grid grid-cols-[1fr_auto] items-center gap-4 w-full cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => router.push(`/app/logs/flight/${flight.id}`)}
    >
      {/* Line color based on type */}
      <div
        className="absolute left-2 top-2 bottom-2 w-1.5 rounded-sm bg-blue-600"
      />

      {/* LEADING COLUMN - 3 ROWS */}
      <div className="min-w-0 ml-2 grid grid-rows-[auto_auto] grid-cols-1 gap-1 items-start">
        {/* ROW 1: Date & Flight Number */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {formatDate(flight.date, "short")}
          </span>
          <span className="text-sm text-muted-foreground sm:hidden">
            {formatDate(flight.date, "dateMonth")}
          </span>
          {flight.flight_number && (
            <span className="text-sm font-medium">
              {flight.flight_number}
            </span>
          )}
        </div>

        {/* ROW 2: Route */}
        <div className="flex items-center text-lg font-semibold">
          <span>{flight.departure_airport_code}</span>
          <span className="mx-2 transform translate-y-[-1px]">»</span>
          <span>{flight.destination_airport_code}</span>
        </div>

        {/* ROW 3: Time */}
        <div className="flex items-center gap-3 text-sm">
          {flight.block_start && flight.block_end && (
            <div>
              <span>{flight.block_start.slice(0, 5)}z</span>
              <span className="mx-1">-</span>
              <span>{flight.block_end.slice(0, 5)}z</span>
            </div>
          )}
        </div>
      </div>

      {/* TRAILING COLUMN */}
      <div className="shrink-0 grid grid-rows-3 grid-cols-[auto_auto] items-center gap-x-3 gap-y-1">
        {/* Row 1 — aircraft */}
        <div className="col-start-1 row-start-1 text-sm text-muted-foreground text-right">
          {aircraft?.registration && (
            <span className="font-medium">{aircraft.registration}</span>
          )}
          {(aircraft?.model || aircraft?.type) && ` | ${aircraft.model || aircraft.type}`}
        </div>

        {/* Row 2 — duration */}
        <div className="col-start-1 row-start-2 text-right">
          {formatTime(flight.total_block_minutes, "HH:mm", { showZero: true })}
        </div>

        {/* Row 3 — empty spacer to align with leading row 3 */}
        <div className="col-start-1 row-start-3" />

        {/* Chevron — vertically centered across all rows */}
        <ChevronRight className="col-start-2 row-span-3 w-5 h-5 text-muted-foreground self-center" />
      </div>
    </PositionedItem>
  );
}

