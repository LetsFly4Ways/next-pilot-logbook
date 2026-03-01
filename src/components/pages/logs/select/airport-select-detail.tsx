"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getAirportByIcao } from "@/actions/pages/airports/fetch";

import { Airport, Runway } from "@/types/airports";

import { PageHeader } from "@/components/layout/page-header";
import { PositionedGroup } from "@/components/ui/positioned-group";

import { Button } from "@/components/ui/button";
import {
  writeFlightFormSelection,
  airportToSelectedAirport,
} from "@/components/pages/logs/select/flight-form-selection";
import { readSelectContext, clearSelectContext, writeSelectContext } from "@/components/pages/logs/select/select-context";

import RunwaySelectRow, { RunwaySelectRowSkeleton } from "@/components/pages/logs/select/runway-select-item";
import { AirportHeader, AirportHeaderSkeleton } from "@/components/pages/airports/airport-header";
import { Separator } from "@/components/ui/separator";

export default function AirportSelectDetail({ params }: { params: { type: string; role?: string; icao: string } }) {
  const router = useRouter();
  const icao = params?.icao ?? "";

  const [airport, setAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // role now comes from the route parameter; default to departure for safety
  const role: "departure" | "destination" =
    params.role === "destination" ? "destination" : "departure";

  const [returnHref] = useState<string>(() => {
    const context = readSelectContext("flight");
    return context?.return ?? "/app/logs/flight/new";
  });

  const [selectedRunway, setSelectedRunway] = useState<string | null>(() => {
    const context = readSelectContext("flight");
    return context?.runway ?? null;
  });

  // Back button always goes to airport-select-list for the same role
  const backHref = `/app/logs/flight/airport-select/${role}`;

  useEffect(() => {
    let cancelled = false;
    getAirportByIcao(icao).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setAirport(result.data);
      } else {
        setError(result.error ?? "Failed to load airport");
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [icao]);

  const handleSelect = () => {
    if (!airport) return;
    const selectedAirport = airportToSelectedAirport(airport);
    if (role === "departure") {
      writeFlightFormSelection({
        type: "departure_airport",
        payload: { airport: selectedAirport, runway: selectedRunway },
      });
    } else {
      writeFlightFormSelection({
        type: "destination_airport",
        payload: { airport: selectedAirport, runway: selectedRunway },
      });
    }
    clearSelectContext("flight");
    router.push(returnHref);
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title={icao.toUpperCase()}
          backHref={backHref}
          showBackButton
          isTopLevelPage={false}
        />
        <div className="p-4 md:p-6 space-y-4">
          <AirportHeaderSkeleton />

          <Separator />

          <RunwaySelectRowSkeleton />
        </div>
      </div>
    );
  }

  if (error || !airport) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title={icao.toUpperCase()}
          backHref={backHref}
          showBackButton
          isTopLevelPage={false}
        />
        <div className="p-4 md:p-6 text-destructive">
          {error ?? "Airport not found"}
        </div>
      </div>
    );
  }

  const runways: Runway[] = airport.runways ?? [];
  const title = airport.name || airport.icao;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={title}
        backHref={backHref}
        showBackButton
        isTopLevelPage={false}
        actionButton={
          <Button
            variant="default"
            size="sm"
            className="font-medium cursor-pointer"
            onClick={handleSelect}
          >
            Select
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        <AirportHeader airport={airport} />

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Runway (optional)
          </h3>
          {runways.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No runway data available. You can still select this airport.
            </p>
          ) : (
            <PositionedGroup>
              {runways.map((rw) => (
                <RunwaySelectRow
                  key={rw.ident}
                  runway={rw}
                  selected={selectedRunway === rw.ident}
                  onSelect={() => {
                    const newRunway = selectedRunway === rw.ident ? null : rw.ident;
                    setSelectedRunway(newRunway);
                    // Update context so runway selection persists
                    const context = readSelectContext("flight");
                    if (context) {
                      writeSelectContext(
                        {
                          ...context,
                          runway: newRunway,
                        },
                        "flight"
                      );
                    }
                  }}
                />
              ))}
            </PositionedGroup>
          )}
        </div>

        <div className="w-full flex justify-center">
          <span className="text-sm text-muted-foreground">
            Found a mistake?{" "}
            <Link
              target="_blank"
              href={`https://github.com/LetsFly4Ways/next-pilot-logbook/issues/new?template=airport-data-issues.md&title=[AIRPORT]+${airport.icao}+airport+data+issue`}
              className="underline"
            >
              Create a ticket!
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

