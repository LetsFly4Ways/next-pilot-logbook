"use client";

import { useEffect, useState } from "react";

import { FieldValues, Path, PathValue, useFormContext } from "react-hook-form";
import { calculateNightTime } from "@/lib/night-time-utils";
import { formatTime, timeToMinutes } from "@/lib/time-utils";

import { SelectedAirport } from "@/types/logs";


import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/ui/form-field";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NightTimeDurationInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  isLoading?: boolean;
  required?: boolean;

  // Fields needed for calculation
  dateField: Path<T>;
  flightStartField: Path<T>;
  flightEndField: Path<T>;
  departureAirportField: Path<T>;
  destinationAirportField: Path<T>;
}

export function NightTimeDurationInputField<T extends FieldValues>({
  name,
  label,
  isLoading,
  required = false,
  dateField,
  flightStartField,
  flightEndField,
  departureAirportField,
  destinationAirportField,
}: NightTimeDurationInputProps<T>) {
  const form = useFormContext<T>();

  const [isFocused, setIsFocused] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedNightMinutes, setCalculatedNightMinutes] = useState<number | null>(null);

  // Watch required fields
  const date = form.watch(dateField) as Date | null;
  const flightStart = form.watch(flightStartField) as string | null;
  const flightEnd = form.watch(flightEndField) as string | null;
  const departureAirport = form.watch(departureAirportField) as SelectedAirport | null;
  const destinationAirport = form.watch(destinationAirportField) as SelectedAirport | null;
  const currentValue = form.watch(name) as number;

  // Calculate night time when dependencies change
  useEffect(() => {
    async function calculateNight() {
      if (!date || !flightStart || !flightEnd || !departureAirport || !destinationAirport) {
        setCalculatedNightMinutes(null);
        return;
      }

      setIsCalculating(true);
      try {
        const nightMinutes = await calculateNightTime(
          date,
          flightStart,
          flightEnd,
          departureAirport,
          destinationAirport
        );

        setCalculatedNightMinutes(nightMinutes);
      } catch (error) {
        console.error("Error calculating night time:", error);
        setCalculatedNightMinutes(null);
      } finally {
        setIsCalculating(false);
      }
    }

    calculateNight();
  }, [date, flightStart, flightEnd, departureAirport, destinationAirport]);

  // Show button only if: calculation is complete, has value, field is 0, and field is NOT focused
  const shouldShowButton =
    calculatedNightMinutes !== null &&
    calculatedNightMinutes > 0 &&
    (!currentValue || currentValue === 0) &&
    !isFocused &&
    !isCalculating;

  const handleSetFromCalculation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (calculatedNightMinutes !== null) {
      form.setValue(name, calculatedNightMinutes as PathValue<T, Path<T>>, { shouldValidate: true });
    }
  };

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
          <PositionedItem className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium w-36">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </span>
            <div className="flex flex-col items-center gap-x-3 gap-y-1">
              {shouldShowButton ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSetFromCalculation}
                  className="h-fit py-1 px-3 text-sm hover:bg-background/30 cursor-pointer"
                  disabled={isCalculating}
                >
                  {isCalculating ? "..." : `+${formatTime(calculatedNightMinutes!, "HH:mm")}`}
                </Button>
              ) : (
                <>
                  <Input
                    type="time"
                    value={formatTime(field.value ?? 0, "HH:mm", { showZero: true })}
                    required={required}
                    className="w-full h-fit px-3 py-1 border-none dark:bg-transparent focus-visible:border-none focus-visible:ring-0 shadow-none justify-items-end text-right text-sm cursor-pointer min-w-16 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    onChange={(e) => {
                      const minutes = timeToMinutes(e.target.value);
                      field.onChange(minutes);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setIsFocused(false);
                      field.onBlur();
                    }}
                    disabled={isLoading || isCalculating}
                  />
                  {fieldState.error && (
                    <span className="text-xs text-red-500 mt-1">
                      {fieldState.error.message}
                    </span>
                  )}
                  {isCalculating && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Calculating...
                    </span>
                  )}
                </>
              )}
            </div>
          </PositionedItem>
        </Field>
      )}
    />
  );
}