"use client";

import type { DashboardStatsData } from "@/types/statistics";

import { formatTime } from "@/lib/time-utils";

import { CarouselWithDots } from "@/components/layout/carousel";
import { Card } from "@/components/ui/card";

import { Plane, Clock, Timer, LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: string;
  sub: string;
  Icon: LucideIcon;
}

function StatCard({ label, value, sub, Icon }: StatItem) {
  return (
    <Card className="bg-form border-none shadow-sm p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-base md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </Card>
  )
}

interface DashboardStatsProps {
  stats: DashboardStatsData
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards: StatItem[] = [
    {
      label: "Total Logs",
      value: stats.totalLogs.toLocaleString(),
      sub: `${stats.totalFlightLogs.toLocaleString()} Flights · ${stats.totalSimLogs.toLocaleString()} Sessions`,
      Icon: Plane,
    },
    {
      label: "Total Hours",
      value: `${formatTime(stats.totalBlockMinutes, "HH:mm", { showZero: true })} h`,
      sub: `${formatTime(stats.flightBlockMinutes, "HH:mm", { showZero: true })} Flight · ${formatTime(stats.simBlockMinutes, "HH:mm", { showZero: true })} Sim`,
      Icon: Clock,
    },
    {
      label: "Last 30 Days",
      value: stats.flightsLast30.toLocaleString(),
      sub: `Logs · ${formatTime(stats.blockMinutesLast30, "HH:mm", { showZero: true })} h`,
      Icon: Timer,
    },
  ];

  const mobileSlides = cards.map((stat) => (
    <StatCard key={stat.label} {...stat} />
  ));

  return (
    <>
      <div className="hidden md:grid md:grid-cols-3 gap-3">
        {cards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="md:hidden max-w-[calc(100dvw-2rem)]">
        <CarouselWithDots
          items={mobileSlides}
          opts={{ loop: true }}
          className="gap-4"
        />
      </div>
    </>
  )
}