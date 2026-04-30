"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { FlightRecord, SimulatorSessionRecord } from "@/actions/pages/logs/fetch";

import { FlightFormValues, SimulatorSessionFormValues } from "@/types/logs";

import {
  saveFlightFormPrefill,
  saveSimulatorFormPrefill,
} from "@/components/pages/logs/form/prefill-storage";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";

interface FlightLogActionsProps {
  flight: FlightRecord & { _type: "flight" };
}

interface SimulatorLogActionsProps {
  session: SimulatorSessionRecord & { _type: "simulator" };
}

function buildFlightDuplicatePrefill(flight: FlightRecord): FlightFormValues {
  return {
    date: flight.date,
    aircraft_id: flight.aircraft_id,
    aircraft: flight._aircraft,
    pic_id: flight.pic_id,
    pic: flight._pic,
    pic_is_self: flight.pic_is_self,
    departure_airport_code: flight.departure_airport_code,
    departure_airport: flight._departure_airport,
    departure_runway: flight.departure_runway,
    destination_airport_code: flight.destination_airport_code,
    destination_airport: flight._destination_airport,
    destination_runway: flight.destination_runway,
    block_start: flight.block_start ?? "",
    block_end: flight.block_end ?? "",
    flight_start: flight.flight_start ?? "",
    flight_end: flight.flight_end ?? "",
    scheduled_start: flight.scheduled_start,
    scheduled_end: flight.scheduled_end,
    total_block_minutes: flight.total_block_minutes,
    total_air_minutes: flight.total_air_minutes,
    night_time_minutes: flight.night_time_minutes,
    ifr_time_minutes: flight.ifr_time_minutes,
    xc_time_minutes: flight.xc_time_minutes,
    function: flight.function ?? "PIC",
    pilot_flying: flight.pilot_flying,
    day_takeoffs: flight.day_takeoffs,
    night_takeoffs: flight.night_takeoffs,
    day_landings: flight.day_landings,
    night_landings: flight.night_landings,
    go_arounds: flight.go_arounds ?? 0,
    approaches: flight.approaches ?? [],
    duty_start: flight.duty_start,
    duty_end: flight.duty_end,
    duty_time_minutes: flight.duty_time_minutes,
    hobbs_start: flight.hobbs_start,
    hobbs_end: flight.hobbs_end,
    tach_start: flight.tach_start,
    tach_end: flight.tach_end,
    fuel: flight.fuel,
    passengers: flight.passengers,
    flight_number: flight.flight_number,
    remarks: flight.remarks,
    training_description: flight.training_description,
  };
}

function buildFlightReturnPrefill(flight: FlightRecord): FlightFormValues {
  return {
    ...buildFlightDuplicatePrefill(flight),
    departure_airport_code: flight.destination_airport_code,
    departure_airport: flight._destination_airport,
    departure_runway: flight.destination_runway,
    destination_airport_code: flight.departure_airport_code,
    destination_airport: flight._departure_airport,
    destination_runway: flight.departure_runway,
    block_start: "",
    block_end: "",
    flight_start: "",
    flight_end: "",
    scheduled_start: null,
    scheduled_end: null,
    total_block_minutes: 0,
    total_air_minutes: 0,
    night_time_minutes: 0,
    ifr_time_minutes: 0,
    xc_time_minutes: 0,
    day_takeoffs: 0,
    night_takeoffs: 0,
    day_landings: 0,
    night_landings: 0,
    go_arounds: 0,
    approaches: [],
    duty_start: null,
    duty_end: null,
    duty_time_minutes: 0,
    hobbs_start: null,
    hobbs_end: null,
    tach_start: null,
    tach_end: null,
    flight_number: null,
  };
}

function buildFlightNextLegPrefill(flight: FlightRecord): FlightFormValues {
  return {
    ...buildFlightDuplicatePrefill(flight),
    departure_airport_code: flight.destination_airport_code,
    departure_airport: flight._destination_airport,
    departure_runway: flight.destination_runway,
    destination_airport_code: "",
    destination_airport: null,
    destination_runway: null,
    block_start: "",
    block_end: "",
    flight_start: "",
    flight_end: "",
    scheduled_start: null,
    scheduled_end: null,
    total_block_minutes: 0,
    total_air_minutes: 0,
    night_time_minutes: 0,
    ifr_time_minutes: 0,
    xc_time_minutes: 0,
    day_takeoffs: 0,
    night_takeoffs: 0,
    day_landings: 0,
    night_landings: 0,
    go_arounds: 0,
    approaches: [],
    duty_start: null,
    duty_end: null,
    duty_time_minutes: 0,
    hobbs_start: null,
    hobbs_end: null,
    tach_start: null,
    tach_end: null,
    flight_number: null,
  };
}

function buildSimulatorDuplicatePrefill(
  session: SimulatorSessionRecord,
): SimulatorSessionFormValues {
  return {
    date: session.date,
    aircraft_id: session.aircraft_id,
    simulator: session._simulator,
    instructor_id: session.instructor_id,
    instructor_is_self: session.instructor_is_self,
    instructor: session._instructor,
    session_minutes: session.session_minutes,
    duty_start: session.duty_start,
    duty_end: session.duty_end,
    duty_time_minutes: session.duty_time_minutes,
    hobbs_start: session.hobbs_start,
    hobbs_end: session.hobbs_end,
    remarks: session.remarks,
    training_description: session.training_description,
  };
}

export function FlightLogInfoActions({ flight }: FlightLogActionsProps) {
  const router = useRouter();

  const handleDuplicate = useCallback(() => {
    const payload = buildFlightDuplicatePrefill(flight);
    saveFlightFormPrefill(payload);
    router.push("/app/logs/flight/new?prefill=1");
  }, [flight, router]);

  const handleCreateReturnFlight = useCallback(() => {
    const payload = buildFlightReturnPrefill(flight);
    saveFlightFormPrefill(payload);
    router.push("/app/logs/flight/new?prefill=1");
  }, [flight, router]);

  const handleCreateNextLeg = useCallback(() => {
    const payload = buildFlightNextLegPrefill(flight);
    saveFlightFormPrefill(payload);
    router.push("/app/logs/flight/new?prefill=1");
  }, [flight, router]);

  return (
    <PositionedGroup>
      <PositionedItem
        className="p-3 text-center text-sm font-medium text-blue-500 cursor-pointer"
        onClick={handleDuplicate}
      >
        Duplicate
      </PositionedItem>
      <PositionedItem
        className="p-3 text-center text-sm font-medium text-blue-500 cursor-pointer"
        onClick={handleCreateNextLeg}
      >
        Next Leg
      </PositionedItem>
      <PositionedItem
        className="p-3 text-center text-sm font-medium text-blue-500 cursor-pointer"
        onClick={handleCreateReturnFlight}
      >
        Create Return Flight
      </PositionedItem>
    </PositionedGroup>
  );
}

export function SimulatorLogInfoActions({
  session,
}: SimulatorLogActionsProps) {
  const router = useRouter();

  const handleDuplicate = useCallback(() => {
    const payload = buildSimulatorDuplicatePrefill(session);
    saveSimulatorFormPrefill(payload);
    router.push("/app/logs/simulator/new?prefill=1");
  }, [session, router]);

  return (
    <PositionedGroup>
      <PositionedItem
        className="p-3 text-center text-sm font-medium text-blue-500 cursor-pointer"
        onClick={handleDuplicate}
      >
        Duplicate
      </PositionedItem>
    </PositionedGroup>
  );
}
