"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/time-utils";

import type { AircraftTypeEntry, AircraftRegistrationEntry } from "@/types/statistics";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContentFormatted,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";

interface Props {
  types: AircraftTypeEntry[];
  registrations: AircraftRegistrationEntry[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
];

const TOP_N = 10;

export function TopAircraftChart({ types, registrations }: Props) {
  const [tab, setTab] = React.useState<"types" | "registrations">("registrations");

  const allItems = React.useMemo(() => {
    const src = tab === "types" ? types : registrations;
    return [...src]
      .sort((a, b) => b.minutes - a.minutes)
      .map((e, i) => ({
        key: tab === "types" ? (e as AircraftTypeEntry).type : (e as AircraftRegistrationEntry).registration,
        label: tab === "types" ? (e as AircraftTypeEntry).type : (e as AircraftRegistrationEntry).registration,
        sublabel: tab === "registrations" ? (e as AircraftRegistrationEntry).type : undefined,
        count: e.minutes,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [tab, types, registrations]);

  const total = allItems.reduce((s, i) => s + i.count, 0);
  const topItems = allItems.slice(0, TOP_N);
  const otherItems = allItems.slice(TOP_N);
  const otherTotal = otherItems.reduce((s, i) => s + i.count, 0);

  // Chart uses ALL items; "Other" groups the tail
  const chartData = [
    ...topItems,
    ...(otherTotal > 0
      ? [{ key: "__other__", label: "Other", sublabel: undefined, count: otherTotal, fill: "hsl(var(--muted-foreground) / 0.25)" }]
      : []),
  ];

  const chartConfig = React.useMemo((): ChartConfig => {
    const cfg: ChartConfig = { value: { label: "Time" } };
    chartData.forEach((item) => {
      cfg[item.key] = { label: item.label, color: item.fill };
    });
    return cfg;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, allItems]);

  const centerCount = tab === "types" ? types.length : registrations.length;
  const centerLabel = tab === "types" ? "Types" : "Reg.";

  const shouldSplit = topItems.length > 5;
  const mid = Math.ceil(topItems.length / 2);
  const col1 = topItems.slice(0, mid);
  const col2 = topItems.slice(mid);

  return (
    <Card className="bg-form border-none shadow-sm p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Aircraft</h2>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {(["registrations", "types"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "types" ? "Types" : "Reg."}
            </button>
          ))}
        </div>
      </div>

      {allItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No aircraft data yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Donut chart — all data */}
          <ChartContainer
            config={chartConfig}
            className="w-full max-w-60 aspect-square"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContentFormatted hideLabel />}
              />

              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={0}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    const vb = viewBox as { cx: number; cy: number };
                    if (!vb?.cx || !vb?.cy) return null;
                    return (
                      <text x={vb.cx} y={vb.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={vb.cx}
                          y={vb.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {centerCount}
                        </tspan>

                        <tspan
                          x={vb.cx}
                          y={vb.cy + 18}
                          className="fill-muted-foreground text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend — top 10 only */}
          {!shouldSplit ? (
            <div className="flex flex-col gap-1.5 w-full max-w-sm">
              {topItems.map((item) => (
                <LegendRow key={item.key} item={item} pct={total > 0 ? Math.round((item.count / total) * 100) : 0} />
              ))}
              {otherTotal > 0 && <OtherRow count={otherItems.length} pct={total > 0 ? Math.round((otherTotal / total) * 100) : 0} />}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
              {[col1, col2].map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  {col.map((item) => (
                    <LegendRow key={item.key} item={item} pct={total > 0 ? Math.round((item.count / total) * 100) : 0} />
                  ))}
                  {colIdx === 1 && otherTotal > 0 && (
                    <OtherRow count={otherItems.length} pct={total > 0 ? Math.round((otherTotal / total) * 100) : 0} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function LegendRow({
  item,
  pct,
}: {
  item: { key: string; label: string; sublabel?: string; count: number; fill: string };
  pct: number;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.fill }} />
      <div className="flex-1 min-w-0">
        <span className="text-xs truncate block">{item.label}</span>
        {item.sublabel && (
          <span className="text-[10px] text-muted-foreground truncate block">{item.sublabel}</span>
        )}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground shrink-0">
        {formatTime(item.count, "HH:mm", { showZero: true })}
      </span>
      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">
        {pct}%
      </span>
    </div>
  );
}

function OtherRow({ count, pct }: { count: number; pct: number }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25 shrink-0" />
      <span className="text-xs text-muted-foreground flex-1">{count} others</span>
      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{pct}%</span>
    </div>
  );
}