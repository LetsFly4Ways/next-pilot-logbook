"use client";

import { useState } from "react";

import { DistanceUnit } from "@/types/airports";
import { LongestFlight, MostFrequentRoute } from "@/types/statistics";

import { formatTime } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

import { Card } from "@/components/ui/card";

import { Globe, LucideIcon, Milestone, Route } from "lucide-react";

// ── Distance conversion (always from nm) ─────────────────────────────────────

const NM_TO_M = 1852;
const NM_TO_FT = 1852 / 0.3048;

function convertFromNm(nm: number, unit: DistanceUnit): number {
  switch (unit) {
    case "nm": return Math.round(nm);
    case "m": return Math.round(nm * NM_TO_M);
    case "ft": return Math.round(nm * NM_TO_FT);
  }
}

function formatDistance(nm: number, unit: DistanceUnit): string {
  const val = convertFromNm(nm, unit);
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k ${unit}`;
  return `${val.toLocaleString()} ${unit}`;
}

// ── Reference comparisons — always in nm (ratios don't change with display unit)
const EARTH_CIRCUMFERENCE_NM = 21_639;
const MOON_DISTANCE_NM = 207_370;
const EARTH_TO_SUN_NM = 81_395_000;

function getDistanceComparison(nm: number): { label: string; value: string } {
  if (nm >= EARTH_TO_SUN_NM * 0.05) {
    return {
      label: "of the way to the Sun",
      value: `${((nm / EARTH_TO_SUN_NM) * 100).toFixed(2)}%`,
    };
  }
  if (nm >= MOON_DISTANCE_NM) {
    return {
      label: "times to the Moon",
      value: `${(nm / MOON_DISTANCE_NM).toFixed(1)}×`,
    };
  }
  if (nm >= EARTH_CIRCUMFERENCE_NM) {
    return {
      label: "times around Earth",
      value: `${(nm / EARTH_CIRCUMFERENCE_NM).toFixed(1)}×`,
    };
  }
  return {
    label: "of Earth's circumference",
    value: `${((nm / EARTH_CIRCUMFERENCE_NM) * 100).toFixed(1)}%`,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  totalDistanceNm: number;
  longestFlight: LongestFlight | null;
  mostFrequentRoute: MostFrequentRoute | null;
  defaultUnit: DistanceUnit;
}

// ── Root card ─────────────────────────────────────────────────────────────────

export default function JourneysCard({
  totalDistanceNm,
  longestFlight,
  mostFrequentRoute,
  defaultUnit,
}: Props) {
  const [activeUnit, setActiveUnit] = useState<DistanceUnit>(defaultUnit);

  return (
    <Card className="bg-form border-none shadow-sm p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Journeys</h2>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {/* Unit toggle pill */}
          {(["nm", "m", "ft"] as DistanceUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => setActiveUnit(u)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                activeUnit === u
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
        <TotalDistancePanel
          totalDistanceNm={totalDistanceNm}
          activeUnit={activeUnit}
        />
        <LongestFlightPanel
          longestFlight={longestFlight}
          activeUnit={activeUnit}
        />
        <TopRoutePanel
          mostFrequentRoute={mostFrequentRoute}
          activeUnit={activeUnit}
        />
      </div>
    </Card>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs font-medium uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function RouteDisplay({ departure, destination }: { departure: string; destination: string }) {
  return (
    <div className="flex items-center text-xl font-semibold tabular-nums tracking-wide">
      <span>{departure}</span>
      <span className="mx-2 -translate-y-px">»</span>
      <span>{destination}</span>
    </div>
  );
}

// ── Panel: Total Distance ─────────────────────────────────────────────────────

function TotalDistancePanel({
  totalDistanceNm,
  activeUnit,
}: {
  totalDistanceNm: number;
  activeUnit: DistanceUnit;
}) {
  const comparison = getDistanceComparison(totalDistanceNm);

  return (
    <div className="flex flex-col justify-between h-full pb-4 md:pb-0 md:pr-4">
      <SectionLabel icon={Globe} label="Total Distance" />
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold tabular-nums tracking-tight leading-none">
          {formatDistance(totalDistanceNm, activeUnit)}
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="font-semibold tabular-nums text-accent">
            {comparison.value}
          </span>
          <span className="text-sm text-muted-foreground">
            {comparison.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Panel: Longest Flight ─────────────────────────────────────────────────────

function LongestFlightPanel({
  longestFlight,
  activeUnit,
}: {
  longestFlight: LongestFlight | null;
  activeUnit: DistanceUnit;
}) {
  return (
    <div className="flex flex-col justify-between h-full py-4 md:py-0 md:px-4">
      <SectionLabel icon={Milestone} label="Longest Flight" />
      {!longestFlight ? (
        <span className="text-baseline text-muted-foreground">No data yet.</span>
      ) : (
        <div className="flex flex-col gap-2">
          <RouteDisplay
            departure={longestFlight.departure}
            destination={longestFlight.destination}
          />
          <div className="flex items-center gap-3 ">
            <span className="font-semibold tabular-nums text-lg">
              {formatTime(longestFlight.minutes, "HH:mm", { showZero: true })}h
            </span>
            {longestFlight.distanceNm != null && longestFlight.distanceNm > 0 && (
              <span className="text-muted-foreground tabular-nums text-baseline">
                {formatDistance(longestFlight.distanceNm, activeUnit)}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(longestFlight.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Panel: Most Frequent Route ────────────────────────────────────────────────

function TopRoutePanel({
  mostFrequentRoute,
  activeUnit,
}: {
  mostFrequentRoute: MostFrequentRoute | null;
  activeUnit: DistanceUnit;
}) {
  return (
    <div className="flex flex-col justify-between h-full pt-4 md:pt-0 md:pl-4">
      <SectionLabel icon={Route} label="Top Route" />
      {!mostFrequentRoute ? (
        <span className="text-baseline text-muted-foreground">No data yet.</span>
      ) : (
        <div className="flex flex-col gap-2">
          <RouteDisplay
            departure={mostFrequentRoute.departure}
            destination={mostFrequentRoute.destination}
          />
          <div className="flex items-center gap-3">
            <span className="font-semibold tabular-nums text-lg">
              {mostFrequentRoute.count}×
            </span>
            {mostFrequentRoute.distanceNm != null && mostFrequentRoute.distanceNm > 0 && (
              <span className="text-muted-foreground tabular-nums text-baseline">
                {formatDistance(mostFrequentRoute.distanceNm, activeUnit)}
              </span>
            )}
          </div>
          {mostFrequentRoute.avgMinutes != null && (
            <span className="text-sm text-muted-foreground tabular-nums">
              Average{" "}
              {formatTime(mostFrequentRoute.avgMinutes, "HH:mm", { showZero: true })}h
            </span>
          )}
        </div>
      )}
    </div>
  );
}