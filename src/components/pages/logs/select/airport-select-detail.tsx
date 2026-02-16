"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { getAirportByIcao } from "@/actions/pages/airports/fetch";
import { PageHeader } from "@/components/layout/page-header";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  writeFlightFormSelection,
  airportToSelectedAirport,
} from "@/components/pages/logs/select/flight-form-selection";
import { readSelectContext, clearSelectContext, writeSelectContext } from "@/components/pages/logs/select/select-context";
import { Airport, Runway } from "@/types/airports";
import { Check } from "lucide-react";

export default function AirportSelectDetail() {
  const router = useRouter();
  const params = useParams();
  const icao = (params?.icao as string) ?? "";
  
  const [airport, setAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"departure" | "destination">("departure");
  const [returnHref, setReturnHref] = useState<string>("/app/logs/flight/new");
  const [selectedRunway, setSelectedRunway] = useState<string | null>(null);

  useEffect(() => {
    const context = readSelectContext();
    if (context) {
      setRole(context.role ?? "departure");
      setReturnHref(context.return ?? "/app/logs/flight/new");
      setSelectedRunway(context.runway ?? null);
    }
  }, []);

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
    clearSelectContext();
    router.push(returnHref);
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title={icao.toUpperCase()}
          backHref={returnHref}
          showBackButton
          isTopLevelPage={false}
        />
        <div className="p-4 md:p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <PositionedGroup>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </PositionedGroup>
        </div>
      </div>
    );
  }

  if (error || !airport) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title={icao.toUpperCase()}
          backHref={returnHref}
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
        backHref={returnHref}
        showBackButton
        isTopLevelPage={false}
        actionButton={
          <Button
            variant="default"
            size="sm"
            className="font-medium"
            onClick={handleSelect}
          >
            Select
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {airport.icao}
            {airport.iata ? ` / ${airport.iata}` : ""} · {airport.city},{" "}
            {airport.countryName}
          </p>
        </div>

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
                <RunwayRow
                  key={rw.ident}
                  ident={rw.ident}
                  heading={rw.heading}
                  selected={selectedRunway === rw.ident}
                  onSelect={() => {
                    const newRunway = selectedRunway === rw.ident ? null : rw.ident;
                    setSelectedRunway(newRunway);
                    // Update context so runway selection persists
                    const context = readSelectContext();
                    if (context) {
                      writeSelectContext({
                        ...context,
                        runway: newRunway,
                      });
                    }
                  }}
                />
              ))}
            </PositionedGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function RunwayRow({
  ident,
  heading,
  selected,
  onSelect,
}: {
  ident: string;
  heading: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <PositionedItem
      role="button"
      className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer hover:bg-muted/50"
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium">{ident}</span>
        <span className="text-sm text-muted-foreground">{heading}°</span>
      </div>
      {selected ? (
        <Check className="w-4 h-4 text-primary shrink-0" />
      ) : null}
    </PositionedItem>
  );
}
