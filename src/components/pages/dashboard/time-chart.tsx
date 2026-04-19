"use client";

import { useMemo } from "react";

import { DashboardFilter, MonthlyDataPoint } from "@/types/statistics";

import { formatTime } from "@/lib/time-utils";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

type Granularity = "monthly" | "quarterly" | "yearly";

function granularityFromFilter(filter: DashboardFilter, monthCount: number): Granularity {
  // Short rolling windows always show months
  if (filter === "rolling_30d" || filter === "rolling_90d" || filter === "rolling_12m") return "monthly";
  // Specific year — 12 months, monthly is perfect
  if (/^\d{4}$/.test(filter)) return "monthly";
  // "all" — scale to the actual data span
  if (monthCount > 48) return "yearly";
  if (monthCount > 18) return "quarterly";
  return "monthly";
}

function tickLabel(month: string) {
  if (/Q\d$/.test(month)) return month;        // "2024-Q3"
  if (/^\d{4}$/.test(month)) return month;     // "2024"
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", {
    month: "short",
    year: "2-digit",
  });
}

/** Zero-fills every month between the first and last entry in the data. */
function fillMonths(data: MonthlyDataPoint[]): MonthlyDataPoint[] {
  if (data.length === 0) return [];
  const byMonth = new Map(data.map((d) => [d.month, d]));
  const [fy, fm] = data[0].month.split("-").map(Number);
  const [ly, lm] = data[data.length - 1].month.split("-").map(Number);
  const result: MonthlyDataPoint[] = [];
  let y = fy, m = fm;
  while (y < ly || (y === ly && m <= lm)) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    result.push(
      byMonth.get(key) ?? {
        month: key,
        blockMinutes: 0,
        airMinutes: 0,
        flightBlockMinutes: 0,
        simMinutes: 0,
        flights: 0,
        avgDepartureDelayMin: 0,
        avgArrivalDelayMin: 0,
        cumulativeDepartureDelayHours: 0,
      }
    );
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return result;
}

function aggregate(data: MonthlyDataPoint[], g: Granularity): MonthlyDataPoint[] {
  if (g === "monthly") return data;
  const bucketKey = (month: string) => {
    const [y, mo] = month.split("-").map(Number);
    return g === "yearly" ? `${y}` : `${y}-Q${Math.ceil(mo / 3)}`;
  };
  const map = new Map<string, MonthlyDataPoint>();
  for (const d of data) {
    const key = bucketKey(d.month);
    const prev = map.get(key);
    map.set(key, prev ? {
      month: key,
      blockMinutes: prev.blockMinutes + d.blockMinutes,
      airMinutes: prev.airMinutes + d.airMinutes,
      flightBlockMinutes: prev.flightBlockMinutes + d.flightBlockMinutes,
      simMinutes: prev.simMinutes + d.simMinutes,
      flights: prev.flights + d.flights,
      avgDepartureDelayMin: 0,
      avgArrivalDelayMin: 0,
      cumulativeDepartureDelayHours: 0,
    } : { ...d, month: key });
  }
  return Array.from(map.values());
}

/** Area chart configuration for flight and sim time */
const FLIGHT_COLOR = "#2563eb"; // blue-600
const SIM_COLOR = "#dc2626"; // red-600

const chartConfig: ChartConfig = {
  flightBlockMinutes: { label: "Flight Time", color: FLIGHT_COLOR },
  simMinutes: { label: "Sim Time", color: SIM_COLOR },
}

interface Props {
  monthlyData: MonthlyDataPoint[];
  filter: DashboardFilter;
}

export function TimeChart({ monthlyData, filter }: Props) {
  const filledData = useMemo(() => fillMonths(monthlyData), [monthlyData]);
  const granularity = granularityFromFilter(filter, filledData.length);
  const chartData = useMemo(() => aggregate(filledData, granularity), [filledData, granularity]);

  if (filledData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No data for this period
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="h-52 w-full min-w-0 max-w-full"
    >
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="gradFlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={FLIGHT_COLOR} stopOpacity={0.3} />
            <stop offset="95%" stopColor={FLIGHT_COLOR} stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="gradSim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={SIM_COLOR} stopOpacity={0.3} />
            <stop offset="95%" stopColor={SIM_COLOR} stopOpacity={0.03} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />

        <XAxis
          dataKey="month"
          tickFormatter={tickLabel}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${Math.round(v / 60)}h`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => (
                <>
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-1 justify-between items-center gap-2 leading-none">
                    <span className="text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {formatTime(value as number, "HH:mm", { showZero: true })}
                    </span>
                  </div>
                </>
              )}
            />
          }
        />

        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(v) => chartConfig[v as keyof typeof chartConfig]?.label ?? v}
        />

        <Area
          type="monotone"
          dataKey="flightBlockMinutes"
          stroke={FLIGHT_COLOR}
          fill="url(#gradFlight)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="simMinutes"
          stroke={SIM_COLOR}
          fill="url(#gradSim)"
          strokeWidth={2}
        />

      </AreaChart>
    </ChartContainer>
  )
}