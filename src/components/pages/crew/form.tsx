"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { CrewFormSchema } from "@/types/crew";
import type { Crew, CrewForm } from "@/types/crew";

import { zodResolver } from "@hookform/resolvers/zod";

import { FormProvider, useForm } from "react-hook-form";
import {
  clearDraftCookie,
  getDraftFromCookie,
  saveDraftToCookie,
} from "@/components/pages/crew/cookie-helpers";

import { updateCrew } from "@/actions/pages/crew/update";
import { createCrew } from "@/actions/pages/crew/create";
import { deleteCrew } from "@/actions/pages/crew/delete";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TextareaField, TextField } from "@/components/ui/form-field-types";

const emptyValues: CrewForm = {
  first_name: "",
  last_name: "",
  email: null,
  phone: null,
  address: null,
  license_number: null,
  company: null,
  company_id: null,
  note: null,
};

interface CrewFormProps {
  crew?: Crew;
  isLoading?: boolean;
}

export default function CrewForm({ crew, isLoading }: CrewFormProps) {
  const router = useRouter();
  const isEdit = !!crew;

  const form = useForm<CrewForm>({
    resolver: zodResolver(CrewFormSchema),
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

  // Load crew data for editing
  useEffect(() => {
    if (crew && !isLoading) {
      form.reset({
        first_name: crew.first_name,
        last_name: crew.last_name,
        email: crew.email,
        phone: crew.phone,
        address: crew.address,
        license_number: crew.license_number,
        company: crew.company,
        company_id: crew.company_id,
        note: crew.note,
      });
    }
  }, [crew, isLoading, form]);

  const onSubmit = async (data: CrewForm) => {
    try {
      if (isEdit && crew) {
        await updateCrew(crew.id, data);
        console.log("Updating...");
      } else {
        await createCrew(data);
        console.log("Creating...");
        clearDraftCookie(); // Clear draft after successful creation
      }

      console.log("Success, redirecting...");
      router.push("/app/crew");
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
      if (values.first_name || values.last_name) {
        saveDraftToCookie(values);
      }
    }
  };

  const resetForm = () => {
    clearDraftCookie();
    form.reset(emptyValues);
  };

  const handleDelete = async () => {
    if (!crew?.id) return;

    if (!confirm("Are you sure you want to delete this crew member?")) {
      return;
    }

    try {
      await deleteCrew(crew.id);
      router.push("/app/crew");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Failed to delete crew member"
      );
    }
  };

  // const renderFormField = (
  //   name: keyof CrewForm,
  //   label: string,
  //   type: string = "text"
  // ) => {
  //   if (isLoading) {
  //     return (
  //       <PositionedItem key={name} className="py-2">
  //         <Skeleton className="h-12 w-full" />
  //       </PositionedItem>
  //     );
  //   }

  //   const isRequired = name === "first_name" || name === "last_name";

  //   return (
  //     <FormField
  //       key={name}
  //       control={form.control}
  //       name={name}
  //       render={({ field }) => (
  //         <Field>
  //           <PositionedItem className="p-3 flex items-center justify-between">
  //             <span className="text-sm font-medium w-36">
  //               {label}
  //               {isRequired && <span className="text-destructive ml-1">*</span>}
  //             </span>
  //             <div className="w-full ml-10 flex flex-col gap-1">
  //               <input
  //                 {...field}
  //                 type={type}
  //                 value={field.value ?? ""}
  //                 required={isRequired}
  //                 className="w-full h-fit p-0 rounded-md border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right"
  //               />
  //             </div>
  //           </PositionedItem>
  //         </Field>
  //       )}
  //     />
  //   );
  // };

  return (
    <div className="flex flex-col">
      <PageHeader
        title={isEdit ? "Edit Crew Member" : "New Crew Member"}
        backHref="/app/crew"
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
          <form onChange={handleDraftSave} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Name
              </h3>
              <PositionedGroup>
                <TextField<CrewForm> name="first_name" label="First Name" isLoading={isLoading} required />
                <TextField<CrewForm> name="last_name" label="Last Name" isLoading={isLoading} required />
              </PositionedGroup>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <PositionedGroup>
                <TextField<CrewForm> name="email" label="Email" isLoading={isLoading} />
                <TextField<CrewForm> name="phone" label="Phone" isLoading={isLoading} />
              </PositionedGroup>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Professional Information
              </h3>
              <PositionedGroup>
                <TextField<CrewForm> name="license_number" label="License Number" isLoading={isLoading} />
                <TextField<CrewForm> name="company" label="Company" isLoading={isLoading} />
                <TextField<CrewForm> name="company_id" label="Company ID" isLoading={isLoading} />
                <TextField<CrewForm> name="address" label="Address" isLoading={isLoading} />
              </PositionedGroup>
            </div>

            {/* Notes Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Additional Information
              </h3>

              <PositionedGroup>
                <TextareaField<CrewForm> name="note" label="Note" isLoading={isLoading} />
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
  );
}
