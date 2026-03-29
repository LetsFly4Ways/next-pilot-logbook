"use client";

import * as React from "react";
import { PieChart, Pie } from "recharts";

import { formatTime } from "@/lib/time-utils";

import type { SpecialTimesData, TimeByFunction } from "@/types/statistics";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContentFormatted,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";

import { Clock } from "lucide-react";

interface Props {
  specialTimes: SpecialTimesData;
  timeByFunction: TimeByFunction;
}

const FUNCTION_COLORS: Record<string, string> = {
  PIC: "var(--chart-1)",
  "Co-Pilot": "var(--chart-2)",
  Dual: "var(--chart-3)",
  Instructor: "var(--chart-4)",
  Solo: "var(--chart-5)",
  SPIC: "var(--chart-6)",
  PICUS: "var(--chart-7)",
  Simulator: "var(--chart-8)",
};

const FALLBACK_COLORS = [
  "hsl(326 78% 60%)",
  "hsl(173 58% 39%)",
  "hsl(21 90% 48%)",
  "hsl(84 65% 43%)",
];

export function TimesByFunctionChart({ specialTimes, timeByFunction }: Props) {
  const timeByFunctionFiltered = Object.fromEntries(
    Object.entries(timeByFunction).filter(([key]) => key !== "Simulator")
  );

  // Sorted entries
  const entries = React.useMemo(
    () => Object.entries(timeByFunctionFiltered).sort(([, a], [, b]) => b - a),
    [timeByFunctionFiltered]
  );

  const total = React.useMemo(
    () => entries.reduce((s, [, h]) => s + h, 0),
    [entries]
  );

  // Chart data
  const chartData = entries.map(([name, value], i) => ({
    name,
    value,
    fill:
      FUNCTION_COLORS[name] ??
      FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  // Chart config (required for shadcn)
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Time" },
    };

    entries.forEach(([name], i) => {
      config[name] = {
        label: name,
        color:
          FUNCTION_COLORS[name] ??
          FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      };
    });

    return config;
  }, [entries]);

  return (
    <Card className="bg-form border-none shadow-sm p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Times</h2>
        <Clock className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Special times */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Night", value: specialTimes.nightMinutes },
          { label: "IFR", value: specialTimes.ifrMinutes },
          { label: "XC", value: specialTimes.xcMinutes },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-muted px-3 py-2.5 flex flex-col gap-0.5"
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {label}
            </span>
            <span className="text-base font-semibold tabular-nums">
              {formatTime(value, "HH:mm", { showZero: true })} h
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No function data yet.
        </p>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Pie */}
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-[200px] w-[200px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContentFormatted hideLabel />}
              />

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={70}
                strokeWidth={4}
              />
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 w-full max-w-sm">
            {entries.map(([func, time], i) => {
              const color =
                FUNCTION_COLORS[func] ??
                FALLBACK_COLORS[i % FALLBACK_COLORS.length];

              const pct =
                total > 0 ? Math.round((time / total) * 100) : 0;

              return (
                <div
                  key={func}
                  className="flex items-center gap-2 min-w-0"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />

                  <span className="text-xs truncate flex-1">
                    {func}
                  </span>

                  <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                    {formatTime(time, "HH:mm", { showZero: true })} h
                  </span>

                  <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}