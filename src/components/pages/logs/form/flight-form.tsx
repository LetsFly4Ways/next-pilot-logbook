"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import { updateFlight } from "@/actions/pages/logs/flight/update";
import { createFlight } from "@/actions/pages/logs/flight/create";
import { deleteFlight } from "@/actions/pages/logs/flight/delete";
import { FlightRecord } from "@/actions/pages/logs/fetch";

import {
  FlightPayloadSchema,
  FlightFormValues,
  FlightPayload,
  FlightFormSchema,
  SelectedAirport,
  PilotFunction,
  OTHER_PIC_FUNCTIONS,
  SELF_PIC_FUNCTIONS,
} from "@/types/logs";
import { Fleet } from "@/types/fleet";
import { UserPreferences } from "@/types/user-preferences";

import { formatCrewName } from "@/lib/format-crew";
import { calculateDurationMinutes } from "@/lib/time-utils";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  clearDraftCookie,
  getDraftFromCookie,
  saveDraftToCookie,
} from "@/components/pages/logs/form/flight-cookie-helper";
import {
  readFlightFormSelection,
  clearFlightFormSelection,
  CrewSelectionPayload
} from "@/components/pages/logs/select/flight-form-selection";
import { writeSelectContext } from "@/components/pages/logs/select/select-context";

import LogForm from "@/components/pages/logs/form/form";

import {
  DateField,
  DurationInputField,
  ObjectDialogSelectField,
  SwitchField,
  TextareaField,
  TextField,
  TimeInputField,
} from "@/components/ui/form-field-types";
import { PositionedGroup } from "@/components/ui/positioned-group";
import TimeTable, {
  TimeTableField,
} from "@/components/pages/logs/form/time-table";
import { NightTimeDurationInputField } from "@/components/pages/logs/form/night-time-input";
import { ManoeuvresField } from "@/components/pages/logs/form/manoeuvre-field";
import { ManoeuvreInput } from "@/components/pages/logs/form/manoeuvre-input";
import { FunctionSelectField } from "@/components/pages/logs/form/select-pilot-function";

const emptyValues: FlightFormValues = {
  date: new Date(),
  aircraft_id: "",
  aircraft: null,
  pic_id: null,
  pic: null,
  departure_airport_code: "",
  departure_airport: null,
  departure_runway: null,
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

  function: undefined,
  pilot_flying: true,

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
  fuel: null,
  passengers: null,
  flight_number: null,
  remarks: null,
  training_description: null,
};

interface FlightFormProps {
  flight?: FlightRecord;
  isEdit?: boolean;
  isLoading?: boolean;
  preferences: UserPreferences;
}

export default function FlightForm({
  flight,
  isEdit = false,
  isLoading,
  preferences,
}: FlightFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  const hasInitializedForm = useRef(false);

  const form = useForm<FlightFormValues>({
    resolver: zodResolver(FlightFormSchema),
    defaultValues: emptyValues,
  });

  // ------- Selection reader ------- //
  /**
   * Single reader: handle any selection returned from select pages
   */
  useEffect(() => {
    const selection = readFlightFormSelection();
    if (!selection) return;

    switch (selection.type) {
      case "aircraft":
        form.setValue("aircraft", selection.payload);
        break;
      case "crew":
        /**
         * When PIC changes, check if the current function is cross-boundary.
         * If so, confirm with the user — clear and error if they decline.
         */
        const newPicIsSelf = selection.payload.id === null;
        const currentFunction = form.getValues("function") as PilotFunction | undefined;

        if (currentFunction) {
          const isCrossBoundary =
            (newPicIsSelf && OTHER_PIC_FUNCTIONS.includes(currentFunction!)) ||
            (!newPicIsSelf && SELF_PIC_FUNCTIONS.includes(currentFunction!));

          if (isCrossBoundary) {
            const confirmed = window.confirm(
              newPicIsSelf
                ? `You changed PIC to Self but function is "${currentFunction}". Keep this function anyway?`
                : `You changed PIC but function is "${currentFunction}". Keep this function anyway?`,
            );

            if (!confirmed) {
              form.setValue("function", undefined as unknown as PilotFunction);
              form.setError("function", {
                type: "manual",
                message: `"${currentFunction}" is not typical for the selected PIC. Please re-select.`,
              });
            }
          }
        }

        form.setValue("pic_id", selection.payload.id);
        form.setValue("pic", selection.payload);
        break;
      case "departure_airport":
        form.setValue("departure_airport", selection.payload.airport);
        form.setValue("departure_airport_code", selection.payload.airport.icao);
        form.setValue("departure_runway", selection.payload.runway);
        break;
      case "destination_airport":
        form.setValue("destination_airport", selection.payload.airport);
        form.setValue(
          "destination_airport_code",
          selection.payload.airport.icao,
        );
        form.setValue("destination_runway", selection.payload.runway);
        break;
      case "approaches":
        form.setValue("approaches", selection.payload);
        break;
    }
    clearFlightFormSelection();
  }, [form]);

  /**
   * Poll briefly after mount so we pick up selection when navigating back
   */
  useEffect(() => {
    const t = setInterval(() => {
      const selection = readFlightFormSelection();
      if (selection) {
        clearFlightFormSelection();
        switch (selection.type) {
          case "aircraft":
            form.setValue("aircraft", selection.payload);
            break;
          case "crew":
            /**
             * When PIC changes, check if the current function is cross-boundary.
             * If so, confirm with the user — clear and error if they decline.
             */
            const newPicIsSelf = selection.payload.id === null;
            const currentFunction = form.getValues("function") as PilotFunction | undefined;

            if (currentFunction) {
              const isCrossBoundary =
                (newPicIsSelf && OTHER_PIC_FUNCTIONS.includes(currentFunction!)) ||
                (!newPicIsSelf && SELF_PIC_FUNCTIONS.includes(currentFunction!));

              if (isCrossBoundary) {
                const confirmed = window.confirm(
                  newPicIsSelf
                    ? `You changed PIC to Self but function is "${currentFunction}". Keep this function anyway?`
                    : `You changed PIC but function is "${currentFunction}". Keep this function anyway?`,
                );

                if (!confirmed) {
                  form.setValue("function", undefined as unknown as PilotFunction);
                  form.setError("function", {
                    type: "manual",
                    message: `"${currentFunction}" is not typical for the selected PIC. Please re-select.`,
                  });
                }
              }
            }

            form.setValue("pic_id", selection.payload.id);
            form.setValue("pic", selection.payload);
            break;
          case "departure_airport":
            form.setValue("departure_airport", selection.payload.airport);
            form.setValue(
              "departure_airport_code",
              selection.payload.airport.icao,
            );
            form.setValue("departure_runway", selection.payload.runway);
            break;
          case "destination_airport":
            form.setValue("destination_airport", selection.payload.airport);
            form.setValue(
              "destination_airport_code",
              selection.payload.airport.icao,
            );
            form.setValue("destination_runway", selection.payload.runway);
            break;
          case "approaches":
            form.setValue("approaches", selection.payload);
            break;
        }
      }
    }, 100);
    const timeout = setTimeout(() => clearInterval(t), 2000);
    return () => {
      clearInterval(t);
      clearTimeout(timeout);
    };
  }, [form]);

  // ------- Initialize form (edit mode) ------- //
  // All display data is pre-resolved in FlightRecord — no client fetches needed.
  useEffect(() => {
    if (!flight || isLoading || hasInitializedForm.current) return;
    hasInitializedForm.current = true;

    form.reset({
      date: flight.date,

      aircraft_id: flight.aircraft_id,
      aircraft: flight._aircraft,

      pic_id: flight.pic_id,
      pic: flight._pic,

      departure_airport_code: flight.departure_airport_code,
      departure_airport: flight._departure_airport,
      departure_runway: flight.departure_runway,
      destination_airport_code: flight.destination_airport_code,
      destination_airport: flight._destination_airport,
      destination_runway: flight.destination_runway,

      block_start: flight.block_start,
      block_end: flight.block_end,
      flight_start: flight.flight_start,
      flight_end: flight.flight_end,
      scheduled_start: flight.scheduled_start,
      scheduled_end: flight.scheduled_end,

      total_block_minutes: flight.total_block_minutes,
      total_air_minutes: flight.total_air_minutes,
      night_time_minutes: flight.night_time_minutes,
      ifr_time_minutes: flight.ifr_time_minutes,
      xc_time_minutes: flight.xc_time_minutes,

      day_takeoffs: flight.day_takeoffs,
      night_takeoffs: flight.night_takeoffs,
      day_landings: flight.day_landings,
      night_landings: flight.night_landings,
      go_arounds: flight.go_arounds,
      approaches: flight.approaches,

      function: flight.function,
      pilot_flying: flight.pilot_flying,

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
    });
  }, [flight, isLoading, form]);

  // ------- Initialize form (new flights) ------- //
  useEffect(() => {
    if (flight || hasInitializedForm.current) return;
    hasInitializedForm.current = true;

    // Set the default function based on user preferences
    if (preferences.logging.defaultFunction) {
      form.setValue(
        "function",
        preferences.logging.defaultFunction as PilotFunction
      );
    }
  }, [flight, form, preferences.logging.defaultFunction]);

  // ------- Time Watchers ------- //
  const blockStart = useWatch({ control: form.control, name: "block_start" });
  const blockEnd = useWatch({ control: form.control, name: "block_end" });
  const flightStart = useWatch({ control: form.control, name: "flight_start" });
  const flightEnd = useWatch({ control: form.control, name: "flight_end" });
  const dutyStart = useWatch({ control: form.control, name: "duty_start" });
  const dutyEnd = useWatch({ control: form.control, name: "duty_end" });

  // Update total_block_minutes when block times change
  useEffect(() => {
    const minutes = calculateDurationMinutes(
      blockStart ?? null,
      blockEnd ?? null,
    );
    const currentValue = form.getValues("total_block_minutes");
    if (minutes !== currentValue) {
      form.setValue("total_block_minutes", minutes, { shouldValidate: false });
    }
  }, [blockStart, blockEnd, form]);

  // Update total_air_minutes when flight times change
  useEffect(() => {
    const minutes = calculateDurationMinutes(
      flightStart ?? null,
      flightEnd ?? null,
    );
    const currentValue = form.getValues("total_air_minutes");
    if (minutes !== currentValue) {
      form.setValue("total_air_minutes", minutes, { shouldValidate: false });
    }
  }, [flightStart, flightEnd, form]);

  // Update duty_time_minutes when duty times change
  useEffect(() => {
    const minutes = calculateDurationMinutes(
      dutyStart ?? null,
      dutyEnd ?? null,
    );
    const currentValue = form.getValues("duty_time_minutes");
    if (minutes !== currentValue) {
      form.setValue("duty_time_minutes", minutes, { shouldValidate: false });
    }
  }, [dutyStart, dutyEnd, form]);

  // ------- Pilot Function ------- //
  /**
   * Determine if PIC is self for function options
   */
  const pic = useWatch({ control: form.control, name: "pic" });
  const picIsSelf = pic?.first_name === "Self" && pic?.company_id === "SELF";

  // ------- Submit ------- //
  const handleSubmit = async (values: FlightFormValues) => {
    const data: FlightPayload = FlightPayloadSchema.parse({
      ...values,
      aircraft_id: values.aircraft?.id ?? "",

      // Remove the convenience fields that aren't in the database schema
    });

    if (isEdit && flight) {
      await updateFlight(flight.id, data);
    } else {
      await createFlight(data);
    }
  };

  // Time Table
  const tableFields: TimeTableField<FlightFormValues>[] = [
    // Block & Flight Fields
    {
      label: "Block",
      offKey: "block_start",
      onKey: "block_end",
      required: true,
      visible: true,
      inputType: "time" as const,
    },
    {
      label: "Flight",
      offKey: "flight_start",
      onKey: "flight_end",
      required: true,
      visible: true,
      inputType: "time" as const,
    },

    // Optional Fields
    {
      label: "Duty",
      offKey: "duty_start",
      onKey: "duty_end",
      required: false,
      visible: preferences.logging.fields.duty,
      inputType: "time" as const,
    },
    {
      label: "Scheduled",
      offKey: "scheduled_start",
      onKey: "scheduled_end",
      required: false,
      visible: preferences.logging.fields.scheduled,
      inputType: "time" as const,
    },

    // Hobbs & Tach
    {
      label: "Hobbs",
      offKey: "hobbs_start",
      onKey: "hobbs_end",
      required: false,
      visible: preferences.logging.fields.hobbs,
      inputType: "number" as const,
    },
    {
      label: "Tach",
      offKey: "tach_start",
      onKey: "tach_end",
      required: false,
      visible: preferences.logging.fields.tach,
      inputType: "number" as const,
    },
  ];

  const handleDelete = async () => {
    if (flight?.id) {
      await deleteFlight(flight.id);
    }
  };

  const shouldSaveDraft = (values: FlightFormValues) => {
    const data: FlightPayload = FlightPayloadSchema.parse(values);

    return !!(
      data.departure_airport_code ||
      data.destination_airport_code ||
      data.aircraft_id
    );
  };

  return (
    <LogForm
      id={flight?.id}
      form={form}
      isEdit={isEdit}
      isLoading={isLoading}
      title="Flight"
      draftName="flight"
      onSubmit={handleSubmit}
      onDelete={isEdit ? handleDelete : undefined}
      onDraftRestore={getDraftFromCookie}
      onDraftSave={saveDraftToCookie}
      onDraftClear={clearDraftCookie}
      shouldSaveDraft={shouldSaveDraft}
    >
      <div className="space-y-8">
        {/* Basic Information (date, aircraft & flight number)*/}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Basic Information
          </h3>

          <PositionedGroup>
            <DateField<FlightFormValues>
              name="date"
              label="Date"
              isLoading={isLoading}
              required
            />

            <ObjectDialogSelectField<FlightFormValues, Fleet>
              name="aircraft"
              label="Aircraft"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  type: "flight",
                  current: form.getValues("aircraft")?.id ?? null,
                  return: pathname ?? "/app/logs/flight/new",
                }, "flight");
                router.push("/app/logs/flight/fleet-select");
              }}
              required
              displayValue={(aircraft) =>
                aircraft
                  ? `${aircraft.registration}${aircraft.model || aircraft.type ? ` | ${aircraft.model || aircraft.type}` : ""}`
                  : null
              }
            />

            <TextField<FlightFormValues>
              name="flight_number"
              label="Flight Number"
              placeholder="BEL123"
              isLoading={isLoading}
            />
          </PositionedGroup>
        </div>

        {/* Routing */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Routing Information
          </h3>

          <PositionedGroup>
            <ObjectDialogSelectField<
              FlightFormValues,
              SelectedAirport & { runway?: string | null }
            >
              name="departure_airport"
              label="Departure"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  type: "flight",
                  current: form.getValues("departure_airport")?.icao ?? null,
                  return: pathname ?? "/app/logs/flight/new",
                  runway: form.getValues("departure_runway") ?? null,
                }, "flight");
                router.push("/app/logs/flight/airport-select/departure");
              }}
              required
              displayValue={(ap) => {
                if (!ap) return null;
                const runway = form.getValues("departure_runway");
                return runway ? `${ap.icao} | ${runway}` : ap.icao;
              }}
            />
            <ObjectDialogSelectField<
              FlightFormValues,
              SelectedAirport & { runway?: string | null }
            >
              name="destination_airport"
              label="Destination"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  type: "flight",
                  current: form.getValues("destination_airport")?.icao ?? null,
                  return: pathname ?? "/app/logs/flight/new",
                  runway: form.getValues("destination_runway") ?? null,
                }, "flight");
                router.push("/app/logs/flight/airport-select/destination");
              }}
              required
              displayValue={(ap) => {
                if (!ap) return null;
                const runway = form.getValues("destination_runway");
                return runway ? `${ap.icao} | ${runway}` : ap.icao;
              }}
            />
          </PositionedGroup>
        </div>

        {/* Crew & Function */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Crew Information
          </h3>

          {/* PIC */}
          <PositionedGroup>
            <ObjectDialogSelectField<
              FlightFormValues,
              CrewSelectionPayload
            >
              name="pic"
              label="PIC"
              isLoading={isLoading}
              required
              onOpenDialog={() => {
                const picId = form.getValues("pic_id");
                writeSelectContext({
                  type: "flight",
                  current: picId === null ? "__SELF__" : picId,
                  return: pathname ?? "/app/logs/flight/new",
                }, "flight");
                router.push("/app/logs/flight/crew-select");
              }}
              displayValue={(pic) => {
                if (!pic) return null;
                if (pic.pic_is_self || pic.first_name === "Self") {
                  return "SELF";
                }
                const name = formatCrewName(pic.first_name, pic.last_name, preferences.nameDisplay);
                const code = pic.company_id || "";
                return code ? `${name} | ${code}` : name;
              }}
            />

            {/* Function */}
            <FunctionSelectField<FlightFormValues>
              name="function"
              picIsSelf={picIsSelf}
              isLoading={isLoading}
              required
            />

            {/* Pilot flying */}
            <SwitchField<FlightFormValues>
              name="pilot_flying"
              label="Pilot Flying"
              isLoading={isLoading}
            />
          </PositionedGroup>
        </div>

        {/* Time Table */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Time Information
          </h3>

          <TimeTable<FlightFormValues> fields={tableFields} />
        </div>

        {/* Time Fields */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Total Time Information
          </h3>

          <div className="space-y-3">
            <PositionedGroup>
              <TimeInputField<FlightFormValues>
                name="total_block_minutes"
                label="Total Time"
                isLoading={isLoading}
                required
              />

              <TimeInputField<FlightFormValues>
                name="total_air_minutes"
                label="Air Time"
                isLoading={isLoading}
                required
              />

              {preferences.logging.fields.duty && (
                <TimeInputField<FlightFormValues>
                  name="duty_time_minutes"
                  label="Duty Time"
                  isLoading={isLoading}
                />
              )}
            </PositionedGroup>

            <PositionedGroup>
              <DurationInputField<FlightFormValues>
                name="ifr_time_minutes"
                label="IFR Time"
                referenceMinutesField="total_block_minutes"
                isLoading={isLoading}
              />

              <NightTimeDurationInputField<FlightFormValues>
                name="night_time_minutes"
                label="Night Time"
                isLoading={isLoading}
                dateField="date"
                flightStartField="block_start"
                flightEndField="block_end"
                departureAirportField="departure_airport"
                destinationAirportField="destination_airport"
              />

              {preferences.logging.fields.xc && (
                <DurationInputField<FlightFormValues>
                  name="xc_time_minutes"
                  label="XC Time"
                  referenceMinutesField="total_block_minutes"
                  isLoading={isLoading}
                />
              )}
            </PositionedGroup>
          </div>
        </div>

        {/* Manoeuvres */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Operations Information
          </h3>

          <div className="space-y-3">
            <ManoeuvresField<FlightFormValues>
              dayTakeoffsField="day_takeoffs"
              nightTakeoffsField="night_takeoffs"
              dayLandingsField="day_landings"
              nightLandingsField="night_landings"
              isLoading={isLoading}
              dateField="date"
              flightStartField="flight_start"
              flightEndField="flight_end"
              departureAirportField="departure_airport"
              destinationAirportField="destination_airport"
            />

            <PositionedGroup>
              {preferences.logging.fields.approaches && (
                <ObjectDialogSelectField<FlightFormValues, string[]>
                  name="approaches"
                  label="Approaches"
                  isLoading={isLoading}
                  onOpenDialog={() => {
                    const approaches = form.getValues("approaches") ?? [];
                    writeSelectContext({
                      selected:
                        approaches.length > 0
                          ? approaches.join("|")
                          : undefined,
                      return: pathname ?? "/app/logs/flight/new",
                    }, "flight");
                    router.push("/app/logs/flight/approach-select");
                  }}
                  displayValue={(arr) => (arr?.length ? arr.join(", ") : null)}
                />
              )}

              {/* Go-arounds */}
              {preferences.logging.fields.go_arounds && (
                <ManoeuvreInput<FlightFormValues>
                  label="Go Around"
                  name="go_arounds"
                  isLoading={isLoading}
                />
              )}
            </PositionedGroup>
          </div>
        </div>

        {(preferences.logging.fields.passengers ||
          preferences.logging.fields.fuel) && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Miscellaneous Information
              </h3>

              <PositionedGroup>
                {preferences.logging.fields.passengers && (
                  <TextField<FlightFormValues>
                    name="passengers"
                    label="Passengers"
                    type="number"
                    isLoading={isLoading}
                  />
                )}

                {preferences.logging.fields.fuel && (
                  <TextField<FlightFormValues>
                    name="fuel"
                    label="Fuel"
                    placeholder="KG"
                    type="number"
                    isLoading={isLoading}
                  />
                )}
              </PositionedGroup>
            </div>
          )}

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Notes
          </h3>

          <PositionedGroup>
            <TextareaField<FlightFormValues>
              name="remarks"
              label="Remarks"
              rows={1}
              isLoading={isLoading}
            />

            {preferences.logging.fields.training && (
              <TextareaField<FlightFormValues>
                name="training_description"
                label="Training"
                rows={1}
                isLoading={isLoading}
              />
            )}

            {/* Endorsment future release */}
          </PositionedGroup>
        </div>
      </div>
    </LogForm>
  );
}
