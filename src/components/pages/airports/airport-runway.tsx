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

  function runwayNumber(ident: string): number {
    return parseInt(ident.slice(0, 2), 10);
  }

  const suffixOrder: Record<string, number> = {
    L: 0,
    C: 1,
    R: 2,
    "": 1, // no suffix behaves like center
  };

  function suffixRank(ident: string): number {
    const suffix = ident.match(/[LRC]$/)?.[0] ?? "";
    return suffixOrder[suffix] ?? 99;
  }

  function flipSuffix(s?: string) {
    if (s === "L") return "R";
    if (s === "R") return "L";
    return s ?? "";
  }

  function reciprocalIdent(ident: string) {
    const num = runwayNumber(ident);
    const suffix = ident.match(/[LRC]$/)?.[0];
    const recipNum = ((num + 18) % 36 || 36).toString().padStart(2, "0");
    return recipNum + flipSuffix(suffix);
  }

  return (
    <div className="border-y py-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        {Array.from(runwayPairs.values()).flatMap((runways) => {
          const used = new Set<string>();
          const pairs: [Runway, Runway | undefined][] = [];

          for (const r of runways) {
            if (used.has(r.ident)) continue;

            const recipId = reciprocalIdent(r.ident);
            const reciprocal = runways.find((x) => x.ident === recipId);

            used.add(r.ident);
            if (reciprocal) used.add(reciprocal.ident);

            // Ensure left = lower runway number
            const [left, right] =
              runwayNumber(r.ident) <= runwayNumber(reciprocal?.ident ?? "99")
                ? [r, reciprocal]
                : [reciprocal!, r];

            pairs.push([left, right]);
          }

          return pairs
            .sort(
              ([leftA], [leftB]) =>
                suffixRank(leftA.ident) - suffixRank(leftB.ident)
            )
            .map(([left, right]) => (
              <RunwayElement
                key={`${left.ident}-${right?.ident}`}
                designatorLeading={left.ident}
                designatorTrailing={
                  right?.ident ?? getReciprocalIdent(left.ident)
                }
                width={parseInt(left.width_ft) || null}
                length={parseInt(left.length_ft) || null}
                surfaceType={left.surface || null}
                lighted={left.lighted}
              />
            ));
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
