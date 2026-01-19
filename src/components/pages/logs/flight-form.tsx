"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { updateFlight } from "@/actions/pages/logs/flight/update";
import { createFlight } from "@/actions/pages/logs/flight/create";
import { deleteFlight } from "@/actions/pages/logs/flight/delete";
import { fetchAircraftDisplayValue } from "@/actions/pages/logs/fetch";

import { Flight, FlightFormSchema, FlightFormInput, FlightForm as FlightFormType } from "@/types/logs";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import LogForm from "@/components/pages/logs/form";
import { clearDraftCookie, getDraftFromCookie, saveDraftToCookie } from "@/components/pages/logs/flight-cookie-helper";
import { AsyncDialogSelectField, DateField, DialogSelectField, TextField } from "@/components/ui/form-field-types";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { clearSelectedFleet, readSelectedFleet } from "./select/selected-fleet-asset";
import { FormField } from "@/components/ui/form-field";
import { Field } from "@/components/ui/field";
import { ChevronRight } from "lucide-react";

const emptyValues: FlightFormInput = {
  date: new Date(),
  aircraft_id: "",
  pic_id: null,
  departure_airport_code: "",
  departure_runway: null,
  destination_airport_code: "",
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
  isLoading?: boolean;
}

export default function FlightForm({ flight, isLoading }: FlightFormProps) {
  const router = useRouter();
  const isEdit = !!flight;

  const form = useForm<FlightFormInput>({
    resolver: zodResolver(FlightFormSchema),
    defaultValues: emptyValues,
  });

  // Load flight data for editing
  useEffect(() => {
    if (flight && !isLoading) {
      form.reset({
        date: flight.date,
        aircraft_id: flight.aircraft_id,
        pic_id: flight.pic_id,
        departure_airport_code: flight.departure_airport_code,
        departure_runway: flight.departure_runway,
        destination_airport_code: flight.destination_airport_code,
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
    }
  }, [flight, isLoading, form]);

  useEffect(() => {
    const selected = readSelectedFleet();
    if (!selected) return;

    console.log(selected)

    // Set the full object, not just id
    form.setValue("aircraft", {
      id: selected.id ?? "",
      registration: selected.registration ?? "",
      type: selected.type ?? "",
      model: selected.model ?? "",
      isSimulator: selected.is_simulator ?? false,
    });

    console.log(form.getValues().aircraft)

    clearSelectedFleet();
  }, [form])

  const handleSubmit = async (values: FlightFormInput) => {
    const data: FlightFormType = FlightFormSchema.parse(
      {
        ...values,
        aircraft_id: values.aircraft?.id ?? ""
      }
    )

    if (isEdit && flight) {
      await updateFlight(flight.id, data);
    } else {
      await createFlight(data);
    }
  };

  const handleDelete = async () => {
    if (flight?.id) {
      await deleteFlight(flight.id);
    }
  };

  const shouldSaveDraft = (values: FlightFormInput) => {
    const data: FlightFormType = FlightFormSchema.parse(values)

    return !!(data.departure_airport_code || data.destination_airport_code || data.aircraft_id);
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


            {/* -------------- WIP ---------------- */}
            {/* <AsyncDialogSelectField<FlightFormInput>
              name="aircraft"
              label="Aircraft"
              isLoading={isLoading}
              onOpenDialog={() => router.push("/app/logs/flight/fleet-select")}
              placeholder="select"
              required
            /> */}

            <DialogSelectField<FlightFormInput>
              name="aircraft.id"
              label="Test"
              isLoading={isLoading}
              onOpenDialog={() => router.push("/app/logs/flight/fleet-select")}
              required
            />

            <FormField
              control={form.control}
              name={"aircraft.id"}
              render={({ field }) => {
                const aircraft = field.value

                console.log(aircraft)

                return (
                  <Field>
                    <PositionedItem
                      role="button"
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push("/app/logs/flight/fleet-select")}
                    >
                      <span className="text-sm font-medium w-36">
                        Label
                        <span className="text-destructive ml-1">*</span>
                      </span>
                      <div className="w-full ml-10 flex items-center justify-end gap-2 mr-2">
                        <span className="text-sm text-right truncate">
                          { }
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </PositionedItem>
                  </Field>
                )
              }}
            />

            {/* -------------- WIP ---------------- */}

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
            {/* Dialog select departure + departure runway */}

            {/* Dialog select destination + destination runway */}
          </PositionedGroup>
        </div>

        {/* Hours Section - Times Table */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Time Table
          </h3>

          <PositionedGroup></PositionedGroup>
        </div>

        {/* Time Function Fields */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Time Fields
          </h3>

          <PositionedGroup>
            {/* Make it dynamic with timeRows and covert from minutes to HH:mm*/}
            <TextField<FlightFormInput> name="total_block_minutes" label="Total" />
          </PositionedGroup>
        </div>

        {/* Function + PIC + Pilot Flying */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Function Information
          </h3>

          <PositionedGroup>
            {/* <SelectField<FlightFormInput> name="function" label="Function" /> */}
          </PositionedGroup>
        </div>

        {/* Manoeuvres (take-off, landing, go-around & approaches) */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Manoeuvres Information
          </h3>

          <PositionedGroup>
            {/* <SelectField<FlightFormInput> name="function" label="Function" /> */}
          </PositionedGroup>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Notes
          </h3>

          <PositionedGroup>
            {/* <SelectField<FlightFormInput> name="function" label="Function" /> */}
          </PositionedGroup>
        </div>
      </div>
    </LogForm>
  )
}