"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Airport, SortBy } from "@/types/airports";

import { searchAndSortAirports } from "@/actions/pages/airports/fetch";
import { getFavoriteAirports } from "@/actions/pages/airports/favorites";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { Badge } from "@/components/ui/badge";
import AirportListItem, {
  AirportItemSkeleton,
} from "@/components/pages/airports/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorContainer } from "@/components/ui/error-container";
import {
  PositionedGroup,
  PositionedItem,
} from "@/components/ui/positioned-group";
import { ChevronRight, Star } from "lucide-react";

interface GroupedAirports {
  [key: string]: Airport[];
}

const ITEMS_PER_PAGE = 50;

interface AirportsListProps {
  searchQuery: string;
  sortBy: SortBy;
  showFavoritesOnly: boolean;
}

export function AirportsList({
  searchQuery,
  sortBy,
  showFavoritesOnly,
}: AirportsListProps) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [favoriteIcaos, setFavoriteIcaos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch airports and favorites
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch airports and favorites in parallel
        const [airportsResult, favorites] = await Promise.all([
          searchAndSortAirports(searchQuery, sortBy),
          getFavoriteAirports(),
        ]);

        if (!airportsResult.success) {
          setError(airportsResult.error || "Failed to load airports");
          return;
        }

        setAirports(airportsResult.data);
        setFavoriteIcaos(favorites);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while loading airports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, sortBy]);

  // Filter airports based on favorites
  const filteredAirports = useMemo(() => {
    if (!showFavoritesOnly) {
      return airports;
    }
    return airports.filter((airport) =>
      favoriteIcaos.includes(airport.icao.toUpperCase())
    );
  }, [airports, showFavoritesOnly, favoriteIcaos]);

  // Paginated airports
  const paginatedAirports = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return filteredAirports.slice(0, endIndex);
  }, [filteredAirports, currentPage]);

  // Check if more items available
  const hasMore = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return endIndex < filteredAirports.length;
  }, [currentPage, filteredAirports]);

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

  // Reset page when search, sort, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, showFavoritesOnly]);

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

  const isFavorite = (icao: string) => favoriteIcaos.includes(icao);

  return (
    <div className="p-4 md:p-6">
      <div className="flex">
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="sticky top-0 z-10">
                  <Skeleton className="h-6 w-48 rounded-sm" />
                </div>
                <PositionedGroup>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <AirportItemSkeleton key={index} />
                  ))}
                </PositionedGroup>
              </div>
            </div>
          ) : error ? (
            <ErrorContainer title={"Error Loading airports"} message={error} />
          ) : filteredAirports.length === 0 && showFavoritesOnly ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No favourite airports yet</p>
              <p className="text-sm mt-2">
                Star airports to add them to your favourites
              </p>
            </div>
          ) : filteredAirports.length === 0 && searchQuery ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No airports found matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : filteredAirports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No airports available</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedAirports).map(
                ([groupKey, groupedAirports]) => {
                  const firstLetter = groupKey.charAt(0).toUpperCase();

                  return (
                    <div key={groupKey} className="space-y-2">
                      <div
                        id={`section-${firstLetter}`}
                        className="sticky top-0 z-10 bg-background"
                      >
                        <h2 className="text-xl font-semibold flex items-center">
                          {groupKey}
                          <Badge className="ml-3" variant="basic">
                            {groupedAirports.length}
                          </Badge>
                        </h2>
                      </div>

                      <PositionedGroup>
                        {groupedAirports.map((airport) => (
                          <AirportListItem
                            key={airport.icao}
                            airport={airport}
                            isFavorite={isFavorite(airport.icao)}
                          />
                        ))}
                      </PositionedGroup>
                    </div>
                  );
                }
              )}

              {/* Sentinel element for infinite scroll */}
              {hasMore && (
                <div ref={sentinelRef} className="py-4">
                  <div className="space-y-3">
                    <PositionedGroup>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <AirportItemSkeleton key={i} />
                      ))}
                    </PositionedGroup>
                  </div>
                </div>
              )}

              {!hasMore && paginatedAirports.length > 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>You&apos;ve reached the end!</p>
                  <p>All {filteredAirports.length} airports loaded.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
