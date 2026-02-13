import { Field } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { FieldValues, Path, useFormContext } from "react-hook-form";

type InputType = "time" | "number";

export interface TimeTableField<T extends FieldValues> {
  label: string;
  offKey: Path<T>;
  onKey: Path<T>;
  required?: boolean;
  visible?: boolean;
  inputType?: InputType;
  placeholder?: string;
  step?: string;
  min?: number;
}

interface TimeTableProps<T extends FieldValues> {
  fields: TimeTableField<T>[];
  isLoading?: boolean;
}

interface TimeInputProps<T extends FieldValues> {
  name: Path<T>;
  type?: InputType;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: number;
}

export function TimeInput<T extends FieldValues>({
  name,
  type = "time",
  required = false,
  placeholder,
  step,
  min,
}: TimeInputProps<T>) {
  const form = useFormContext<T>();

  const baseClasses = "flex h-fit justify-center text-center rounded-md border-transparent px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 shadow-none bg-form-border/25 dark:bg-background appearance-none";

  const timeClasses = `${baseClasses} min-w-20 w-fit [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`;
  const numberClasses = `${baseClasses} w-20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <div className="flex flex-col items-center">
            <Input
              {...field}
              type={type}
              step={type === "time" ? "0" : step}
              min={min}
              value={field.value ?? ''}
              required={required}
              placeholder={placeholder}
              className={type === "time" ? timeClasses : numberClasses}
              onChange={(e) => {
                const newValue = type === "number" && e.target.value !== ""
                  ? parseFloat(e.target.value)
                  : e.target.value;
                field.onChange(newValue);
              }}
            />
            {fieldState.error && (
              <span className="text-xs text-red-500 mt-1">
                {fieldState.error.message}
              </span>
            )}
          </div>
        </Field>
      )}
    />
  );
}

export default function TimeTable<T extends FieldValues>({
  fields,
  isLoading = false,
}: TimeTableProps<T>) {
  // Filter to only show visible fields
  const visibleFields = fields.filter(field => field.visible !== false);

  if (isLoading) {
    return (
      <PositionedGroup>
        <PositionedItem className="p-3 h-14">
          <div className="h-12 w-full bg-muted animate-pulse rounded" />
        </PositionedItem>
      </PositionedGroup>
    );
  }

  return (
    <PositionedGroup>
      {/* Header */}
      <PositionedItem className="p-3 grid grid-cols-3 gap-x-4 items-center">
        <div></div>
        <div className="flex justify-center">
          <span className="text-sm font-semibold text-center">OFF</span>
        </div>
        <div className="flex justify-center">
          <span className="text-sm font-semibold text-center">ON</span>
        </div>
      </PositionedItem>

      {/* Content Rows */}
      {visibleFields.map((field) => (
        <PositionedItem
          key={field.label}
          className="p-3 grid grid-cols-3 gap-x-4 items-center h-14"
        >
          <div className="flex justify-start">
            <span className="text-sm font-semibold text-center">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>

          <TimeInput<T>
            name={field.offKey}
            type={field.inputType}
            required={field.required}
            placeholder={field.placeholder}
            step={field.step}
            min={field.min}
          />

          <TimeInput<T>
            name={field.onKey}
            type={field.inputType}
            required={field.required}
            placeholder={field.placeholder}
            step={field.step}
            min={field.min}
          />
        </PositionedItem>
      ))}
    </PositionedGroup>
  );
}