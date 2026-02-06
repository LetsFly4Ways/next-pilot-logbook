import { TimeInput } from "@/components/ui/form-field-types";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { FieldValues, Path } from "react-hook-form";


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