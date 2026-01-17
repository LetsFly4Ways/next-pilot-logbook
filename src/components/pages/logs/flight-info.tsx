import { getPreferences } from "@/actions/user-preferences";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime } from "@/lib/date-utils";
import { Flight } from "@/types/logs";
import Link from "next/link";

// ----------------- TEMPORARY -----------------

// function formatTimeString(time: string | null | undefined): string {
//   if (!time) return "--:--";
//   return time.slice(0, 5);
// }

// function formatMovement(day: number, night: number): string {
//   if (day === 0 && night === 0) return "0";
//   if (night === 0) return `${day}`;
//   if (day === 0) return `${night}N`;
//   return `${day}+${night}N`;
// }

// function getSelectedFunction(flight: Flight): string {
//   if (flight.is_pic) return "PIC";
//   if (flight.is_spic) return "SPIC";
//   if (flight.is_picus) return "PICUS";
//   if (flight.dual_time_minutes > 0) return "Dual";
//   if (flight.instructor_time_minutes > 0) return "Instructor";
//   return "Other";
// }

// -------------------------------------------

interface FlightLogInfoProps {
  flight: Flight & { _type: "flight" };
}

export default async function FlightLogInfo({ flight }: FlightLogInfoProps) {
  // const prefsResult = await getPreferences();
  // const preferences = prefsResult.preferences;

  // const showHobbs = preferences?.logging?.fields?.hobbs ?? true;
  // const showTach = preferences?.logging?.fields?.tach ?? true;
  // const showScheduled = preferences?.logging?.fields?.scheduled ?? true;
  // const showDuty = preferences?.logging?.fields?.duty ?? true;
  // const showXC = preferences?.logging?.fields?.xc ?? true;

  // const timeRows = [
  //   "block",
  //   "flight",
  //   showScheduled ? "scheduled" : null,
  //   showDuty ? "duty" : null,
  //   showHobbs ? "hobbs" : null,
  //   showTach ? "tach" : null,
  //   "night",
  //   "ifr",
  //   showXC ? "xc" : null,
  // ].filter(Boolean);

  // const date = new Date(flight.date);

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
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Route */}
          <div className="inline-flex items-center gap-3">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl md:text-2xl font-bold md:font-semibold">
                {flight.departure_airport_code}
              </div>

              {flight.departure_runway && (
                <div className="text-xs text-muted-foreground mt-0.5">
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
                <div className="text-xs text-muted-foreground mt-0.5">
                  RWY {flight.destination_runway}
                </div>
              )}
            </div>
          </div>

          {/* Aircraft */}
          <Link
            href={`/app/fleet/${flight.aircraft_id}`}
            className="inline-flex items-center text-muted-foreground text-sm hover:bg-muted rounded px-3 py-1 md:px-2"
          >
            OO-SKX | DA40
          </Link>
        </div>

        {/* RIGHT — Block time */}
        <div
          className="absolute right-0 top-0 md:static flex justify-end md:items-end"
        >
          <div className="text-right">
            <div className="text-xl md:text-lg font-bold md:font-medium">
              {formatTime(flight.total_block_minutes, "HH:mm", true)}h
            </div>
            <div className="md:hidden text-xs text-muted-foreground">
              Block
            </div>
          </div>
        </div>
      </div>

      <Separator className="w-full my-4" />
    </div>
  )
}