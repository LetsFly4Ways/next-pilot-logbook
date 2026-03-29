"use client";

import React from "react";

import { formatTime } from "@/lib/time-utils";
import type { CrewEntry } from "@/types/statistics";

import { Card } from "@/components/ui/card";

import { Users } from "lucide-react";

interface Props {
  crew: CrewEntry[];
}

export function TopCrewChart({ crew }: Props) {
  // Sort by minutes descending, take top 10
  const sorted = React.useMemo(
    () => [...crew].sort((a, b) => b.minutes - a.minutes).slice(0, 10),
    [crew]
  );

  const maxMinutes = Math.max(...sorted.map((d) => d.minutes), 1);

  return (
    <Card className="bg-form border-none shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Crew</h2>
        <Users className="w-4 h-4 text-muted-foreground" />
      </div>

      {crew.length === 0 ? (
        <p className="text-sm text-muted-foreground">No crew data yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((person, index) => {
            const percentage = (person.minutes / maxMinutes) * 100;
            const formattedTime = formatTime(person.minutes, "HH:mm", { showZero: true });

            return (
              <div key={person.name} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground tabular-nums w-4 shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {person.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground shrink-0">
                    {person.count ?? 0} &bull; {formattedTime}h
                  </span>
                </div>

                {/* Bottom Bar Track */}
                <div className="h-1 ml-6 bg-muted rounded-full overflow-hidden">
                  {/* Actual Filled Bar */}
                  <div
                    className="h-full rounded-r-sm bg-accent/90 transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,

                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex w-full gap-1 justify-end shrink-0">
        <span className="text-sm font-medium tabular-nums ">
          {crew.length}
        </span>
        <span className="text-sm text-muted-foreground">
          Crew
        </span>
      </div>
    </Card>
  );
}