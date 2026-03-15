"use client";

import { useFormContext, FieldValues, Path } from "react-hook-form";
import { ChevronsUpDown } from "lucide-react";

import { FormField } from "@/components/ui/form-field";
import { Field } from "@/components/ui/field";
import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";

import {
  PilotFunction,
  SELF_PIC_FUNCTIONS,
  OTHER_PIC_FUNCTIONS,
} from "@/types/logs";

interface FunctionSelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  picIsSelf: boolean;
  isLoading?: boolean;
  required?: boolean;
}

export function FunctionSelectField<T extends FieldValues>({
  name,
  label = "Function",
  picIsSelf,
  isLoading,
  required = false,
}: FunctionSelectFieldProps<T>) {
  const form = useFormContext<T>();

  if (isLoading) {
    return (
      <PositionedItem className="py-2">
        <Skeleton className="h-12 w-full" />
      </PositionedItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <PositionedItem
            invalid={!!fieldState.error}
            className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium w-36">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </span>

            <div className="w-full ml-10 flex items-center justify-end">
              <select
                {...field}
                className={`appearance-none rounded-md w-full max-w-48 bg-transparent text-sm pr-6 py-1 border-none focus:ring-0 focus:border-none cursor-pointer ${field.value && field.value !== ""
                  ? "text-foreground"
                  : fieldState.error
                    ? "text-destructive"
                    : "text-muted-foreground"
                  }`}
                style={{ textAlignLast: "right" }}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value as PilotFunction;
                  if (!value) return;

                  const isCrossBoundary =
                    (picIsSelf && OTHER_PIC_FUNCTIONS.includes(value)) ||
                    (!picIsSelf && SELF_PIC_FUNCTIONS.includes(value));

                  if (isCrossBoundary) {
                    const message = picIsSelf
                      ? `"${value}" is normally used when someone else is PIC. Are you sure you want to log this function?`
                      : `"${value}" is normally used when you are PIC. Are you sure you want to log this function?`;

                    const confirmed = window.confirm(message);

                    if (!confirmed) {
                      // Reset the native element back to the current form value
                      // so it doesn't visually jump to the rejected selection
                      e.target.value = field.value ?? "";
                      return;
                    }
                  }

                  field.onChange(value);
                }}
              >
                <option value="" disabled>
                  {fieldState.error?.message ?? "Select"}
                </option>

                <optgroup label={picIsSelf ? "Self as PIC" : "Other as PIC"}>
                  {(picIsSelf ? SELF_PIC_FUNCTIONS : OTHER_PIC_FUNCTIONS).map(
                    (fn) => (
                      <option key={fn} value={fn}>
                        {fn}
                      </option>
                    ),
                  )}
                </optgroup>

                <optgroup
                  label={picIsSelf ? "Other PIC (non-standard)" : "Self as PIC (non-standard)"}
                >
                  {(picIsSelf ? OTHER_PIC_FUNCTIONS : SELF_PIC_FUNCTIONS).map(
                    (fn) => (
                      <option key={fn} value={fn}>
                        {fn}
                      </option>
                    ),
                  )}
                </optgroup>
              </select>

              <ChevronsUpDown className="absolute right-3 w-4 h-4 pointer-events-none text-muted-foreground" />
            </div>
          </PositionedItem>
        </Field>
      )}
    />
  );
}