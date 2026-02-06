import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Input } from "@/components/ui/input";
import { FieldError, FieldErrors, FieldValues } from "react-hook-form";

type InputType = "time" | "number";

interface TimeTableField {
  label: string;
  offKey: string;
  onKey: string;
  required?: boolean;
  visible?: boolean;
  inputType?: InputType;
  placeholder?: string;
  step?: string;
  min?: number;
}

interface TimeTableProps<T extends FieldValues> {
  fields: TimeTableField[];
  values: T;
  onChange: (key: string, value: string) => void;
  errors?: FieldErrors<T>;
}

export default function TimeTable<T extends FieldValues>({
  fields,
  values,
  onChange,
  errors
}: TimeTableProps<T>) {
  // Filter to only show visible fields
  const visibleFields = fields.filter(field => field.visible !== false);

  const renderInput = (field: TimeTableField, key: string) => {
    const inputType = field.inputType || "time";
    const value = values[key as keyof T];
    const error = errors?.[key as keyof T] as FieldError | undefined;

    const baseClasses = "min-w-16 w-fit h-fit justify-center text-center rounded-md border-transparent px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 shadow-none bg-background appearance-none";

    const timeClasses = `${baseClasses} [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`;
    const numberClasses = `${baseClasses} w-20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

    return (
      <div className="flex flex-col items-center ">
        <Input
          type={inputType}
          step={inputType === "time" ? "0" : field.step}
          min={field.min}
          value={value ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          className={inputType === "time" ? timeClasses : numberClasses}
        />
        {error && (
          <span className="text-xs text-red-500 mt-1">{error.message}</span>
        )}
      </div>
    );
  };

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

          {renderInput(field, field.offKey)}
          {renderInput(field, field.onKey)}
        </PositionedItem>
      ))}
    </PositionedGroup>
  );
}