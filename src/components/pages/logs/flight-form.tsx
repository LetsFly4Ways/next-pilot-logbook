"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { updateFlight } from "@/actions/pages/logs/flight/update";
import { createFlight } from "@/actions/pages/logs/flight/create";
import { deleteFlight } from "@/actions/pages/logs/flight/delete";
import { fetchAsset } from "@/actions/pages/fleet/fetch";

import {
  Flight,
  FlightFormSchema,
  FlightFormInput,
  FlightForm as FlightFormType,
  SelectedAircraft,
} from "@/types/logs";
import { UserPreferences } from "@/types/user-preferences";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import LogForm from "@/components/pages/logs/form";
import {
  clearDraftCookie,
  getDraftFromCookie,
  saveDraftToCookie,
} from "@/components/pages/logs/flight-cookie-helper";
import {
  DateField,
  ObjectDialogSelectField,
  TextField,
} from "@/components/ui/form-field-types";
import { PositionedGroup } from "@/components/ui/positioned-group";
import {
  clearSelectedFleet,
  readSelectedFleet,
} from "@/components/pages/logs/select/selected-fleet-asset";
import TimeTable, { TimeTableField } from "@/components/pages/logs/time-table";

const emptyValues: FlightFormInput = {
  date: new Date(),
  aircraft_id: "",
  aircraft: null,
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
  preferences: UserPreferences;
}

// Helper to read and convert fleet from sessionStorage
function getSelectedFleetAsAircraft(): SelectedAircraft | null {
  const selected = readSelectedFleet();
  if (!selected) return null;

  return {
    id: selected.id ?? "",
    registration: selected.registration ?? "",
    type: selected.type ?? "",
    model: selected.model ?? "",
    isSimulator: selected.is_simulator ?? false,
  };
}

export default function FlightForm({
  flight,
  isLoading,
  preferences
}: FlightFormProps) {
  const router = useRouter();
  const isEdit = !!flight;

  // Track if we've done initial form setup
  const hasInitializedForm = useRef(false);
  const hasFetchedAircraft = useRef(false);

  const form = useForm<FlightFormInput>({
    resolver: zodResolver(FlightFormSchema),
    defaultValues: emptyValues,
  });

  // const { formState: { errors } } = form
  // const formValues = (useWatch({ control: form.control }) || emptyValues) as FlightFormInput;

  // Poll for sessionStorage changes when component is visible
  // This handles the case where user navigates back from fleet-select
  useEffect(() => {
    const checkStorage = () => {
      const selected = getSelectedFleetAsAircraft();
      if (selected) {
        form.setValue("aircraft", selected);
        clearSelectedFleet();
      }
    };

    // Check immediately
    checkStorage();

    // Set up interval to check periodically (handles navigation back)
    const interval = setInterval(checkStorage, 100);

    // Clean up after a short time - selection should be picked up quickly
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [form]);

  // Fetch aircraft data when editing a flight
  useEffect(() => {
    if (!flight?.aircraft_id || hasFetchedAircraft.current) return;

    // Check sessionStorage first - if user just selected an aircraft, use that
    const selectedFromStorage = getSelectedFleetAsAircraft();
    if (selectedFromStorage) {
      hasFetchedAircraft.current = true;
      form.setValue("aircraft", selectedFromStorage);
      clearSelectedFleet();
      return;
    }

    // Otherwise fetch the aircraft from the database
    hasFetchedAircraft.current = true;

    async function loadAircraft() {
      const { asset } = await fetchAsset(flight!.aircraft_id);
      if (asset) {
        const aircraft: SelectedAircraft = {
          id: asset.id,
          registration: asset.registration,
          type: asset.type ?? "",
          model: asset.model ?? "",
          isSimulator: asset.is_simulator,
        };
        form.setValue("aircraft", aircraft);
      }
    }

    loadAircraft();
  }, [flight, flight?.aircraft_id, form]);

  // Initialize form with flight data (only once on mount)
  useEffect(() => {
    if (!flight || isLoading || hasInitializedForm.current) return;
    hasInitializedForm.current = true;

    // Check sessionStorage first in case there's a pending selection
    const selectedFromStorage = getSelectedFleetAsAircraft();

    if (selectedFromStorage) {
      clearSelectedFleet();
    }

    form.reset({
      date: flight.date,
      aircraft_id: flight.aircraft_id,
      aircraft: selectedFromStorage ?? null, // Will be populated by the fetch effect
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
  }, [flight, isLoading, form]);

  // For new flights (no flight prop), initialize with sessionStorage if available
  useEffect(() => {
    if (flight || hasInitializedForm.current) return;
    hasInitializedForm.current = true;

    const selectedFromStorage = getSelectedFleetAsAircraft();
    if (selectedFromStorage) {
      form.setValue("aircraft", selectedFromStorage);
      clearSelectedFleet();
    }
  }, [flight, form]);

  const handleSubmit = async (values: FlightFormInput) => {
    const data: FlightFormType = FlightFormSchema.parse({
      ...values,
      aircraft_id: values.aircraft?.id ?? "",
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
      inputType: "time" as const
    },
    {
      label: "Flight",
      offKey: "flight_start",
      onKey: "flight_end",
      required: true,
      visible: true,
      inputType: "time" as const
    },

    // Optional Fields
    {
      label: "Duty",
      offKey: "duty_start",
      onKey: "duty_end",
      required: false,
      visible: preferences.logging.fields.duty,
      inputType: "time" as const
    },
    {
      label: "Scheduled",
      offKey: "scheduled_start",
      onKey: "scheduled_end",
      required: false,
      visible: preferences.logging.fields.scheduled,
      inputType: "time" as const
    },

    // Hobbs & Tach
    {
      label: "Hobbs",
      offKey: "hobbs_start",
      onKey: "hobbs_end",
      required: false,
      visible: preferences.logging.fields.hobbs,
      inputType: "number" as const
    },
    {
      label: "Tach",
      offKey: "tach_start",
      onKey: "tach_end",
      required: false,
      visible: preferences.logging.fields.tach,
      inputType: "number" as const
    },
  ]

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
              onOpenDialog={() => router.push("/app/logs/flight/fleet-select")}
              placeholder="select"
              required
              displayValue={(aircraft) =>
                aircraft ? `${aircraft.registration} ${(aircraft.model || aircraft.type) && `| ${aircraft.model || aircraft.type}`}` : null
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
            {/* Dialog select departure + departure runway */}

            {/* Dialog select destination + destination runway */}
          </PositionedGroup>
        </div>

        {/* Time Table */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Time Information
          </h3>
          <TimeTable<FlightFormInput>
            fields={tableFields}
          // values={formValues}
          // onChange={(key, value) => {
          //   form.setValue(key as keyof FlightFormInput, value as never);
          // }}
          // errors={errors}
          />
        </div>

        {/* Time Fields */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Total Time Information
          </h3>


        </div>
      </div>
    </LogForm>
  );
}
