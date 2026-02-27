import Link from "next/link";

import { getPreferences } from "@/actions/user-preferences";

import { SimulatorSessionRecord } from "@/actions/pages/logs/fetch";

import { formatDate } from "@/lib/date-utils";
import { formatTime } from "@/lib/time-utils";


import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface SimulatorLogInfoProps {
  session: SimulatorSessionRecord & { _type: "simulator" };
}

export default async function SimulatorLogInfo({ session }: SimulatorLogInfoProps) {
  const prefsResult = await getPreferences();
  const preferences = prefsResult.preferences;

  const showHobbs = preferences?.logging?.fields?.hobbs ?? true;
  const showDuty = preferences?.logging?.fields?.duty ?? true;
  const showTraining = preferences?.logging?.fields?.training ?? true;

  const timeRows = [
    showDuty ? "duty" : null,
    showHobbs ? "hobbs" : null,
  ].filter(Boolean);


  return (
    <div className="p-6">
      {/* Header */}
      <div className="relative grid gap-4 md:grid-cols-3 md:items-center">
        {/* LEFT — Date + Flight number */}
        <div className="flex flex-col gap-0.5 md:justify-center">
          <div className="text-sm text-muted-foreground">
            {formatDate(session.date, "short")}
          </div>
        </div>

        {/* CENTER — Route + Aircraft */}
        <div className="flex flex-col items-center justify-center gap-3">
          {/* Route */}
          <div className="inline-flex items-center">
            <span className="text-2xl md:text-2xl font-bold md:font-semibold">Simulator</span>
          </div>

          {/* Aircraft */}
          {session._simulator && (
            <Link
              href={`/app/fleet/${session.aircraft_id}`}
              className="inline-flex items-center font-medium text-sm md:text-base hover:bg-muted rounded px-3 py-1 md:px-2"
            >
              {`${session._simulator.registration} ${(session._simulator.model || session._simulator.type) && `| ${session._simulator.model || session._simulator.type}`}`}
            </Link>
          )}
        </div>

        {/* RIGHT — Block time */}
        <div
          className="absolute right-0 top-0 md:static flex justify-end md:items-end"
        >
          <div className="text-right">
            <div className="text-2xl md:text-xl font-bold md:font-medium">
              {formatTime(session.session_minutes, "HH:mm", {
                suffix: true,
              })}
            </div>
            <div className="md:hidden text-xs text-muted-foreground">
              Block Time
            </div>
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Hours Section - Times Table */}
      {/* Add fallback */}
      {timeRows.length > 0 && (
        <>
          <div>
            <div className="p-3 grid grid-cols-3 gap-x-4 items-center">
              <div></div>

              <div className="flex justify-center">
                <span className="text-sm font-semibold text-center">OFF</span>
              </div>

              <div className="flex justify-center">
                <span className="text-sm font-semibold text-center">ON</span>
              </div>
            </div>

            {timeRows.map((row) => {
              switch (row) {
                case "duty":
                  return (
                    <div className="p-3" key="duty">
                      <div className="grid grid-cols-3 gap-x-4 items-center">
                        <div className="flex justify-start">
                          <span className="text-sm font-semibold text-center">
                            Duty
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <span className="text-sm font-medium text-center">
                            {formatTime(session.duty_start)}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <span className="text-sm font-medium text-center">
                            {formatTime(session.duty_end)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                case "hobbs":
                  return (
                    <div className="p-3" key="hobbs">
                      <div className="grid grid-cols-3 gap-x-4 items-center">
                        <div className="flex justify-start">
                          <span className="text-sm font-semibold text-center">
                            Hobbs
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <span className="text-sm font-medium text-center">
                            {session.hobbs_start || "-"}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <span className="text-sm font-medium text-center">
                            {session.hobbs_end || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          <Separator className="w-full my-4" />
        </>)}



      {/* Time Totals Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Time Information
        </h3>

        {(showDuty && session.duty_time_minutes) ? (
          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Duty Time</span>
              <span className="text-sm">
                {formatTime(session.duty_time_minutes, "HH:mm", { suffix: true, showZero: true })}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 text-sm text-muted-foreground text-center">
            No time information available
          </div>
        )}
      </div>

      <Separator className="w-full my-4" />

      {/* Crew */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Crew Information
        </h3>

        {!session.instructor_is_self && session._instructor ? (
          <div className="p-3 pr-1 flex items-center justify-between">
            <span className="text-sm font-semibold">Instructor</span>
            <span className="text-sm">
              <Link
                href={`/app/crew/${session._instructor.id}`}
                className="inline-flex items-center gap-2 font-medium text-sm hover:bg-muted rounded py-1 px-2"
              >
                <span>{session._instructor.full_name}</span>

                {session._instructor.company_id && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {session._instructor.company_id}
                  </span>
                )}
              </Link>

            </span>
          </div>
        ) : session.instructor_is_self ? (
          <div className="p-3 pr-1 flex items-center justify-between">
            <span className="text-sm font-semibold">Instructor</span>
            <span className="text-sm">SELF</span>
          </div>
        ) : (
          <div className="p-3 text-sm text-muted-foreground text-center">
            No crew information available
          </div>
        )}
      </div>

      <Separator className="w-full my-4" />

      {/* Remarks Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Notes
        </h3>
        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Remarks</span>
          <span className="text-sm">{session.remarks || "-"}</span>
        </div>

        {showTraining && (
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Training</span>
            <span className="text-sm">{session.training_description || "-"}</span>
          </div>
        )}
      </div>

      <Separator className="w-full my-4" />

      {/* Metadata Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Metadata
        </h3>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Created</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(session.created_at, "long")}
          </span>
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Last Updated</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(session.updated_at, "long")}
          </span>
        </div>
      </div>
    </div>
  )
}

export function SimulatorLogInfoSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="relative grid gap-4 md:grid-cols-3 md:items-center">
        {/* LEFT — Date */}
        <div className="flex flex-col gap-0.5 md:justify-center">
          <Skeleton className="h-4 w-24" />
        </div>

        {/* CENTER — Title + Aircraft */}
        <div className="flex flex-col items-center justify-center gap-3">
          {/* Title */}
          <div className="inline-flex items-center">
            <Skeleton className="h-8 w-32" />
          </div>

          {/* Aircraft */}
          <Skeleton className="h-6 w-32" />
        </div>

        {/* RIGHT — Session time */}
        <div className="absolute right-0 top-0 md:static flex justify-end md:items-end">
          <div className="text-right">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20 mt-1 md:hidden" />
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Times Table Skeleton (Optional - may not show) */}
      <div>
        <div className="p-3 grid grid-cols-3 gap-x-4 items-center">
          <div></div>
          <Skeleton className="h-4 w-8 mx-auto" />
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="grid grid-cols-3 gap-x-4 items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12 mx-auto" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          </div>
        ))}
      </div>

      <Separator className="w-full my-4" />

      {/* Time Information Section Skeleton */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Crew Information Skeleton */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Notes Section Skeleton */}
      <div>
        <Skeleton className="h-4 w-16 mb-3" />
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Metadata Section Skeleton */}
      <div>
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}