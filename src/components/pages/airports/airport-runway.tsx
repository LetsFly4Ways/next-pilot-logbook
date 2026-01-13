import { Runway } from "@/types/airports";

import RunwayElement from "@/components/pages/airports/runway-element";
import { Skeleton } from "@/components/ui/skeleton";

interface AirportRunwaysProps {
  runways: Runway[];
}

export function AirportRunways({ runways }: AirportRunwaysProps) {
  if (!runways || runways.length === 0) {
    return (
      <div className="border-y py-4">
        <div className="text-center text-muted-foreground">
          No runway data available
        </div>
      </div>
    );
  }

  // Group runways by their base identifier (e.g., "09L/27R" becomes one pair)
  const runwayPairs = new Map<string, Runway[]>();

  runways.forEach((runway) => {
    const baseIdent = runway.ident.replace(/[LRC]$/, "");
    const reciprocal = ((parseInt(baseIdent) + 18) % 36 || 36)
      .toString()
      .padStart(2, "0");

    const pairKey = [baseIdent, reciprocal].sort().join("-");

    if (!runwayPairs.has(pairKey)) {
      runwayPairs.set(pairKey, []);
    }
    runwayPairs.get(pairKey)!.push(runway);
  });

  return (
    <div className="border-y py-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        {Array.from(runwayPairs.values()).map((pair) => {
          const [runway1, runway2] = pair;
          // Use the first runway's data, but show both designators
          const leading = runway1.ident;
          const trailing = runway2?.ident || getReciprocalIdent(runway1.ident);

          return (
            <RunwayElement
              key={`${leading}-${trailing}`}
              designatorLeading={leading}
              designatorTrailing={trailing}
              width={parseInt(runway1.width_ft) || null}
              length={parseInt(runway1.length_ft) || null}
              surfaceType={runway1.surface || null}
              unit="ft"
              lighted={runway1.lighted}
            />
          );
        })}
      </div>
    </div>
  );
}

function getReciprocalIdent(ident: string): string {
  const base = ident.replace(/[LRC]$/, "");
  const suffix = ident.match(/[LRC]$/)?.[0] || "";
  const reciprocal = ((parseInt(base) + 18) % 36 || 36)
    .toString()
    .padStart(2, "0");

  // Flip L/R for reciprocal
  const reciprocalSuffix = suffix === "L" ? "R" : suffix === "R" ? "L" : suffix;

  return reciprocal + reciprocalSuffix;
}

export function AirportRunwaysSkeleton() {
  return (
    <div className="border-y py-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full max-w-3xl" />
        <Skeleton className="h-12 w-full max-w-3xl" />
      </div>
    </div>
  );
}
