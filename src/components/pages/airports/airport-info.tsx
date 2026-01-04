"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Airport } from "@/types/airports";
import { getAirportByIcao } from "@/actions/pages/airports/fetch";
import {
  AirportVisit,
  getAirportVisits,
} from "@/actions/pages/airports/airport-visits";

import { PageHeader } from "@/components/layout/page-header";
import AirportDetails from "@/components/pages/airports/details";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { ErrorAlert } from "@/components/pages/airports/error-alert";

import { ChevronRight } from "lucide-react";

export default function AirportInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [airport, setAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [icaoCode, setIcaoCode] = useState<string>("");
  const [visits, setVisits] = useState<AirportVisit | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadAirport = async () => {
      try {
        setLoading(true);

        // Await params to get the ICAO code
        const resolvedParams = await params;
        const icao = resolvedParams.id.toUpperCase(); // Ensure uppercase
        setIcaoCode(icao);

        // Fetch airport data and visits data in parallel
        const [airportData, visitsData] = await Promise.all([
          getAirportByIcao(icao),
          getAirportVisits(icao),
        ]);

        // TEMPORARY
        console.log(visitsData);

        setAirport(airportData as Airport | null);
        setVisits(visitsData);
      } catch (error) {
        console.error("Error fetching airport:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadAirport();
  }, [params]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={airport?.name || icaoCode}
        backHref="/app/airports"
        showBackButton={true}
        isTopLevelPage={false}
      />
      <div className="p-4 space-y-4">
        {/* Errors Alert display */}
        {error && (
          <ErrorAlert
            title="Looks like we have an error."
            message={<p>{error}</p>}
          />
        )}

        {/* Airport Information */}
        <AirportDetails airport={airport} loading={loading} />

        {/* Visits */}
        <div>
          <PositionedGroup>
            <PositionedItem
              position="first"
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() =>
                router.push(`/app/airports/${icaoCode}/departures`)
              }
            >
              <span className="text-sm font-medium text-foreground">
                Departures
              </span>
              <div className="flex space-x-2 items-center">
                <span className="text-sm text-muted-foreground">
                  {visits?.departures || 0}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </PositionedItem>
            <PositionedItem
              position="last"
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/app/airports/${icaoCode}/arrivals`)}
            >
              <span className="text-sm font-medium text-foreground">
                Arrivals
              </span>
              <div className="flex space-x-2 items-center">
                <span className="text-sm text-muted-foreground">
                  {visits?.arrivals || 0}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </PositionedItem>
          </PositionedGroup>
        </div>
        {/* Footer */}
        {/* In case of incorrect information bla bla bla */}
      </div>
    </div>
  );
}
