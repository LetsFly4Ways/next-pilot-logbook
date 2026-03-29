"use client";

import { useState, useMemo } from "react";

import type { AirportEntry, RouteEntry } from "@/types/statistics";
import type { ResolvedWithCount } from "@/components/pages/dashboard/airport-card";

import { cn } from "@/lib/utils";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AirportsMap } from "@/components/pages/dashboard/airport-map";

// ── Types & Constants ─────────────────────────────────────────────────────────

type Tab = "airports" | "countries";

interface CountryEntry {
  countryCode: string;
  countryName: string;
  count: number;
  airportCount: number;
}

const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)",
];
const TOP_N = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  );
}

function buildCountries(resolved: ResolvedWithCount[]): CountryEntry[] {
  const map = new Map<string, CountryEntry>();
  for (const a of resolved) {
    const e = map.get(a.countryCode);
    if (e) {
      e.count += a.count;
      e.airportCount += 1;
    } else {
      map.set(a.countryCode, {
        countryCode: a.countryCode,
        countryName: a.countryName,
        count: a.count,
        airportCount: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

// ── Main Wrapper Component ────────────────────────────────────────────────────

interface DashboardProps {
  airports: AirportEntry[];
  resolvedAirports: ResolvedWithCount[];
  routes: RouteEntry[];
}

export function AirportsCardContent({ airports, resolvedAirports, routes }: DashboardProps) {
  const [tab, setTab] = useState<Tab>("airports");

  return (
    <div className="bg-form rounded-lg border border-form-border p-5 flex flex-col gap-4 md:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Airports</h2>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {(["airports", "countries"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer capitalize",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {airports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No airport data yet.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <AirportsChart tab={tab} airports={airports} resolved={resolvedAirports} />
          <AirportsMap resolved={resolvedAirports} routes={routes} />
        </div>
      )}
    </div>
  );
}

// ── Chart Sub-Component ───────────────────────────────────────────────────────

function AirportsChart({
  tab,
  airports,
  resolved,
}: {
  tab: Tab;
  airports: AirportEntry[];
  resolved: ResolvedWithCount[];
}) {
  const countries = useMemo(() => buildCountries(resolved), [resolved]);

  const isAirportTab = tab === "airports";

  // Data Sorting & Slicing
  const sortedAirports = [...airports].sort((a, b) => b.count - a.count);
  const totalAirportVisits = sortedAirports.reduce((s, a) => s + a.count, 0);
  const topAirports = sortedAirports.slice(0, TOP_N);
  const restAirports = sortedAirports.slice(TOP_N);

  const totalCountryVisits = countries.reduce((s, c) => s + c.count, 0);
  const topCountries = countries.slice(0, TOP_N);
  const restCountries = countries.slice(TOP_N);

  const topItems = isAirportTab ? topAirports : topCountries;
  const restCount = isAirportTab ? restAirports.length : restCountries.length;
  const otherCount = isAirportTab
    ? restAirports.reduce((s, a) => s + a.count, 0)
    : restCountries.reduce((s, c) => s + c.count, 0);
  const total = isAirportTab ? totalAirportVisits : totalCountryVisits;

  // Chart Setup
  const chartData = useMemo(() => [
    ...topItems.map((item, i) => ({
      key: isAirportTab ? (item as AirportEntry).code : (item as CountryEntry).countryCode,
      label: isAirportTab ? (item as AirportEntry).code : (item as CountryEntry).countryName,
      count: item.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    })),
    ...(otherCount > 0
      ? [{ key: "__other__", label: "Other", count: otherCount, fill: "hsl(var(--muted-foreground) / 0.25)" }]
      : []),
  ], [topItems, isAirportTab, otherCount]);

  const chartConfig = useMemo((): ChartConfig => {
    const cfg: ChartConfig = { count: { label: "Visits" } };
    chartData.forEach((d) => { cfg[d.key] = { label: d.label, color: d.fill }; });
    return cfg;
  }, [chartData]);

  const centerValue = isAirportTab ? airports.length : countries.length;
  const centerLabel = isAirportTab ? "Airports" : "Countries";

  return (
    <div className="md:w-72 shrink-0 flex flex-col gap-4">
      <ChartContainer config={chartConfig} className="w-full max-w-56 aspect-square mx-auto">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
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
                    <tspan x={vb.cx} y={vb.cy} className="fill-foreground text-2xl font-bold">
                      {centerValue}
                    </tspan>
                    <tspan x={vb.cx} y={vb.cy + 18} className="fill-muted-foreground text-xs">
                      {centerLabel}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex flex-col gap-1.5">
        {isAirportTab
          ? topAirports.map((airport, i) => {
            const rec = resolved.find((r) => r.code === airport.code);
            const flag = rec ? getFlagEmoji(rec.countryCode) : "";
            const pct = total > 0 ? Math.round((airport.count / total) * 100) : 0;
            return (
              <div key={airport.code} className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-base leading-none shrink-0">{flag}</span>
                <span className="text-xs font-mono font-medium flex-1 truncate">{airport.code}</span>
                <span className="text-xs tabular-nums text-muted-foreground shrink-0">{airport.count}×</span>
                <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">{pct}%</span>
              </div>
            );
          })
          : topCountries.map((country, i) => {
            const pct = total > 0 ? Math.round((country.count / total) * 100) : 0;
            return (
              <div key={country.countryCode} className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-base leading-none shrink-0">{getFlagEmoji(country.countryCode)}</span>
                <span className="text-xs flex-1 truncate">{country.countryName}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">{country.airportCount} apt</span>
                <span className="text-xs tabular-nums text-muted-foreground shrink-0">{country.count}×</span>
                <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">{pct}%</span>
              </div>
            );
          })}
        {otherCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25 shrink-0" />
            <span className="text-xs text-muted-foreground flex-1">{restCount} others</span>
            <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">
              {total > 0 ? Math.round((otherCount / total) * 100) : 0}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}