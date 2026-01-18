import Link from "next/link";

import { fetchAndFormatCrewMember } from "@/actions/pages/crew/fetch";
import { fetchAndFormatAircraft } from "@/actions/pages/fleet/fetch";
import { getPreferences } from "@/actions/user-preferences";

import { formatDate, formatTime } from "@/lib/date-utils";
import { ArrayToText, formatMovement, getSelectedFunction } from "@/lib/log-utils";

import { Flight } from "@/types/logs";

import { Separator } from "@/components/ui/separator";

import { Check, X } from "lucide-react";

interface FlightLogInfoProps {
  flight: Flight & { _type: "flight" };
}

export default async function FlightLogInfo({ flight }: FlightLogInfoProps) {
  const prefsResult = await getPreferences();
  const preferences = prefsResult.preferences;

  const showHobbs = preferences?.logging?.fields?.hobbs ?? true;
  const showTach = preferences?.logging?.fields?.tach ?? true;
  const showScheduled = preferences?.logging?.fields?.scheduled ?? true;
  const showDuty = preferences?.logging?.fields?.duty ?? true;
  const showXC = preferences?.logging?.fields?.xc ?? true;
  const showPassengers = preferences?.logging?.fields?.passengers ?? true;
  const showFuel = preferences?.logging?.fields?.fuel ?? true;
  const showApproaches = preferences?.logging?.fields?.approaches ?? true;
  const showGoArounds = preferences?.logging?.fields?.go_arounds ?? true;
  const showTraining = preferences?.logging?.fields?.training ?? true;
  const nameFormat = preferences?.nameDisplay ?? "first-last";

  const timeRows = [
    "block",
    "flight",
    showScheduled ? "scheduled" : null,
    showDuty ? "duty" : null,
    showHobbs ? "hobbs" : null,
    showTach ? "tach" : null,
    "night",
    "ifr",
    showXC ? "xc" : null,
  ].filter(Boolean);

  const miscItems = [
    {
      key: "approaches",
      show: showApproaches,
      hasValue: flight.approaches && flight.approaches.length > 0,
      label: "Approaches",
      value: ArrayToText({ items: flight.approaches }),
    },
    {
      key: "go_arounds",
      show: showGoArounds,
      hasValue: flight.go_arounds != null,
      label: "Go-Arounds",
      value: flight.go_arounds,
    },
    {
      key: "passengers",
      show: showPassengers,
      hasValue: flight.passengers != null,
      label: "Passengers",
      value: flight.passengers,
    },
    {
      key: "fuel",
      show: showFuel,
      hasValue: flight.fuel != null,
      label: "Fuel",
      value: flight.fuel,
    },
  ];

  const visibleItems = miscItems.filter(item => item.show);
  const hasAnyContent = visibleItems.some(item => item.hasValue);

  const { aircraft } = await fetchAndFormatAircraft(flight.aircraft_id);

  let crew: Awaited<
    ReturnType<typeof fetchAndFormatCrewMember>
  >["crew"] = null;

  if (!flight.is_pic && flight.pic_id) {
    const result = await fetchAndFormatCrewMember(flight.pic_id, nameFormat);
    crew = result.crew;
  }

  return (
    <div>
      <div className="relative grid gap-4 md:grid-cols-3 md:items-center">
        {/* LEFT — Date + Flight number */}
        <div className="flex flex-col gap-0.5 md:justify-center">
          <div className="text-sm text-muted-foreground">
            {formatDate(flight.date, "short")}
          </div>
          {flight.flight_number && (
            <div className="text-base md:text-lg font-medium">
              {flight.flight_number}
            </div>
          )}
        </div>

        {/* CENTER — Route + Aircraft */}
        <div className="flex flex-col items-center justify-center gap-3">
          {/* Route */}
          <div className="inline-flex items-center gap-3">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl md:text-2xl font-bold md:font-semibold">
                {flight.departure_airport_code}
              </div>

              {flight.departure_runway && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  RWY {flight.departure_runway}
                </div>
              )}
            </div>

            <span className="text-xl font-bold md:font-semibold transform translate-y-[-1px]">»</span>

            {/* Destination */}
            <div className="text-center">
              <div className="text-2xl md:text-2xl font-bold md:font-semibold">
                {flight.destination_airport_code}
              </div>

              {flight.destination_runway && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  RWY {flight.destination_runway}
                </div>
              )}
            </div>
          </div>

          {/* Aircraft */}
          {aircraft && (
            <Link
              href={`/app/fleet/${flight.aircraft_id}`}
              className="inline-flex items-center font-medium text-sm md:text-base hover:bg-muted rounded px-3 py-1 md:px-2"
            >
              {aircraft.displayName}
            </Link>
          )}
        </div>

        {/* RIGHT — Block time */}
        <div
          className="absolute right-0 top-0 md:static flex justify-end md:items-end"
        >
          <div className="text-right">
            <div className="text-2xl md:text-xl font-bold md:font-medium">
              {formatTime(flight.total_block_minutes, "HH:mm", {
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

      {/* Statistics Section */}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatMovement(flight.day_takeoffs, flight.night_takeoffs)}
          </div>
          <div className="text-sm text-muted-foreground">Takeoffs</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatMovement(flight.day_landings, flight.night_landings)}
          </div>
          <div className="text-sm text-muted-foreground">Landings</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">

            {/* TEMPORARY */}
            {getSelectedFunction(flight)}
            {/* PIC */}
          </div>
          <div className="text-sm text-muted-foreground">Function</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatTime(flight.total_air_minutes)}
          </div>
          <div className="text-sm text-muted-foreground">Flight Time</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {flight.passengers || 0}
          </div>
          <div className="text-sm text-muted-foreground">Passengers</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">

            {/* TEMPORARY */}
            {formatTime(0)}
          </div>
          <div className="text-sm text-muted-foreground">Delay</div>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Hours Section - Times Table */}
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
            case "block":
              return (
                <div className="p-3" key="block">
                  <div className="grid grid-cols-3 gap-x-4 items-center">
                    <div className="flex justify-start">
                      <span className="text-sm font-semibold text-center">
                        Block
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.block_start)}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.block_end)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            case "flight":
              return (
                <div className="p-3" key="flight">
                  <div className="grid grid-cols-3 gap-x-4 items-center">
                    <div className="flex justify-start">
                      <span className="text-sm font-semibold text-center">
                        Flight
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.flight_start)}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.flight_end)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            case "scheduled":
              return (
                <div className="p-3" key="scheduled">
                  <div className="grid grid-cols-3 gap-x-4 items-center">
                    <div className="flex justify-start">
                      <span className="text-sm font-semibold text-center">
                        Scheduled
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.scheduled_start)}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.scheduled_end)}
                      </span>
                    </div>
                  </div>
                </div>
              );
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
                        {formatTime(flight.duty_start)}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {formatTime(flight.duty_end)}
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
                        {flight.hobbs_start || "-"}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {flight.hobbs_end || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            case "tach":
              return (
                <div className="p-3" key="tach">
                  <div className="grid grid-cols-3 gap-x-4 items-center">
                    <div className="flex justify-start">
                      <span className="text-sm font-semibold text-center">
                        Tach
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {flight.tach_start || "-"}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="text-sm font-medium text-center">
                        {flight.tach_end || "-"}
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

      {/* Time Totals Section */}
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
        Time Information
      </h3>
      <div>
        {timeRows.map((row) => {
          switch (row) {
            case "duty":
              return (
                <div className="p-3" key="duty">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Duty Time</span>
                    <span className="text-sm">
                      {formatTime(flight.duty_time_minutes, "HH:mm", { suffix: true, showZero: true })}
                    </span>
                  </div>
                </div>
              );
            case "night":
              return (
                <div className="p-3" key="night">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Night Time</span>
                    <span className="text-sm">
                      {formatTime(flight.night_time_minutes, "HH:mm", { suffix: true, showZero: true })}
                    </span>
                  </div>
                </div>
              );
            case "ifr":
              return (
                <div className="p-3" key="ifr">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">IFR Time</span>
                    <span className="text-sm">
                      {formatTime(flight.ifr_time_minutes, "HH:mm", { suffix: true, showZero: true })}
                    </span>
                  </div>
                </div>
              );
            case "xc":
              return (
                <div className="p-3" key="xc">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">XC Time</span>
                    <span className="text-sm">
                      {formatTime(flight.xc_time_minutes, "HH:mm", { suffix: true, showZero: true })}
                    </span>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>

      <Separator className="w-full my-4" />

      {/* Crew & Pilot flying */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Crew Information
        </h3>
        {/* Check if PIC is self <-> fetch PIC based on ID */}
        {!flight.is_pic && crew ? (
          <div className="p-3 pr-1 flex items-center justify-between">
            <span className="text-sm font-semibold">Pilot In Command</span>
            <span className="text-sm">
              <Link
                href={`/app/crew/${crew.id}`}
                className="inline-flex items-center gap-2 font-medium text-sm hover:bg-muted rounded py-1 px-2"
              >
                <span>{crew.fullName}</span>

                {crew.companyId && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {crew.companyId}
                  </span>
                )}
              </Link>

            </span>
          </div>
        ) : (
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Pilot In Command</span>
            <span className="text-sm">
              SELF
            </span>
          </div>
        )}


        {/* Pilot Flying */}
        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Pilot Flying</span>
          <span className="text-sm">
            {flight.pilot_flying ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </span>
        </div>
      </div>

      <Separator className="w-full my-4" />

      {/* Miscellaneous Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Miscellaneous Information
        </h3>

        {hasAnyContent ? (
          visibleItems.map(item => (
            <div
              key={item.key}
              className="p-3 flex items-center justify-between"
            >
              <span className="text-sm font-semibold">
                {item.label}
              </span>
              <span className="text-sm">
                {item.hasValue ? item.value : "-"}
              </span>
            </div>
          ))
        ) : (
          <div className="p-3 text-sm text-muted-foreground text-center">
            No miscellaneous information available
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
          <span className="text-sm">{flight.remarks || "-"}</span>
        </div>

        {showTraining && (
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Training</span>
            <span className="text-sm">{flight.training_description || "-"}</span>
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
            {formatDate(flight.created_at, "long")}
          </span>
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Last Updated</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(flight.updated_at, "long")}
          </span>
        </div>
      </div>
    </div>
  )
}