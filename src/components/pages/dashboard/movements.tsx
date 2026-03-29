import type { DashboardStatsData } from "@/types/statistics";

import { Card } from "@/components/ui/card";

import { TrendingUp } from "lucide-react";

interface Props {
  stats: DashboardStatsData;
}

interface MovementRowProps {
  label: string;
  day: number;
  night: number;
}

function MovementRow({ label, day, night }: MovementRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground w-24">{label}</span>
      <div className="flex items-center gap-5 text-sm tabular-nums">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="font-medium">{day.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
          <span className="font-medium">{night.toLocaleString()}</span>
        </div>
        <div className="flex justify-end items-center w-14 gap-1 text-right">
          <span className="text-muted-foreground text-right">
            =
          </span>
          <span className="font-medium text-right">
            {(day + night).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MovementsCard({ stats }: Props) {
  return (
    <Card className="bg-form border-none shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Movements</h2>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Day
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Night
        </div>
      </div>

      <div className="flex flex-col">
        <MovementRow label="Takeoffs" day={stats.dayTakeoffs} night={stats.nightTakeoffs} />
        <MovementRow label="Landings" day={stats.dayLandings} night={stats.nightLandings} />
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Go-arounds</span>
          <span className="text-sm font-medium tabular-nums">
            {stats.goArounds.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}