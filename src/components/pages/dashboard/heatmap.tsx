"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import type { HeatmapDay } from "@/types/statistics";
import { Card } from "@/components/ui/card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MIN_CELL = 11;
const GAP = 4;
const DAY_COL_W = 28;

// ── Cell coloring ─────────────────────────────────────────────────────────────
//   Flight only → blue
//   Sim only    → red
//   Both        → violet
//   Empty       → muted

type CellType = "empty" | "flight" | "sim" | "both";

function getCellType(flightCount: number, simCount: number): CellType {
  if (flightCount > 0 && simCount > 0) return "both";
  if (flightCount > 0) return "flight";
  if (simCount > 0) return "sim";
  return "empty";
}

type Intensity = 1 | 2 | 3 | 4;

function getIntensity(count: number): Intensity {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const CELL_CLASSES: Record<CellType, Record<Intensity, string>> = {
  empty: { 1: "bg-muted", 2: "bg-muted", 3: "bg-muted", 4: "bg-muted" },
  flight: { 1: "bg-blue-600/25", 2: "bg-blue-600/50", 3: "bg-blue-600/75", 4: "bg-blue-600" },
  sim: { 1: "bg-red-600/25", 2: "bg-red-600/50", 3: "bg-red-600/75", 4: "bg-red-600" },
  both: { 1: "bg-violet-500/25", 2: "bg-violet-500/45", 3: "bg-violet-500/70", 4: "bg-violet-500" },
};

function getCellClass(flightCount: number, simCount: number): string {
  const type = getCellType(flightCount, simCount);
  if (type === "empty") return CELL_CLASSES.empty[1];
  return CELL_CLASSES[type][getIntensity(flightCount + simCount)];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: HeatmapDay[];
  availableYears: number[];
  selectedYear: number;
}

export function FlightHeatmap({ data, selectedYear }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MIN_CELL);

  // ── Build grid ──────────────────────────────────────────────────────────────
  const lookup = new Map(data.map((d) => [d.date, d]));

  const jan1 = new Date(selectedYear, 0, 1);
  const jan1DayOfWeek = (jan1.getDay() + 6) % 7;
  const isLeap =
    selectedYear % 4 === 0 &&
    (selectedYear % 100 !== 0 || selectedYear % 400 === 0);
  const totalDays = isLeap ? 366 : 365;

  type Cell = HeatmapDay | null;
  const cells: Cell[] = Array(jan1DayOfWeek).fill(null);

  for (let d = 0; d < totalDays; d++) {
    // Use Date.UTC to prevent timezone shifts
    const dateObj = new Date(Date.UTC(selectedYear, 0, d + 1));
    const dateStr = dateObj.toISOString().slice(0, 10);
    cells.push(lookup.get(dateStr) ?? { date: dateStr, count: 0, flightCount: 0, simCount: 0, minutes: 0 });
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const numWeeks = cells.length / 7;
  const weeks: Cell[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const monthLabels: { month: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    for (const cell of weeks[w]) {
      if (!cell) continue;
      const m = new Date(cell.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ month: MONTHS[m], col: w });
        lastMonth = m;
      }
      break;
    }
  }

  // ── Responsive cell sizing ──────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = (width: number) => {
      const available = width - DAY_COL_W - GAP - (numWeeks - 1) * GAP;
      setCellSize(Math.max(MIN_CELL, Math.floor(available / numWeeks)));
    };

    const obs = new ResizeObserver(([entry]) => compute(entry.contentRect.width));
    obs.observe(el);
    compute(el.clientWidth);
    return () => obs.disconnect();
  }, [numWeeks]);

  const gridW = DAY_COL_W + GAP + numWeeks * cellSize + (numWeeks - 1) * GAP;
  const needsScroll = cellSize === MIN_CELL;

  // ── Tooltip ─────────────────────────────────────────────────────────────────
  function buildTitle(cell: HeatmapDay): string {
    if (cell.count === 0) return cell.date;
    const parts: string[] = [cell.date];
    if ((cell.flightCount ?? 0) > 0)
      parts.push(`${cell.flightCount} flight${cell.flightCount !== 1 ? "s" : ""}`);
    if ((cell.simCount ?? 0) > 0)
      parts.push(`${cell.simCount} sim${cell.simCount !== 1 ? "s" : ""}`);
    parts.push(`${(cell.minutes / 60).toFixed(1)} h`);
    return parts.join(" · ");
  }

  return (
    <Card
      ref={containerRef}
      className={cn(
        "bg-form border-none shadow-sm p-4 gap-4",
        needsScroll ? "overflow-x-auto max-w-[calc(100dvw-2rem)]" : "overflow-hidden"
      )}
    >
      <div
        className="flex gap-1"
        style={{ width: needsScroll ? `${gridW}px` : "100%" }}
      >
        {/* Day labels */}
        <div
          className="flex flex-col pt-6 mr-1 shrink-0"
          style={{ gap: `${GAP}px`, width: `${DAY_COL_W - GAP}px` }}
        >
          {DAYS.map((day, i) => (
            <span
              key={day}
              style={{ height: `${cellSize}px` }}
              className={cn(
                "text-muted-foreground leading-none text-xs flex items-center",
                i % 2 !== 1 && "opacity-0 select-none"
              )}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col flex-1 min-w-0" style={{ gap: "2px" }}>
          {/* Month labels */}
          <div className="relative h-5 mb-1">
            <div className="flex" style={{ gap: `${GAP}px` }}>
              {weeks.map((_, colIdx) => {
                const label = monthLabels.find((m) => m.col === colIdx);
                return (
                  <div
                    key={colIdx}
                    className="relative shrink-0"
                    style={{ width: `${cellSize}px` }}
                  >
                    {label && (
                      <span className="absolute left-0 text-xs text-muted-foreground whitespace-nowrap">
                        {label.month}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cells */}
          <div className="flex" style={{ gap: `${GAP}px` }}>
            {weeks.map((week, colIdx) => (
              <div
                key={colIdx}
                className="flex flex-col shrink-0"
                style={{ gap: `${GAP}px`, width: `${cellSize}px` }}
              >
                {week.map((cell, rowIdx) => {
                  if (!cell) {
                    return (
                      <div
                        key={rowIdx}
                        style={{ width: cellSize, height: cellSize }}
                        className="opacity-0 rounded-[2px]"
                      />
                    );
                  }
                  return (
                    <div
                      key={rowIdx}
                      style={{ width: cellSize, height: cellSize }}
                      title={buildTitle(cell)}
                      className={cn(
                        "rounded-[2px] cursor-default shrink-0",
                        getCellClass(cell.flightCount ?? 0, cell.simCount ?? 0)
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-end flex-wrap">
        {[
          { label: "Flight", cls: "bg-blue-600" },
          { label: "Sim", cls: "bg-red-600" },
          { label: "Both", cls: "bg-violet-500" },
          { label: "None", cls: "bg-muted" },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              style={{ width: Math.min(cellSize, 11), height: Math.min(cellSize, 11) }}
              className={cn("rounded-[2px]", cls)}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}