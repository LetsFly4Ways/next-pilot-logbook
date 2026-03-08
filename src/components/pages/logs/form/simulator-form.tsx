"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SimulatorSessionRecord } from "@/actions/pages/logs/fetch";
import { updateSimulatorSession } from "@/actions/pages/logs/simulator/update";
import { createSimulatorSession } from "@/actions/pages/logs/simulator/create";
import { deleteSimulatorSession } from "@/actions/pages/logs/simulator/delete";

import { UserPreferences } from "@/types/user-preferences";
import {
  SimulatorSessionFormSchema,
  SimulatorSessionFormValues,
  SimulatorSessionPayloadSchema
} from "@/types/logs";
import { Fleet } from "@/types/fleet";

import { formatCrewName } from "@/lib/format-crew";
import { calculateDurationMinutes } from "@/lib/time-utils";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  clearDraftCookie,
  getDraftFromCookie,
  saveDraftToCookie
} from "@/components/pages/logs/form/simulator-cookie-helper";
import {
  clearSimulatorFormSelection,
  readSimulatorFormSelection,
  CrewSelectionPayload,
} from "@/components/pages/logs/select/simulator-form-selection";
import { writeSelectContext } from "@/components/pages/logs/select/select-context";

import LogForm from "@/components/pages/logs/form/form";

import { PositionedGroup } from "@/components/ui/positioned-group";
import {
  DateField,
  ObjectDialogSelectField,
  TextareaField,
  TimeInputField
} from "@/components/ui/form-field-types";
import TimeTable, { TimeTableField } from "@/components/pages/logs/form/time-table";

const emptyValues: SimulatorSessionFormValues = {
  date: new Date().toISOString().split("T")[0], // Store as YYYY-MM-DD
  aircraft_id: "",
  simulator: null,
  instructor_id: null,
  instructor_is_self: false,
  instructor: null,

  session_minutes: 0,
  duty_start: null,
  duty_end: null,
  duty_time_minutes: 0,
  hobbs_start: null,
  hobbs_end: null,

  remarks: null,
  training_description: null,
}

interface SimulatorFormProps {
  session?: SimulatorSessionRecord;
  isEdit?: boolean;
  isLoading?: boolean;
  preferences: UserPreferences;
}

export default function SimulatorForm({
  session,
  isEdit = false,
  isLoading,
  preferences
}: SimulatorFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  const hasInitializedForm = useRef(false);

  const form = useForm<SimulatorSessionFormValues>({
    resolver: zodResolver(SimulatorSessionFormSchema),
    defaultValues: emptyValues,
  });

  // ------- Selection reader ------- //
  /**
   * Single reader: handle any selection returned from select pages
   */
  useEffect(() => {
    const selection = readSimulatorFormSelection();
    if (!selection) return;

    switch (selection.type) {
      case "simulator":
        form.setValue("simulator", selection.payload);
        form.setValue("aircraft_id", selection.payload.id);
        break;

      case "crew":
        form.setValue("instructor_id", selection.payload.id);
        form.setValue("instructor", selection.payload);
        form.setValue("instructor_is_self", selection.payload.id === null);
        break;
    }
    clearSimulatorFormSelection();
  }, [form]);

  /**
  * Poll briefly after mount so we pick up selection when navigating back
  */
  useEffect(() => {
    const t = setInterval(() => {
      const selection = readSimulatorFormSelection();
      if (!selection) return;

      switch (selection.type) {
        case "simulator":
          form.setValue("simulator", selection.payload);
          form.setValue("aircraft_id", selection.payload.id);
          break;

        case "crew":
          form.setValue("instructor_id", selection.payload.id);
          form.setValue("instructor", selection.payload);
          form.setValue("instructor_is_self", selection.payload.id === null);
          break;
      }
    }, 100);

    const timeout = setTimeout(() => clearInterval(t), 2000);
    return () => {
      clearInterval(t);
      clearTimeout(timeout);
    };
  }, [form]);

  // ------- Initialize form (edit mode) ------- //
  // All display data is pre-resolved in SimulatorSessionRecord — no client fetches needed.
  useEffect(() => {
    if (!session || isLoading || hasInitializedForm.current) return;
    hasInitializedForm.current = true;

    form.reset({
      ...session,
      simulator: session._simulator,
      instructor: session._instructor,
    })
  }, [session, isLoading, form]);

  // ------- Time Watchers ------- //
  const dutyStart = useWatch({ control: form.control, name: "duty_start" });
  const dutyEnd = useWatch({ control: form.control, name: "duty_end" });

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

  // ------- Time Table Setup ------- //
  const tableFields: TimeTableField<SimulatorSessionFormValues>[] = [
    {
      label: "Duty",
      offKey: "duty_start",
      onKey: "duty_end",
      required: false,
      visible: preferences.logging.fields.duty,
      inputType: "time" as const,
    },
    {
      label: "Hobbs",
      offKey: "hobbs_start",
      onKey: "hobbs_end",
      required: false,
      visible: preferences.logging.fields.hobbs,
      inputType: "number" as const,
    },
  ];

  // ------- Submit ------- //
  const handleSubmit = async (values: SimulatorSessionFormValues) => {
    const result = SimulatorSessionPayloadSchema.safeParse(values);

    if (!result.success) {
      console.group("SimulatorSessionPayloadSchema parse failed");
      console.log("Raw values:", values);
      console.table(
        result.error.issues.map((i) => ({
          path: i.path.join("."),
          code: i.code,
          message: i.message,
        }))
      );
      console.groupEnd();

      const payloadToFormField: Partial<Record<string, keyof SimulatorSessionFormValues>> = {
        aircraft_id: "simulator",
        instructor_id: "instructor"
      };

      result.error.issues.forEach((issue) => {
        const payloadPath = issue.path[0] as string;
        const formField = payloadToFormField[payloadPath] ?? payloadPath as keyof SimulatorSessionFormValues;
        form.setError(formField, { message: issue.message }, { shouldFocus: true });
      });

      // Still throw so the form treats it as a submission error
      throw result.error;
    } else {
      console.group("SimulatorSessionPayloadSchema parse succeeded");
      console.log("Parsed payload:", result.data);
      console.groupEnd();
    }

    if (isEdit && session) {
      await updateSimulatorSession(session.id, result.data);
    } else {
      await createSimulatorSession(result.data);
    }

    form.reset()
  };

  const handleDelete = async () => {
    if (session?.id) {
      await deleteSimulatorSession(session.id);
    }
  };

  const shouldSaveDraft = (values: SimulatorSessionFormValues) => {

    return !!(
      (values.date !== new Date().toISOString().split("T")[0]) ||
      values.aircraft_id ||
      values.instructor_id ||
      values.instructor_is_self === true ||
      values.session_minutes > 0
    );
  };


  return (
    <LogForm
      id={session?.id}
      form={form}
      isEdit={isEdit}
      isLoading={isLoading}
      title="Simulator Session"
      draftName="simulator"
      onSubmit={handleSubmit}
      onDelete={isEdit ? handleDelete : undefined}
      onDraftRestore={getDraftFromCookie}
      onDraftSave={saveDraftToCookie}
      onDraftClear={clearDraftCookie}
      shouldSaveDraft={shouldSaveDraft}
    >
      <div className="space-y-8">
        {/* Basic Information (date & simulator)*/}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Basic Information
          </h3>

          <PositionedGroup>
            <DateField<SimulatorSessionFormValues>
              name="date"
              label="Date"
              isLoading={isLoading}
              required
            />

            <ObjectDialogSelectField<SimulatorSessionFormValues, Fleet>
              name="simulator"
              label="Simulator"
              isLoading={isLoading}
              onOpenDialog={() => {
                writeSelectContext({
                  type: "simulator",
                  current: form.getValues("simulator")?.id ?? null,
                  return: pathname ?? "/app/logs/simulator/new",
                }, "simulator");
                router.push("/app/logs/simulator/fleet-select");
              }}
              required
              displayValue={(aircraft) =>
                aircraft
                  ? `${aircraft.registration}${aircraft.model || aircraft.type ? ` | ${aircraft.model || aircraft.type}` : ""}`
                  : null
              }
            />
          </PositionedGroup>
        </div>

        {/* Crew & Function */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Crew Information
          </h3>

          {/* Instructor */}
          <PositionedGroup>
            <ObjectDialogSelectField<
              SimulatorSessionFormValues,
              CrewSelectionPayload
            >
              name="instructor"
              label="Instructor"
              isLoading={isLoading}
              required
              onOpenDialog={() => {
                const picId = form.getValues("instructor_id");
                writeSelectContext({
                  type: "simulator",
                  current: form.getValues("instructor_is_self") ? "__SELF__" : picId,
                  return: pathname ?? "/app/logs/simulator/new",
                }, "simulator");
                router.push("/app/logs/simulator/crew-select");
              }}
              displayValue={(crew) => {
                if (!crew) return null;
                if (crew.instructor_is_self || crew.first_name === "Self") {
                  return "SELF";
                }

                const name = formatCrewName(crew.first_name, crew.last_name, preferences.nameDisplay);
                const code = crew.company_id || "";
                return code ? `${name} | ${code}` : name;
              }}
            />
          </PositionedGroup>
        </div>

        {/* Time Table */}
        {(preferences.logging.fields.duty || preferences.logging.fields.hobbs) && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Time Information
            </h3>

            <TimeTable<SimulatorSessionFormValues> fields={tableFields} />
          </div>
        )}

        {/* Time Fields */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Total Time Information
          </h3>

          <PositionedGroup>
            <TimeInputField<SimulatorSessionFormValues>
              name="session_minutes"
              label="Session Time"
              isLoading={isLoading}
              required
            />

            {preferences.logging.fields.duty && (
              <TimeInputField<SimulatorSessionFormValues>
                name="duty_time_minutes"
                label="Duty Time"
                isLoading={isLoading}
              />
            )}
          </PositionedGroup>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Notes
          </h3>

          <PositionedGroup>
            <TextareaField<SimulatorSessionFormValues>
              name="remarks"
              label="Remarks"
              rows={1}
              isLoading={isLoading}
            />

            {preferences.logging.fields.training && (
              <TextareaField<SimulatorSessionFormValues>
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
  )
}