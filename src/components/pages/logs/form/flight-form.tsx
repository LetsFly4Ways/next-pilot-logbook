"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import { updateFlight } from "@/actions/pages/logs/flight/update";
import { createFlight } from "@/actions/pages/logs/flight/create";
import { deleteFlight } from "@/actions/pages/logs/flight/delete";
import { fetchAsset } from "@/actions/pages/fleet/fetch";
import { fetchCrewMember } from "@/actions/pages/crew/fetch";
import { getAirportByIcao } from "@/actions/pages/airports/fetch";

import {
  Flight,
  FlightFormSchema,
  FlightFormInput,
  FlightForm as FlightFormType,
  SelectedAircraft,
  FlightFormInputSchema,
  SelectedAirport,
  functionOptions,
} from "@/types/logs";
import { UserPreferences } from "@/types/user-preferences";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { calculateDurationMinutes } from "@/lib/time-utils";
import {
  clearDraftCookie,
  getDraftFromCookie,
  saveDraftToCookie,
} from "@/components/pages/logs/form/flight-cookie-helper";
import {
  readFlightFormSelection,
  clearFlightFormSelection,
  fleetToSelectedAircraft,
} from "@/components/pages/logs/select/flight-form-selection";
import { writeSelectContext } from "@/components/pages/logs/select/select-context";

import LogForm from "@/components/pages/logs/form/form";

import {
  DateField,
  DurationInputField,
  ObjectDialogSelectField,
  SelectField,
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

const emptyValues: FlightFormInput = {
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
  pic_time_minutes: 0,
  dual_time_minutes: 0,
  copilot_time_minutes: 0,
  instructor_time_minutes: 0,
  day_takeoffs: 0,
  night_takeoffs: 0,
  day_landings: 0,
  night_landings: 0,
  go_arounds: 0,
  approaches: [],
  is_pic: false,
  is_solo: false,
  is_spic: false,
  is_picus: false,
  pilot_flying: false,
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
  flight?: Flight;
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
  const hasFetchedAircraft = useRef(false);

  const form = useForm<FlightFormInput>({
    resolver: zodResolver(FlightFormInputSchema),
    defaultValues: emptyValues,
  });

  // Single reader: handle any selection returned from select pages
  useEffect(() => {
    const selection = readFlightFormSelection();
    if (!selection) return;

    switch (selection.type) {
      case "aircraft":
        form.setValue("aircraft", selection.payload);
        break;
      case "crew":
        form.setValue("pic_id", selection.payload.id);
        form.setValue("pic", {
          id: selection.payload.id,
          first_name: selection.payload.first_name,
          last_name: selection.payload.last_name,
          code: selection.payload.code,
        });
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

  // Poll briefly after mount so we pick up selection when navigating back
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
            form.setValue("pic_id", selection.payload.id);
            form.setValue("pic", {
              id: selection.payload.id,
              first_name: selection.payload.first_name,
              last_name: selection.payload.last_name,
              code: selection.payload.code,
            });
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

  // Fetch aircraft when editing
  useEffect(() => {
    if (!flight?.aircraft_id || hasFetchedAircraft.current) return;
    hasFetchedAircraft.current = true;

    async function loadAircraft() {
      const { asset } = await fetchAsset(flight!.aircraft_id);
      if (asset) {
        form.setValue("aircraft", fleetToSelectedAircraft(asset));
      }
    }
    loadAircraft();
  }, [flight, flight?.aircraft_id, form]);

  // Initialize form with flight data (only once on mount)
  useEffect(() => {
    if (!flight || isLoading || hasInitializedForm.current) return;
    hasInitializedForm.current = true;

    async function loadAirports() {
      let departureAirport: SelectedAirport | null = null;
      let destinationAirport: SelectedAirport | null = null;

      // Fetch departure airport with full data (including lat/lon for night time calculation)
      if (flight?.departure_airport_code) {
        const result = await getAirportByIcao(flight.departure_airport_code);
        if (result.success) {
          const airport = result.data;
          departureAirport = {
            icao: airport.icao,
            iata: airport.iata ?? null,
            name: airport.name,
            city: airport.city ?? null,
            country: airport.countryName,
            lat: airport.lat,
            lon: airport.lon,
          };
        }
      }

      // Fetch destination airport with full data
      if (flight?.destination_airport_code) {
        const result = await getAirportByIcao(flight.destination_airport_code);
        if (result.success) {
          const airport = result.data;
          destinationAirport = {
            icao: airport.icao,
            iata: airport.iata ?? null,
            name: airport.name,
            city: airport.city ?? null,
            country: airport.countryName,
            lat: airport.lat,
            lon: airport.lon,
          };
        }
      }

      form.setValue("departure_airport", departureAirport);
      form.setValue("destination_airport", destinationAirport);
    }

    form.reset({
      date: flight.date,
      aircraft_id: flight.aircraft_id,
      aircraft: null, // Populated by fetch effect
      pic_id: flight.pic_id,
      pic: null,
      departure_airport_code: flight.departure_airport_code,
      departure_airport: null, // Populated by loadAirports effect
      departure_runway: flight.departure_runway,
      destination_airport_code: flight.destination_airport_code,
      destination_airport: null, // Populated by loadAirports effect
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
      pic_time_minutes: flight.pic_time_minutes,
      dual_time_minutes: flight.dual_time_minutes,
      copilot_time_minutes: flight.copilot_time_minutes,
      instructor_time_minutes: flight.instructor_time_minutes,
      day_takeoffs: flight.day_takeoffs,
      night_takeoffs: flight.night_takeoffs,
      day_landings: flight.day_landings,
      night_landings: flight.night_landings,
      go_arounds: flight.go_arounds,
      approaches: flight.approaches,
      is_pic: flight.is_pic,
      is_solo: flight.is_solo,
      is_spic: flight.is_spic,
      is_picus: flight.is_picus,
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

    // Fetch PIC data if pic_id exists
    if (flight.pic_id) {
      fetchCrewMember(flight.pic_id).then((result) => {
        if (result.crew) {
          form.setValue("pic", {
            id: result.crew.id,
            first_name: result.crew.first_name,
            last_name: result.crew.last_name ?? "",
            code: result.crew.company_id ?? "",
          });
        }
      });
    } else if (flight.pic_id === null) {
      // pic_id is null means SELF is the PIC
      form.setValue("pic", {
        id: null,
        first_name: "Self",
        last_name: "",
        code: "SELF",
      });
    }

    // Load airports with full data (including coordinates)
    loadAirports();
  }, [flight, isLoading, form]);

  // For new flights (no flight prop), ensure form is initialized once
  useEffect(() => {
    if (flight || hasInitializedForm.current) return;
    hasInitializedForm.current = true;
  }, [flight, form]);

  // Watch the time fields
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

  // Update total_air_minutes when flight times change
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

  const handleSubmit = async (values: FlightFormInput) => {
    const data: FlightFormType = FlightFormSchema.parse({
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
  const tableFields: TimeTableField<FlightFormInput>[] = [
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

  const shouldSaveDraft = (values: FlightFormInput) => {
    const data: FlightFormType = FlightFormSchema.parse(values);

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
            <DateField<FlightFormInput>
              name="date"
              label="Date"
              isLoading={isLoading}
              required
            />

            <ObjectDialogSelectField<FlightFormInput, SelectedAircraft>
              name="aircraft"
              label="Aircraft"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  current: form.getValues("aircraft")?.id ?? null,
                  return: pathname ?? "/app/logs/flight/new",
                });
                router.push("/app/logs/flight/fleet-select");
              }}
              required
              displayValue={(aircraft) =>
                aircraft
                  ? `${aircraft.registration}${aircraft.model || aircraft.type ? ` | ${aircraft.model || aircraft.type}` : ""}`
                  : null
              }
            />

            <TextField<FlightFormInput>
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
              FlightFormInput,
              SelectedAirport & { runway?: string | null }
            >
              name="departure_airport"
              label="Departure"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  role: "departure",
                  current: form.getValues("departure_airport")?.icao ?? null,
                  return: pathname ?? "/app/logs/flight/new",
                  runway: form.getValues("departure_runway") ?? null,
                });
                router.push("/app/logs/flight/airport-select");
              }}
              required
              displayValue={(ap) => {
                if (!ap) return null;
                const runway = form.getValues("departure_runway");
                return runway ? `${ap.icao} | ${runway}` : ap.icao;
              }}
            />
            <ObjectDialogSelectField<
              FlightFormInput,
              SelectedAirport & { runway?: string | null }
            >
              name="destination_airport"
              label="Destination"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  role: "destination",
                  current: form.getValues("destination_airport")?.icao ?? null,
                  return: pathname ?? "/app/logs/flight/new",
                  runway: form.getValues("destination_runway") ?? null,
                });
                router.push("/app/logs/flight/airport-select");
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
              FlightFormInput,
              { id: string; first_name: string; last_name: string; code: string }
            >
              name="pic"
              label="PIC"
              isLoading={isLoading}
              required
              onOpenDialog={() => {
                const picId = form.getValues("pic_id");
                writeSelectContext({
                  current: picId === null ? "__SELF__" : picId,
                  return: pathname ?? "/app/logs/flight/new",
                });
                router.push("/app/logs/flight/crew-select");
              }}
              displayValue={(pic) => {
                if (!pic) return null;
                // Handle SELF case
                if (pic.first_name === "Self") {
                  return "SELF";
                }
                const name = `${pic.first_name} ${pic.last_name}`.trim();
                const code = `${pic.code}`;
                return code ? `${name} | ${code}` : name;
              }}
            />

            {/* Function */}
            <SelectField<FlightFormInput>
              name="function"
              label="Function"
              options={functionOptions}
              isLoading={isLoading}
              required
            />
          </PositionedGroup>
        </div>

        {/* Time Table */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Time Information
          </h3>

          <TimeTable<FlightFormInput> fields={tableFields} />
        </div>

        {/* Time Fields */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Total Time Information
          </h3>

          <div className="space-y-3">
            <PositionedGroup>
              <TimeInputField<FlightFormInput>
                name="total_block_minutes"
                label="Total Time"
                isLoading={isLoading}
                required
              />

              <TimeInputField<FlightFormInput>
                name="total_air_minutes"
                label="Air Time"
                isLoading={isLoading}
                required
              />

              {preferences.logging.fields.duty && (
                <TimeInputField<FlightFormInput>
                  name="duty_time_minutes"
                  label="Duty Time"
                  isLoading={isLoading}
                  required
                />
              )}
            </PositionedGroup>

            <PositionedGroup>
              <DurationInputField<FlightFormInput>
                name="ifr_time_minutes"
                label="IFR Time"
                referenceMinutesField="total_block_minutes"
                isLoading={isLoading}
              />

              <NightTimeDurationInputField<FlightFormInput>
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
                <DurationInputField<FlightFormInput>
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
            <ManoeuvresField<FlightFormInput>
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
                <ObjectDialogSelectField<FlightFormInput, string[]>
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
                    });
                    router.push("/app/logs/flight/approach-select");
                  }}
                  displayValue={(arr) => (arr?.length ? arr.join(", ") : null)}
                />
              )}

              {/* Go-arounds */}
              {preferences.logging.fields.go_arounds && (
                <ManoeuvreInput<FlightFormInput>
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
                  <TextField<FlightFormInput>
                    name="passengers"
                    label="Passengers"
                    type="number"
                    isLoading={isLoading}
                  />
                )}

                {preferences.logging.fields.fuel && (
                  <TextField<FlightFormInput>
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
            <TextareaField<FlightFormInput>
              name="remarks"
              label="Remarks"
              rows={1}
              isLoading={isLoading}
            />

            {preferences.logging.fields.training && (
              <TextareaField<FlightFormInput>
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
