"use client";

import { useRouter } from "next/navigation";

import type { SimulatorSession } from "@/types/logs";
import { Fleet } from "@/types/fleet";

import { formatDate, formatTime } from "@/lib/date-utils";

import { PositionedItem } from "@/components/ui/positioned-group";

import { ChevronRight } from "lucide-react";

interface SimulatorListItemProps {
  session: SimulatorSession;
  simulator?: Fleet
}

export function SimulatorListItem({ session, simulator }: SimulatorListItemProps) {
  const router = useRouter();

  return (
    <PositionedItem
      className="px-4 py-3 h-fit grid grid-cols-[1fr_auto] items-center gap-4 w-full cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => router.push(`/app/logs/simulator/${session.id}`)}
    >
      {/* Line color based on type */}
      <div
        className="absolute left-2 top-2 bottom-2 w-1.5 rounded-sm bg-red-600"
      />

      {/* LEADING COLUMN - 3 ROWS */}
      <div className="min-w-0 ml-2 grid grid-rows-[auto_auto] grid-cols-1 gap-1 items-start">
        {/* ROW 1: Date */}
        <div className="text-sm text-muted-foreground">
          {formatDate(session.date)}
        </div>

        {/* ROW 2: Simulator */}
        <div className="flex items-center text-lg font-semibold">
          {simulator?.registration ? (
            <span>{simulator.registration}</span>
          ) : (
            <span>Simulator Session</span>
          )}
        </div>

        {/* ROW 3: Time */}
        {session.duty_start && session.duty_end && (
          <div className="flex items-center gap-3 text-sm">
            <div>
              <span>{session.duty_start.slice(0, 5)}z</span>
              <span className="mx-1">-</span>
              <span>{session.duty_end.slice(0, 5)}z</span>
            </div>
          </div>
        )}
      </div>

      {/* TRAILING COLUMN */}
      <div className="shrink-0 grid grid-rows-[auto_auto] grid-cols-[auto_auto] items-center gap-x-3">
        {/* Row 1 — empty spacer to align with leading row 1 */}
        {/* <div className="col-start-1 row-start-1" /> */}
        <div className="col-start-1 row-start-1 text-sm text-muted-foreground text-right">
          <span>
            {simulator?.model || simulator?.type}
          </span>
        </div>


        {/* Row 2 — duration */}
        <div className="col-start-1 row-start-2 text-right">
          {formatTime(session.session_minutes, "HH:mm", { showZero: true })}
        </div>

        {/* Row 3 — empty spacer to align with leading row 3 */}
        {session.duty_start && session.duty_end && (
          <div className="col-start-1 row-start-3" />
        )}

        {/* Chevron — vertically centered across all rows */}
        <ChevronRight className="col-start-2 row-span-3 w-5 h-5 text-muted-foreground self-center" />
      </div>
    </PositionedItem>
  );
}