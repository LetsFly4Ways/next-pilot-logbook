"use client";

import { useFormContext, FieldValues, Path } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";

import { ChevronRight, ChevronsUpDown } from "lucide-react";

// ============================================================================
// UNIVERSAL FIELD COMPONENTS
// ============================================================================

interface BaseFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  isLoading?: boolean;
}

// TEXT INPUT FIELD
interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  required?: boolean;
  type?: "text" | "email" | "tel" | "number" | "password" | "url";
  placeholder?: string;
}

export function TextField<T extends FieldValues>({
  name,
  label,
  isLoading,
  required = false,
  type = "text",
  placeholder,
}: TextFieldProps<T>) {
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
      render={({ field }) => (
        <Field>
          <PositionedItem
            className="p-3 flex items-center justify-between"
          >
            <span className="text-sm font-medium w-36">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </span>
            <div className="w-full ml-10 flex flex-col gap-1">
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                value={field.value ?? ""}
                required={required}
                className="w-full h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm"
                onChange={(e) => {
                  const value =
                    type === "number"
                      ? e.target.value === ""
                        ? 0
                        : parseFloat(e.target.value)
                      : e.target.value;
                  field.onChange(value);
                }}
              />
            </div>
          </PositionedItem>
        </Field>
      )}
    />
  );
}

// SWITCH FIELD (BOOLEAN)
export function SwitchField<T extends FieldValues>({
  name,
  label,
  isLoading,
}: BaseFieldProps<T>) {
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
      render={({ field }) => (
        <Field>
          <PositionedItem
            className="p-3 flex items-center justify-between"
          >
            <span className="text-sm font-medium w-36">
              {label}
            </span>
            <div className="w-full ml-10 flex flex-col gap-1 items-end">
              <Switch
                className="cursor-pointer mr-2 h-6 w-11 data-[state=checked]:bg-green-500"
                thumbClassName="h-5 w-5 data-[state=checked]:translate-x-5"
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
              />
            </div>
          </PositionedItem>
        </Field>
      )}
    />
  );
}

// SELECT FIELD (SMALL OPTIONS)
interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  isLoading,
  options,
  placeholder = "Select",
  required = false,
}: SelectFieldProps<T>) {
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
      render={({ field }) => (
        <Field>
          <PositionedItem className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium w-36">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </span>
            <div className="w-full ml-10 flex items-center justify-end ">
              {/* <div className="relative flex items-center justify-end"> */}
              <select
                {...field}
                className={`appearance-none rounded-md w-full max-w-48 bg-transparent text-sm pr-8 py-1 border-none focus:ring-0 focus:border-none ${field.value && field.value !== ""
                  ? "text-foreground"
                  : "text-muted-foreground"
                  }`}
                style={{ textAlignLast: "right" }}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronsUpDown className="absolute right-2 w-4 h-4 pointer-events-none text-muted-foreground" />
            </div>
            {/* </div> */}
          </PositionedItem>
        </Field>
      )}
    />
  );
}

// DIALOG SELECT FIELD (LARGE OPTIONS - Opens Modal/Dialog)
interface DialogSelectFieldProps<T extends FieldValues>
  extends BaseFieldProps<T> {
  onOpenDialog: () => void;
  placeholder?: string;
  required?: boolean;
}

export function DialogSelectField<T extends FieldValues>({
  name,
  label,
  isLoading,
  onOpenDialog,
  placeholder = "Select",
  required = false,
}: DialogSelectFieldProps<T>) {
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
      render={({ field }) => (
        <Field>
          <PositionedItem
            role="button"
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
            onClick={onOpenDialog}
          >
            <span className="text-sm font-medium w-36">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </span>
            <div className="w-full ml-10 flex items-center justify-end gap-2 mr-2">
              <span className="text-sm text-right truncate">
                {field.value || (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </PositionedItem>
        </Field>
      )}
    />
  );
}

// TEXTAREA FIELD
interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  isLoading,
  rows = 2,
  placeholder,
  required = false,
}: TextareaFieldProps<T>) {
  const form = useFormContext<T>();

  if (isLoading) {
    return (
      <PositionedItem className="py-2">
        <Skeleton className="h-24 w-full" />
      </PositionedItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <Field>
          <PositionedItem
            className="p-3 flex items-center justify-between w-full h-fit"
          >
            <span className="text-sm font-medium w-36">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </span>
            <div className="w-full ml-10 flex flex-col gap-1">
              <AutosizeTextarea
                {...field}
                placeholder={placeholder}
                className="min-h-6 p-0 text-sm font-medium h-fit border-none rounded-sm bg-transparent dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none w-full text-right resize-none"
                rows={rows}
                value={field.value || ""}
                required={required}
              />
            </div>
          </PositionedItem>
        </Field>
      )}
    />
  );
}