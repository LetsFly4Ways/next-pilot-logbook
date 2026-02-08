import { FieldValues, Path, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";

import { Minus, Plus } from "lucide-react";

interface ManoeuvreInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  isLoading?: boolean;
}

export function ManoeuvreInput<T extends FieldValues>({
  label,
  name,
  isLoading
}: ManoeuvreInputProps<T>) {
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
      render={({ field, fieldState }) => {
        // Get current value, default to 0 if undefined
        const currentValue = field.value ?? 0;

        const handleDecrement = () => {
          if (currentValue > 0) {
            const newValue = currentValue - 1;
            field.onChange(newValue)
          }
        };

        const handleIncrement = () => {
          if (currentValue < 99) {
            const newValue = currentValue + 1;
            field.onChange(newValue);
          }
        };

        return (
          <Field>
            <PositionedItem className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium w-36">
                {label}
              </span>

              <div className="flex items-center gap-3">
                {/* Input & Field State */}
                <div className="flex flex-col gap-1">
                  <Input
                    {...field}
                    type="number"
                    value={currentValue}
                    min={0}
                    className="h-fit py-0 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none text-right text-sm"
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 0
                          : parseInt(e.target.value)
                      field.onChange(value);
                    }}
                  />

                  {fieldState.error && (
                    <span className="text-right text-xs text-red-500 mt-1">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="inline-flex items-stretch rounded-xl border border-form-border shadow-sm overflow-hidden shrink-0">
                  {/* Decrement Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDecrement}
                    disabled={currentValue <= 0}
                    className="border-none rounded-none px-4 py-1 transition-colors disabled:opacity-50 active:scale-95 cursor-pointer hover:bg-background/30"
                    aria-label="Decrease value"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  {/* Vertical Separator */}
                  <div className="w-px bg-form-border" />

                  {/* Increment Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleIncrement}
                    disabled={currentValue >= 99}
                    className="border-none rounded-none px-4 py-1 transition-colors disabled:opacity-50 active:scale-95 cursor-pointer hover:bg-background/30"
                    aria-label="Increase value"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PositionedItem>
          </Field>
        )
      }}
    />
  )
}