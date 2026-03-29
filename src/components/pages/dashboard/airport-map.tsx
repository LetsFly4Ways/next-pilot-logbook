"use client";

import { useMemo, useState } from "react";

import { RouteEntry } from "@/types/statistics";
import type { ResolvedWithCount } from "@/components/pages/dashboard/airport-card";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ControlButton, ControlGroup, Map as MapComponent, MapControls, MapMarker, MapRoute, MarkerContent } from "@/components/ui/map";

import { Maximize2, Map as MapIcon, Route } from "lucide-react";


export function AirportsMap({ resolved, routes }: { resolved: ResolvedWithCount[]; routes: RouteEntry[] }) {
  const [showRoutes, setShowRoutes] = useState(false);

  // Clusters
  // const geojson: FeatureCollection<Point> = useMemo(() => ({
  //   type: "FeatureCollection",
  //   features: resolved.map((p) => ({
  //     type: "Feature" as const,
  //     geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] },
  //     properties: { code: p.code, count: p.count },
  //   })),
  // }), [resolved]);

  const maxCount = useMemo(
    () => Math.max(...resolved.map((p) => p.count), 1),
    [resolved]
  );

  function frequencyColor(count: number, max: number): string {
    const ratio = max > 1 ? count / max : 1;
    // Low → sky blue, mid → primary blue, high → deep indigo
    if (ratio < 0.25) return "hsl(199 89% 70%)";
    if (ratio < 0.50) return "hsl(213 87% 58%)";
    if (ratio < 0.75) return "hsl(226 71% 48%)";
    return "hsl(245 75% 38%)";
  };

  const coordsMap = useMemo(
    () => new Map(resolved.map((r) => [r.code, { lon: r.lon, lat: r.lat }])),
    [resolved]
  );

  const routeLines = useMemo(
    () =>
      routes.flatMap((route) => {
        const dep = coordsMap.get(route.departure);
        const dest = coordsMap.get(route.destination);
        if (!dep || !dest) return [];
        return [{
          id: `${route.departure}-${route.destination}`,
          coords: [[dep.lon, dep.lat],
          [dest.lon, dest.lat]] as [number, number][],
          count: route.count,
        }];
      }),
    [routes, coordsMap]
  );

  const mapCenter = useMemo(() => {
    if (resolved.length === 0) return { longitude: 4.5, latitude: 50.5 };
    const lats = resolved.map((p) => p.lat);
    const lons = resolved.map((p) => p.lon);
    return {
      longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    };
  }, [resolved]);

  // Reusable Map Fragment to avoid duplication
  const MapInner = (
    <MapComponent
      center={[mapCenter.longitude, mapCenter.latitude]}
      zoom={0}
    >
      {/* Markers */}
      {resolved.map((airport) => (
        <MapMarker
          key={airport.code}
          longitude={airport.lon}
          latitude={airport.lat}
        >
          <MarkerContent>
            <div
              className="rounded-full border-2 border-white shadow-md"
              style={{
                width: 10 + Math.min(airport.count, 20) * 0.8,
                height: 10 + Math.min(airport.count, 20) * 0.8,
                backgroundColor: frequencyColor(airport.count, maxCount),
              }}
            />
          </MarkerContent>
        </MapMarker>
      ))}

      {/* Route lines sit underneath markers */}
      {showRoutes && routeLines.map((line) => (
        <MapRoute
          key={line.id}
          coordinates={line.coords}
          color="hsl(213 87% 58%)"
          width={Math.min(1 + line.count * 0.3, 4)}  // thicker = more frequent
          opacity={Math.min(0.15 + line.count * 0.05, 0.7)}
          interactive={false}
        />
      ))}

      {/* Clusters - Find a solution to display clusters with individual markers */}
      {/* <MapClusterLayer
          data={geojson}
          pointColor="hsl(199 89% 48%)"
          clusterColors={["hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(346 77% 49%)"]}
          clusterThresholds={[5, 20]}
          clusterRadius={40}
        /> */}

      {/* Map Controls */}
      <MapControls showZoom showFullscreen position="bottom-right">
        <ControlGroup>
          <ControlButton
            onClick={() => setShowRoutes((v) => !v)}
            label={showRoutes ? "Hide routes" : "Show routes"}
            className={showRoutes ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            <Route className="size-4" />
          </ControlButton>
        </ControlGroup>
      </MapControls>
    </MapComponent>
  );

  return (
    <div className="flex-1 relative">
      {/* MOBILE VIEW: Show a placeholder/button */}
      <div className="md:hidden flex flex-col items-center justify-center h-48 w-full rounded-xl bg-muted/20 border border-dashed border-border gap-4">
        <div className="flex flex-col items-center gap-1 text-center px-4">
          <MapIcon className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Interactive map available</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Maximize2 className="size-4" />
              Open Fullscreen Map
            </Button>
          </DialogTrigger>
          {/* Fullscreen Dialog Content */}
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden border-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Flight Map</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full">
              {MapInner}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* DESKTOP VIEW: Regular Inline Map */}
      <div className="hidden md:block h-full w-full rounded-xl overflow-hidden border border-border min-h-80">
        {MapInner}
      </div>
    </div>
  );
}