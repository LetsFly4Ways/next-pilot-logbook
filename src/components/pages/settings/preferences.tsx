"use client";

import { AIRPORT_SORTING_LABELS, DISTANCE_UNIT_LABELS, DistanceUnit, SortAirportBy } from "@/types/airports";
import { FleetGroupBy, GROUP_BY_LABELS } from "@/types/fleet";
import { functionOptions, LOGGING_FIELD_LABELS, PilotFunction } from "@/types/logs";
import { UserPreferences } from "@/types/user-preferences";

import { usePreferences } from "@/components/context/preferences-provider";
import { PageHeader } from "@/components/layout/page-header";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

import { ChevronsUpDown } from "lucide-react";

export default function PreferencesPage() {
  const { preferences, updatePreferences, isLoading } = usePreferences();

  const handleFunctionChange = async (value: PilotFunction) => {
    await updatePreferences({
      logging: {
        ...preferences.logging,
        defaultFunction: value,
      },
    });
  };

  // Helper for toggles
  const handleToggle = async (
    field: keyof UserPreferences["logging"]["fields"],
    value: boolean
  ) => {
    await updatePreferences({
      logging: {
        ...preferences.logging,
        fields: {
          ...preferences.logging?.fields,
          [field]: value,
        },
      },
    });
  };

  const handleFleetGroupChange = async (value: FleetGroupBy) => {
    await updatePreferences({
      fleet: {
        ...preferences.fleet,
        grouping: value,
      },
    });
  };

  const handleAirportUpdate = async (update: Partial<UserPreferences["airports"]>) => {
    await updatePreferences({
      airports: {
        ...preferences.airports,
        ...update,
      },
    });
  };

  if (isLoading) return <PreferencesSkeleton />

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Preferences"
        backHref="/app/settings"
        showBackButton
      />

      <div className="flex-1 p-4 md:p-6 space-y-8 animate-in fade-in">
        {/* Logging */}
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Logging
          </h2>

          <PositionedGroup>
            <PositionedItem className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Default Pilot Function</span>
              <div className="relative flex items-center">
                <select
                  value={preferences.logging?.defaultFunction || ""}
                  onChange={(e) => handleFunctionChange(e.target.value as PilotFunction)}
                  className="appearance-none bg-transparent text-sm pr-5 border-none focus:ring-0 cursor-pointer text-right outline-none"
                >
                  <option value="" disabled>Select</option>
                  {functionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-0 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </PositionedItem>

            {(Object.entries(LOGGING_FIELD_LABELS) as [keyof UserPreferences["logging"]["fields"], string][]).map(
              ([key, label]) => (
                <PositionedItem key={key} className="p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <Switch
                    className="cursor-pointer mr-2 h-6 w-11 data-[state=checked]:bg-green-500"
                    thumbClassName="h-5 w-5 data-[state=checked]:translate-x-5"
                    checked={preferences.logging?.fields?.[key] ?? false}
                    onCheckedChange={(checked) => handleToggle(key, checked)}
                  />
                </PositionedItem>
              )
            )}
          </PositionedGroup>

          <p className="px-3 text-sm text-muted-foreground leading-relaxed">
            Customize your logging experience by hiding fields you don&apos;t use.
            Hidden fields won&apos;t appear in new entries but your data remains safe in the database.
          </p>
        </section>

        {/* Crew */}
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Crew
          </h2>

          <PositionedGroup>
            <PositionedItem className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Name Display Order</span>
              <div className="relative flex items-center">
                <select
                  className="appearance-none bg-transparent text-sm pr-5 border-none focus:ring-0 cursor-pointer text-right outline-none"
                  value={preferences.nameDisplay || "last-first"}
                  onChange={(e) =>
                    updatePreferences({
                      nameDisplay: e.target.value as UserPreferences["nameDisplay"]
                    })
                  }
                >
                  <option value="first-last">First Last</option>
                  <option value="last-first">Last, First</option>
                </select>
                <ChevronsUpDown className="absolute right-0 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </PositionedItem>
          </PositionedGroup>

          <p className="px-3 text-sm text-muted-foreground leading-relaxed">
            Adjust how pilot and crew names are displayed across your logbook.
            Last Name first is the standard format for official flight records and manifests.
          </p>
        </section>

        {/* Fleet */}
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Fleet
          </h2>

          <PositionedGroup>
            <PositionedItem className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Group Fleet By</span>
              <div className="relative flex items-center">
                <select
                  className="appearance-none bg-transparent text-sm pr-5 border-none focus:ring-0 cursor-pointer text-right outline-none"
                  value={preferences.fleet?.grouping || "type"}
                  onChange={(e) => handleFleetGroupChange(e.target.value as FleetGroupBy)}
                >
                  {Object.entries(GROUP_BY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-0 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </PositionedItem>
          </PositionedGroup>

          <p className="px-3 text-sm text-muted-foreground leading-relaxed">
            Choose how your airframes are organized in the fleet list. Grouping by ICAO Type
            (e.g., B738) is recommended for easier searching within large fleets.
          </p>
        </section>

        {/* Airports */}
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Airports
          </h2>
          <PositionedGroup>
            {/* Sorting Dropdown */}
            <PositionedItem className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Primary Sorting</span>
              <div className="relative flex items-center">
                <select
                  className="appearance-none bg-transparent text-sm pr-5 border-none focus:ring-0 cursor-pointer text-right outline-none"
                  value={preferences.airports?.sorting}
                  onChange={(e) => handleAirportUpdate({ sorting: e.target.value as SortAirportBy })}
                >
                  {Object.entries(AIRPORT_SORTING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-0 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </PositionedItem>

            {/* Distance Unit Dropdown */}
            <PositionedItem className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Distance Units</span>
              <div className="relative flex items-center">
                <select
                  className="appearance-none bg-transparent text-sm pr-5 border-none focus:ring-0 cursor-pointer text-right outline-none"
                  value={preferences.airports?.distanceUnit}
                  onChange={(e) => handleAirportUpdate({ distanceUnit: e.target.value as DistanceUnit })}
                >
                  {Object.entries(DISTANCE_UNIT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronsUpDown className="absolute right-0 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
              </div>
            </PositionedItem>
          </PositionedGroup>

          <p className="px-3 text-sm text-muted-foreground leading-relaxed">
            Choose how airports are displayed in your search results and log entries.
            ICAO codes are standard for flight planning, while IATA is common for airline operations.
          </p>
        </section>
      </div>
    </div>
  )
}

export function PreferencesSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Header Skeleton */}
      <PageHeader title="General" backHref="/app/settings" showBackButton />

      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-8">

        {/* Repeating Section Pattern */}
        {[1, 2, 3, 4].map((section) => (
          <div key={section} className="space-y-3">
            {/* Section Title Skeleton */}
            <div className="px-1">
              <Skeleton className="h-4 w-24" />
            </div>

            <PositionedGroup>
              {/* Render 1 to 3 items per group to look natural */}
              {[...Array(section === 1 ? 4 : 1)].map((_, i) => (
                <PositionedItem key={i} className="p-3 flex items-center justify-between">
                  <Skeleton className="h-4 w-32" /> {/* Label */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-10 rounded-full" /> {/* Switch or Select UI */}
                  </div>
                </PositionedItem>
              ))}
            </PositionedGroup>

            {/* Footer Note Skeleton */}
            <div className="px-1 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}