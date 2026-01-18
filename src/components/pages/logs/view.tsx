import { Suspense } from "react";
import Link from "next/link";

import { fetchLog } from "@/actions/pages/logs/fetch";

import { Log } from "@/types/logs";

import { formatDate } from "@/lib/date-utils";

import FlightLogInfo from "@/components/pages/logs/flight-info";
import SimulatorLogInfo from "@/components/pages/logs/simulator-info";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorContainer } from "@/components/ui/error-container";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface LogPageProps {
  id: string;
  type: "flight" | "simulator";
}

export default async function LogPage({ id, type }: LogPageProps) {
  const { log, error } = await fetchLog(id);

  const date = log?.date ? new Date(log.date) : null;

  if (error || !log || log._type !== type) {
    return (
      <div>
        <PageHeader
          title="Error Loading Log"
          backHref="/app/logs"
          showBackButton
          isTopLevelPage={false}
        />

        <ErrorContainer
          title="Error Loading Log"
          message={error || "Log not found"}
        />
      </div>
    );
  }

  return (<div className="flex flex-col">
    <PageHeader
      title={date ? formatDate(date.toISOString()) : `${type === "flight" ? "Flight Log" : "Simulator Session"}`}
      backHref="/app/logs"
      showBackButton
      isTopLevelPage={false}
      actionButton={
        <Button
          variant="ghost"
          className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
        >
          <Link href={`/app/logs/${id}/edit`}>
            <span>Edit</span>
          </Link>
        </Button>
      }
    />

    <div className="p-6">
      <Suspense fallback={<LogInfoSkeleton />}>
        <LogContent log={log} />
      </Suspense>
    </div>
  </div>)
}

interface LogContentProps {
  log: Log
}

// Main log content component
async function LogContent({ log }: LogContentProps) {
  return log._type === "flight" ? (
    <FlightLogInfo flight={log} />
  ) : (
    <SimulatorLogInfo session={log} />
  );
}

// Loading skeleton component
function LogInfoSkeleton() {
  return (
    <div>
      {/* Header Section Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col justify-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-col items-end justify-center">
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Statistics Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      <Separator className="w-full my-4" />

      {/* Times Table Skeleton */}
      <div>
        <div className="p-3 grid grid-cols-3 gap-x-4 items-center">
          <div></div>
          <Skeleton className="h-4 w-12 mx-auto" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="grid grid-cols-3 gap-x-4 items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        ))}
      </div>

      <Separator className="w-full my-4" />

      {/* Additional sections skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}