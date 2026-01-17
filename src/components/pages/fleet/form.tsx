"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { FleetFormSchema } from "@/types/fleet";
import type { Fleet, FleetForm } from "@/types/fleet";

import { zodResolver } from "@hookform/resolvers/zod";

import { FormProvider, useForm } from "react-hook-form";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

import { clearDraftCookie, getDraftFromCookie, saveDraftToCookie } from "@/components/pages/fleet/cookie-helpers";

import { updateFleet } from "@/actions/pages/fleet/update";
import { createFleet } from "@/actions/pages/fleet/create";
import { deleteFleet } from "@/actions/pages/fleet/delete";

import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { DialogSelectField, SelectField, SwitchField, TextareaField, TextField } from "@/components/ui/form-field-types";
import { clearSelectedAircraft, readSelectedAircraft } from "@/components/pages/fleet/type-select/selected-aircraft-type";

const emptyValues: FleetForm = {
  registration: "",
  is_simulator: false,
  type: "",
  model: "",
  manufacturer: "",
  category: "",
  engine_count: 0,
  engine_type: "",
  passenger_seats: 0,
  operator: "",
  status: "",
  note: "",
}

const categoryOptions = [
  { label: "Single Pilot", value: "single-pilot" },
  { label: "Multi Pilot", value: "multi-pilot" },
];

const engineTypeOptions = [
  { label: "Piston", value: "piston" },
  { label: "Turboprop", value: "turboprop" },
  { label: "Jet", value: "jet" },
  { label: "Helicopter", value: "helicopter" },
  { label: "Electric", value: "electric" },
  { label: "Unpowered", value: "unpowered" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Stored", value: "stored" },
  { label: "Scrapped", value: "scrapped" },
  { label: "Sold", value: "sold" },
];

interface FleetFormProps {
  fleet?: Fleet;
  isLoading?: boolean;
}

export default function FleetForm({ fleet, isLoading }: FleetFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isEdit = !!fleet;

  const form = useForm<FleetForm>({
    resolver: zodResolver(FleetFormSchema),
    defaultValues: emptyValues,
  });

  const {
    formState: { isSubmitting },
  } = form;

  const restorePromptShownRef = useRef(false); // ensure we only show once

  // Restore draft on mount (only once)
  useEffect(() => {
    if (isEdit || restorePromptShownRef.current) return;
    restorePromptShownRef.current = true;

    const draft = getDraftFromCookie();
    if (!draft) return;

    try {
      // Show standard browser confirm to restore the draft
      if (
        window.confirm(
          "A saved crew draft was found. Would you like to restore it?"
        )
      ) {
        form.reset(draft);
      } else {
        clearDraftCookie();
      }
    } catch (e) {
      console.error("Failed to parse crew draft:", e);
    }
  }, [isEdit, form]);

  // Load fleet data for editing
  useEffect(() => {
    if (fleet && !isLoading) {
      form.reset({
        registration: fleet.registration,
        is_simulator: fleet.is_simulator,
        type: fleet.type,
        model: fleet.model,
        manufacturer: fleet.manufacturer,
        category: fleet.category,
        engine_count: fleet.engine_count,
        engine_type: fleet.engine_type,
        passenger_seats: fleet.passenger_seats,
        operator: fleet.operator,
        status: fleet.status,
        note: fleet.note,
      });
    }
  }, [fleet, isLoading, form]);

  useEffect(() => {
    const selected = readSelectedAircraft();
    if (!selected) return;

    form.reset({
      ...form.getValues(),

      // authoritative overwrite
      type: selected.Type ?? "",
      model: selected.Model ?? "",
      manufacturer: selected.Manufacturer ?? "",
      engine_count: selected.EngineCount ?? 0,
      engine_type: selected.EngineType ?? "",
      category: selected.Category ?? "",
    });

    clearSelectedAircraft();
  }, [pathname, form]);

  const onSubmit = async (data: FleetForm) => {
    try {
      if (isEdit && fleet) {
        await updateFleet(fleet.id, data);
        console.log("Updating...");
      } else {
        await createFleet(data);
        console.log("Creating...");
        clearDraftCookie(); // Clear draft after successful creation
      }

      console.log("Success, redirecting...");
      router.push("/app/fleet");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  const handleDraftSave = () => {
    if (!isEdit && !isSubmitting) {
      const values = form.getValues();
      // Only save if there's actual content
      if (values.registration || values.type || values.model || values.manufacturer || values.engine_count || values.engine_type || values.category) {
        saveDraftToCookie(values);
      }
    }
  };

  const debouncedSaveDraft = useDebouncedCallback(
    handleDraftSave,
    500
  );

  const resetForm = () => {
    clearDraftCookie();
    form.reset(emptyValues);
  };

  const handleDelete = async () => {
    if (!fleet?.id) return;

    if (!confirm("Are you sure you want to delete this fleet asset?")) {
      return;
    }

    try {
      await deleteFleet(fleet.id);
      router.push("/app/fleet");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Failed to delete fleet asset"
      );
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title={isEdit ? "Edit Fleet Asset" : "New Fleet Asset"}
        backHref="/app/fleet"
        showBackButton={true}
        isTopLevelPage={false}
        actionButton={
          isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <Button
              variant="ghost"
              onClick={form.handleSubmit(onSubmit)}
              className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Save"}
            </Button>
          )
        }
      />

      <div className="p-6">
        <FormProvider {...form}>
          <form onChange={debouncedSaveDraft} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h3>

              <PositionedGroup>
                <TextField<FleetForm> name="registration" label="Registration" isLoading={isLoading} required />
                <SwitchField<FleetForm> name="is_simulator" label="Simulator" isLoading={isLoading} />
                <TextField<FleetForm> name="operator" label="Operator" isLoading={isLoading} />
              </PositionedGroup>
            </div>

            {/* Aircraft Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                {fleet?.is_simulator ? "Simulator" : "Aircraft"} Information
              </h3>

              <PositionedGroup>
                <DialogSelectField<FleetForm>
                  name="type"
                  label="Type"
                  isLoading={isLoading}
                  onOpenDialog={() => router.push("/app/fleet/type-select")}
                  placeholder="Select"
                  required
                />
                <TextField<FleetForm> name="model" label="Model" isLoading={isLoading} />
                <TextField<FleetForm> name="manufacturer" label="Manufacturer" isLoading={isLoading} />
                <SelectField<FleetForm> name="category" label="Category" options={categoryOptions} isLoading={isLoading} required />
                <SelectField<FleetForm> name="engine_type" label="Engine Type" options={engineTypeOptions} isLoading={isLoading} required />
                <TextField<FleetForm> name="engine_count" label="Engine Count" type="number" isLoading={isLoading} required />
              </PositionedGroup>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Additional Information
              </h3>

              <PositionedGroup>
                <TextField<FleetForm> name="passenger_seats" label="Passenger Seats" type="number" isLoading={isLoading} />
                <SelectField<FleetForm> name="status" label="Status" options={statusOptions} isLoading={isLoading} />
              </PositionedGroup>
            </div>

            {/* Notes Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Additional Information
              </h3>

              <PositionedGroup>
                <TextareaField<FleetForm> name="note" label="Note" isLoading={isLoading} />
              </PositionedGroup>
            </div>


            {/* Action Buttons */}
            {!isEdit && !isLoading && (
              <PositionedGroup>
                <PositionedItem
                  className="p-3 flex items-center justify-start cursor-pointer"
                  onClick={resetForm}
                >
                  <span className="text-sm font-medium text-blue-500">
                    Reset
                  </span>
                </PositionedItem>
              </PositionedGroup>
            )}

            {isEdit && !isLoading && (
              <PositionedGroup>
                <PositionedItem
                  className="p-3 flex items-center justify-start cursor-pointer"
                  onClick={handleDelete}
                >
                  <span className="text-sm font-medium text-red-500">
                    Delete
                  </span>
                </PositionedItem>
              </PositionedGroup>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
