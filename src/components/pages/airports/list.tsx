"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Airport, SortBy } from "@/types/airports";

import { searchAndSortAirports } from "@/actions/pages/airports/fetch";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { Badge } from "@/components/ui/badge";
import AirportListItem, {
  AirportItemSkeleton,
} from "@/components/pages/airports/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorContainer } from "@/components/error-container";

interface GroupedAirports {
  [key: string]: Airport[];
}

const ITEMS_PER_PAGE = 50;

interface AirportsListProps {
  searchQuery: string;
  sortBy: SortBy;
}

export function AirportsList({ searchQuery, sortBy }: AirportsListProps) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load airports data with search and sort
  useEffect(() => {
    let isCancelled = false;

    const loadAirports = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await searchAndSortAirports(searchQuery, sortBy);

        if (isCancelled) return;

        if (!result.success) {
          setError(result.error);
          setAirports([]);
          // setDisplayAirports([]);
          return;
        }

        // Update both states together to prevent showing stale data
        setAirports(result.data);
        // setDisplayAirports(result.data);
      } catch (err) {
        if (isCancelled) return;

        console.error("Failed to load airports:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setAirports([]);
        // setDisplayAirports([]);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadAirports();

    return () => {
      isCancelled = true;
    };
  }, [searchQuery, sortBy]);

  // Calculate available letters for navigation
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    airports.forEach((airport) => {
      let firstChar = "";
      switch (sortBy) {
        case "country":
          firstChar = airport.countryName?.charAt(0).toUpperCase() || "N";
          break;
        case "icao":
          firstChar = airport.icao?.charAt(0).toUpperCase() || "N";
          break;
        case "iata":
          firstChar = airport.iata?.charAt(0).toUpperCase() || "N";
          break;
      }
      if (firstChar) letters.add(firstChar);
    });
    return Array.from(letters).sort();
  }, [airports, sortBy]);

  // Scroll to letter in list
  const scrollToLetter = useCallback((letter: string) => {
    if (letter === "•") return;

    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Paginated airports
  const paginatedAirports = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return airports.slice(0, endIndex);
  }, [airports, currentPage]);

  // Check if more items available
  const hasMore = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return endIndex < airports.length;
  }, [currentPage, airports]);

  // Load more handler
  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  // Use infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMore,
    rootMargin: "200px",
    threshold: 0.1,
  });

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Group airports for display
  const groupedAirports = useMemo(() => {
    return paginatedAirports.reduce<GroupedAirports>((acc, airport) => {
      let groupKey = "";
      switch (sortBy) {
        case "country":
          groupKey = airport.countryName || "No Country";
          break;
        case "icao":
          groupKey = airport.icao?.charAt(0).toUpperCase() || "No ICAO";
          break;
        case "iata":
          groupKey = airport.iata?.charAt(0).toUpperCase() || "No IATA";
          break;
      }

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      acc[groupKey].push(airport);

      return acc;
    }, {});
  }, [paginatedAirports, sortBy]);

  return (
    <div className="p-4">
      <div className="flex">
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="sticky top-0 py-2 z-10">
                  <Skeleton className="h-8 w-64 rounded-sm" />
                </div>
                <div className="divide-y border-b">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <AirportItemSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <ErrorContainer title={"Error Loading airports"} message={error} />
          ) : airports.length === 0 && searchQuery ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No airports found matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : airports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No airports available</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedAirports).map(
                ([groupKey, groupedAirports]) => {
                  const firstLetter = groupKey.charAt(0).toUpperCase();

                  return (
                    <div key={groupKey} className="space-y-4">
                      <div
                        id={`section-${firstLetter}`}
                        className="sticky top-0 py-2 z-10 bg-background"
                      >
                        <h2 className="text-2xl font-semibold flex items-center">
                          {groupKey}
                          <Badge className="ml-3" variant="basic">
                            {groupedAirports.length}
                          </Badge>
                        </h2>
                      </div>

                      <div className="divide-y border-b">
                        {groupedAirports.map((airport) => (
                          <AirportListItem
                            key={airport.icao}
                            airport={airport}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
              )}

              {/* Sentinel element for infinite scroll */}
              {hasMore && (
                <div ref={sentinelRef} className="py-8">
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <AirportItemSkeleton key={i} />
                    ))}
                  </div>
                </div>
              )}

              {!hasMore && paginatedAirports.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    You&apos;ve reached the end! All {airports.length} airports
                    loaded.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
