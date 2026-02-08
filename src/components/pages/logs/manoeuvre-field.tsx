"use client";

import { useEffect, useRef, useState } from "react";

import { FieldValues, Path, PathValue, useFormContext, useWatch } from "react-hook-form";

import { SelectedAirport } from "@/types/logs";

import { isLandingAtNight, isTakeoffAtNight } from "@/lib/night-time-utils";

import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManoeuvreInput } from "@/components/pages/logs/manoeuvre-input";

type TimeOfDay = "day" | "night";

interface ManoeuvresFieldProps<T extends FieldValues> {
  dayTakeoffsField: Path<T>;
  nightTakeoffsField: Path<T>;
  dayLandingsField: Path<T>;
  nightLandingsField: Path<T>;
  isLoading?: boolean;

  // For automatic night detection
  dateField: Path<T>;
  flightStartField: Path<T>;
  flightEndField: Path<T>;
  departureAirportField: Path<T>;
  destinationAirportField: Path<T>;
}

export function ManoeuvresField<T extends FieldValues>({
  dayTakeoffsField,
  nightTakeoffsField,
  dayLandingsField,
  nightLandingsField,
  isLoading = false,
  dateField,
  flightStartField,
  flightEndField,
  departureAirportField,
  destinationAirportField,
}: ManoeuvresFieldProps<T>) {
  const form = useFormContext<T>();

  const hasInitialized = useRef(false);
  const hasAutoDetected = useRef(false);

  const [activeTab, setActiveTab] = useState<TimeOfDay>("day");
  const [isDetecting, setIsDetecting] = useState(false);

  // Watch all values to determine initial tab
  const dayTakeoff = useWatch({ name: dayTakeoffsField }) as number;
  const nightTakeoff = useWatch({ name: nightTakeoffsField }) as number;
  const dayLanding = useWatch({ name: dayLandingsField }) as number;
  const nightLanding = useWatch({ name: nightLandingsField }) as number;

  // Watch required fields
  const date = useWatch({ name: dateField }) as Date | null;
  const flightStart = useWatch({ name: flightStartField }) as string | null;
  const flightEnd = useWatch({ name: flightEndField }) as string | null;
  const departureAirport = useWatch({ name: departureAirportField }) as SelectedAirport | null;
  const destinationAirport = useWatch({ name: destinationAirportField }) as SelectedAirport | null;

  // Calculate total for each time of day
  const dayTotal = (dayTakeoff || 0) + (dayLanding || 0);
  const nightTotal = (nightTakeoff || 0) + (nightLanding || 0);

  // Determine initial active tab based on which has data
  useEffect(() => {
    if (hasInitialized.current) return;

    if (nightTotal > 0 && dayTotal === 0) {
      setActiveTab("night");
    } else if (dayTotal > 0 && nightTotal === 0) {
      setActiveTab("day");
    } else if (nightTotal > 0 && dayTotal > 0) {
      // Both have data, stay on current tab or default to day
      setActiveTab("day");
    }

    hasInitialized.current = true;
  }, [dayTotal, nightTotal]); // Only run on mount

  // Auto-detect night takeoffs and landings
  useEffect(() => {
    if (hasAutoDetected.current) return;

    if (
      date == null ||
      flightStart == null ||
      flightEnd == null ||
      flightStart === "" ||
      flightEnd === "" ||
      !departureAirport ||
      !destinationAirport
    ) {
      return;
    }

    // Don't auto-detect if user has manually entered values
    if (dayTakeoff > 0 || nightTakeoff > 0 || dayLanding > 0 || nightLanding > 0) {
      return;
    }

    hasInitialized.current = true;

    const detectNightManoeuvres = async () => {
      setIsDetecting(true);
      try {
        const [isTakeoffNight, isLandingNight] = await Promise.all([
          isTakeoffAtNight(date, flightStart, departureAirport),
          isLandingAtNight(date, flightEnd, destinationAirport),
        ]);

        hasAutoDetected.current = true;

        // Set values based on detection
        if (isTakeoffNight) {
          form.setValue(nightTakeoffsField, 1 as PathValue<T, typeof nightTakeoffsField>);
          form.setValue(dayTakeoffsField, 0 as PathValue<T, typeof dayTakeoffsField>);
        } else {
          form.setValue(dayTakeoffsField, 1 as PathValue<T, typeof dayTakeoffsField>);
          form.setValue(nightTakeoffsField, 0 as PathValue<T, typeof nightTakeoffsField>);
        };

        if (isLandingNight) {
          form.setValue(nightLandingsField, 1 as PathValue<T, typeof nightLandingsField>);
          form.setValue(dayLandingsField, 0 as PathValue<T, typeof dayLandingsField>);
        } else {
          form.setValue(dayLandingsField, 1 as PathValue<T, typeof dayLandingsField>);
          form.setValue(nightLandingsField, 0 as PathValue<T, typeof nightLandingsField>);
        };

        // Set active tab based on what was detected
        if (isTakeoffNight || isLandingNight) {
          setActiveTab("night");
        } else {
          setActiveTab("day");
        };
      } catch (error) {
        console.error("Error detecting night manoeuvres:", error);
      } finally {
        setIsDetecting(false);
      }
    };

    detectNightManoeuvres()
  }, [date, flightStart, flightEnd, departureAirport, destinationAirport, dayTakeoff, nightTakeoff, dayLanding, nightLanding, form, nightTakeoffsField, dayTakeoffsField, nightLandingsField, dayLandingsField]);


  if (isLoading || isDetecting) {
    return (
      <PositionedGroup>
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </PositionedGroup>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimeOfDay)}>
      <PositionedGroup>
        {/* Tabs switcher */}
        <PositionedItem className="w-full px-3 py-2 h-fit hover:bg-form">
          <TabsList className="w-full">
            <TabsTrigger value="day" className="flex-1">
              Day ({dayTotal})
            </TabsTrigger>
            <TabsTrigger value="night" className="flex-1">
              Night ({nightTotal})
            </TabsTrigger>
          </TabsList>
        </PositionedItem>

        {/* Day */}
        <TabsContent value="day" className="divide-y divide-y-form-border border-b-0">
          <ManoeuvreInput label="Takeoff" name={dayTakeoffsField} />
          <ManoeuvreInput label="Landing" name={dayLandingsField} />
        </TabsContent>

        {/* Night */}
        <TabsContent value="night" className="divide-y divide-y-form-border border-b-0">
          <ManoeuvreInput label="Takeoff" name={nightTakeoffsField} />
          <ManoeuvreInput label="Landing" name={nightLandingsField} />
        </TabsContent>
      </PositionedGroup>
    </Tabs>
  )
}