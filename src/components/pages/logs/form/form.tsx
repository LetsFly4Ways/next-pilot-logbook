import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

interface BaseLogFormProps<TForm extends FieldValues> {
  id?: string;
  form: UseFormReturn<TForm>;
  isEdit: boolean;
  isLoading?: boolean;
  title: string;
  draftName: string;
  onSubmit: (data: TForm) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDraftRestore: () => TForm | null;
  onDraftSave: (data: TForm) => void;
  onDraftClear: () => void;
  shouldSaveDraft: (data: TForm) => boolean;
  children: React.ReactNode;
}

export default function LogForm<TForm extends FieldValues>({
  id,
  form,
  isEdit,
  isLoading,
  title,
  draftName,
  onSubmit,
  onDelete,
  onDraftRestore,
  onDraftSave,
  onDraftClear,
  shouldSaveDraft,
  children
}: BaseLogFormProps<TForm>) {
  const router = useRouter();
  const restorePromptShownRef = useRef(false);

  const {
    formState: { isSubmitting },
  } = form;

  // Restore draft on mount (only once)
  useEffect(() => {
    if (isEdit || restorePromptShownRef.current) return;
    restorePromptShownRef.current = true;

    const draft = onDraftRestore();
    if (!draft) return;

    try {
      if (
        window.confirm(
          `A saved ${draftName} draft was found. Would you like to restore it?`
        )
      ) {
        form.reset(draft);
      } else {
        onDraftClear();
      }
    } catch (e) {
      console.error(`Failed to parse ${draftName} draft:`, e);
    }
  }, [isEdit, form, draftName, onDraftRestore, onDraftClear]);

  // Called by RHF when zodResolver passes.
  const handleValidSubmit = async (data: TForm) => {
    try {
      console.log("Submitting form with data:", data);
      await onSubmit(data);
      if (!isEdit) onDraftClear();
      router.push("/app/logs");
    } catch (error) {
      // Anything thrown by the child's onSubmit (ZodError, network error, etc.)
      // is caught here and surfaced in the banner.
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      console.error(`Failed to save ${draftName}:`, message);
    }
  };


  const handleDraftSave = () => {
    if (!isEdit && !isSubmitting) {
      const values = form.getValues();
      if (shouldSaveDraft(values)) {
        onDraftSave(values);
      }
    }
  };

  const debouncedSaveDraft = useDebouncedCallback(handleDraftSave, 500);

  const resetForm = () => {
    onDraftClear();
    form.reset();
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm(`Are you sure you want to delete this ${draftName}?`)) {
      return;
    }

    try {
      await onDelete();
      router.push("/app/logs");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : `Failed to delete ${draftName}`
      );
    }
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title={isEdit ? `Edit ${title.charAt(0).toUpperCase() + title.slice(1)}` : `New ${title.charAt(0).toUpperCase() + title.slice(1)}`}
        backHref={isEdit ? `/app/logs/${draftName}/${id}` : "/app/logs"}
        showBackButton={true}
        isTopLevelPage={false}
        actionButton={
          isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <Button
              type="submit"
              form="log-form"
              variant="ghost"
              className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Save"}
            </Button>
          )
        }
      />

      <div className="p-4 md:p-6">
        <FormProvider {...form}>
          <form id="log-form"
            onSubmit={
              async (e) => {
                e.preventDefault();
                const values = form.getValues();
                await handleValidSubmit(values);
              }}
            onChange={debouncedSaveDraft}
            className="space-y-8"
          >
            {children}

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

            {isEdit && !isLoading && onDelete && (
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