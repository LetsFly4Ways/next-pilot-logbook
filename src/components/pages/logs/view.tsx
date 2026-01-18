import { Suspense } from "react";
import Link from "next/link";

import { fetchLog } from "@/actions/pages/logs/fetch";

import { Log } from "@/types/logs";

import { formatDate } from "@/lib/date-utils";

import FlightLogInfo, { FlightLogInfoSkeleton } from "@/components/pages/logs/flight-info";
import SimulatorLogInfo, { SimulatorLogInfoSkeleton } from "@/components/pages/logs/simulator-info";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorContainer } from "@/components/ui/error-container";

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

        <div className="p-6">
          <ErrorContainer
            title="Error Loading Log"
            message={error || "Log not found"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
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

      {/* Skeleton based on type */}
      <Suspense fallback={type === "flight" ? <FlightLogInfoSkeleton /> : <SimulatorLogInfoSkeleton />}>
        <LogContent log={log} />
      </Suspense>
    </div>
  )
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