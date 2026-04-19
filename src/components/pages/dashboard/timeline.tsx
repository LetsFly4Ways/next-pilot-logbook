"use client";

import { DashboardResult } from "@/types/statistics";

import { Card } from "@/components/ui/card";
import { TimeChart } from "@/components/pages/dashboard/time-chart";

import { ChartLine } from "lucide-react";

interface Props {
  data: DashboardResult["data"]
}

export default function ActivityTimeline({ data }: Props) {
  // const [view, setView] = useState<"calendar" | "chart">("calendar");

  return (
    <Card className="bg-form border-none shadow-sm px-2 py-4 flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold tracking-tight">Timeline</h2>
        <ChartLine className="w-4 h-4 text-muted-foreground" />

        {/* <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {(["calendar", "chart"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div> */}
      </div>

      {/* Content */}
      {/* {view === "calendar" ? (
        // <Heatmap
        //   data={data.heatmapData}
        //   availableYears={data.availableYears}
        //   selectedYear={2026} // Update this based on filter (in future, change this to "filter" and display based on year)
        // />
        <HeatmapCardContent data={data.heatmapData} />

      ) : (
        <TimeChart monthlyData={data.monthlyData} filter={"all"} />
      )} */}

      <TimeChart monthlyData={data.monthlyData} filter={"all"} />
    </Card>
  )
}