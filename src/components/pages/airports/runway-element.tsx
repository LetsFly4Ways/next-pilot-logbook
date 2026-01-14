"use client";

import { usePreferences } from "@/components/context/preferences-provider";

interface RunwayElementProps {
  designatorLeading: string;
  designatorTrailing: string;
  width: number | null;
  length: number | null;
  surfaceType: string | null;
  lighted: boolean;
}

export default function RunwayElement({
  designatorLeading,
  designatorTrailing,
  width,
  length,
  surfaceType,
  lighted = false,
}: RunwayElementProps) {
  const { preferences, updatePreference } = usePreferences();
  const unit = preferences.airports?.distanceUnit || "m";

  // Convert feet to meters and vice versa
  const convertUnit = (
    value: number | null,
    toMetric: boolean
  ): number | null => {
    if (value === null) return null;
    if (toMetric) {
      // Feet to meters
      return Math.round(value * 0.3048);
    } else {
      // Meters to feet
      return Math.round(value / 0.3048);
    }
  };

  // Get display values based on selected unit
  const displayLength = unit === "m" ? convertUnit(length, true) : length;
  const displayWidth = unit === "m" ? convertUnit(width, true) : width;

  const handleUnitToggle = async () => {
    const newUnit = unit === "m" ? "ft" : "m";
    // Ensure we always pass valid values
    const currentAirports = preferences.airports || {
      sorting: "icao",
      distanceUnit: "m",
    };
    // Validate and sanitize the distanceUnit value
    const validUnit = newUnit === "m" || newUnit === "ft" ? newUnit : "m";

    try {
      await updatePreference("airports", {
        sorting: currentAirports.sorting || "icao",
        distanceUnit: validUnit,
      });
    } catch (error) {
      console.error("Failed to update runway unit preference:", error);
    }
  };

  const centerlinePattern = lighted
    ? [
        "dash",
        "light",
        "dash",
        "light",
        "dash",
        "light",
        "dash",
        "light",
        "dash",
      ]
    : ["dash", "dash", "dash", "dash", "dash"];

  return (
    <div className="flex items-center gap-4 w-full max-w-3xl">
      {/* Fixed width container for leading designator */}
      <div className="flex items-center justify-end w-12 shrink-0">
        <span className="text-lg font-bold tabular-nums">
          {designatorLeading}
        </span>
      </div>

      <div className="flex-1 bg-linear-to-b from-gray-600 via-gray-700 to-gray-600 rounded-sm py-2 px-8 flex items-center justify-center relative shadow-lg border-y-2 border-gray-800">
        {/* Left threshold markings */}
        <div className="absolute left-3 flex flex-col gap-[8px]">
          <div className="w-5 h-[3px] bg-white" />
          <div className="w-5 h-[3px] bg-white" />
          <div className="w-5 h-[3px] bg-white" />
          <div className="w-5 h-[3px] bg-white" />
        </div>

        {/* Centerline dashes */}
        <div className="absolute inset-0 flex items-center justify-between gap-12 px-20">
          {centerlinePattern.map((type, i) =>
            type === "dash" ? (
              <div key={i} className="w-8 h-[4px] bg-white" />
            ) : (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
              />
            )
          )}
        </div>

        {/* Runway dimensions text - Clickable to toggle units */}
        <button
          onClick={handleUnitToggle}
          className="text-white font-bold text-sm tracking-wide z-10 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors cursor-pointer"
          title={`Click to switch to ${unit === "m" ? "feet" : "meters"}`}
        >
          {displayLength || "???"} × {displayWidth || "??"} {unit} |{" "}
          {surfaceType || "???"}
        </button>

        {/* Right threshold markings */}
        <div className="absolute right-3 flex flex-col gap-[8px]">
          <div className="w-5 h-[3px] bg-white" />
          <div className="w-5 h-[3px] bg-white" />
          <div className="w-5 h-[3px] bg-white" />
          <div className="w-5 h-[3px] bg-white" />
        </div>
      </div>

      {/* Fixed width container for trailing designator */}
      <div className="flex items-center justify-start w-12 shrink-0">
        <span className="text-lg font-bold tabular-nums">
          {designatorTrailing}
        </span>
      </div>
    </div>
  );
}
