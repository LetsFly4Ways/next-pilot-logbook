"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAircraftTypesGroupedByManufacturer,
} from "@/actions/pages/fleet/fetch-aircraft-types";

import { AircraftType } from "@/types/aircraft-type";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Badge } from "@/components/ui/badge";
import AircraftTypeItem from "@/components/pages/fleet/type-select/list-item";
import { saveSelectedAircraft } from "@/components/pages/fleet/type-select/selected-aircraft-type";
import { ErrorContainer } from "@/components/ui/error-container";

import { ChevronRight, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10; // manufacturers per page

export function AircraftTypeList() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [grouped, setGrouped] = useState<Record<string, AircraftType[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAircraftTypesGroupedByManufacturer();
        if (result.success) {
          setGrouped(result.data!);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading aircraft types");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    const normalized = query.toLowerCase().replace(/\s+/g, "");

    return Object.entries(grouped).reduce<
      [string, AircraftType[]][]
    >((acc, [manufacturer, types]) => {
      if (!normalized) {
        acc.push([manufacturer, types]);
        return acc;
      }

      const filtered = types.filter((a) => {
        const model = a.Model.toLowerCase().replace(/\s+/g, "");
        const type = a.Type.toLowerCase().replace(/\s+/g, "");

        return (
          model.includes(normalized) ||
          type.includes(normalized) ||
          manufacturer.toLowerCase().includes(normalized)
        );
      });

      if (filtered.length > 0) {
        acc.push([manufacturer, filtered]);
      }

      return acc;
    }, []);
  }, [grouped, query]);

  // Paginated manufacturers
  const visibleGroups = useMemo(() => {
    return filteredGroups.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredGroups, currentPage]);

  const hasMore = useMemo(() => {
    return currentPage * ITEMS_PER_PAGE < filteredGroups.length;
  }, [currentPage, filteredGroups.length]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore]);

  // Infinite scroll sentinel
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: loadingMore,
    onLoadMore: handleLoadMore,
    rootMargin: "200px",
  });

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const isSearchEmpty =
    !loading &&
    query.trim().length > 0 &&
    filteredGroups.length === 0;

  const canCreate =
    query.trim().length >= 2 &&
    /^[a-z0-9\- ]+$/i.test(query);

  const handleCreateFromSearch = useCallback(() => {
    saveSelectedAircraft({
      Type: query,
      Model: "",
      Manufacturer: "",
      EngineCount: 0,
      EngineType: "",
      Category: ""
    });
    router.back();
  }, [router, query])

  if (error) {
    return (
      <ErrorContainer title="Error Loading Aircraft Types" message={error} />
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search by type, model, or manufacturer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Loading */}
      {loading ? (
        <>
          <Skeleton className="h-8 w-32" />
          <PositionedGroup>
            {Array.from({ length: 10 }).map((_, i) => (
              <PositionedItem key={i} className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full">
                <Skeleton key={i} className="h-10 w-64" />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </PositionedItem>
            ))}
          </PositionedGroup>
        </>
      ) : isSearchEmpty && canCreate ? (
        <div className="flex flex-col justify-center py-8 gap-6 text-muted-foreground">
          <div className="text-center space-y-4">
            <p>
              No aircraft types found matching{" "}
              <span className="font-medium text-foreground">
                &quot;{query}&quot;
              </span>
              .
            </p>
          </div>
          <PositionedGroup>
            <PositionedItem
              role="button"
              className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer"
              onClick={handleCreateFromSearch}
            >
              <div>Create aircraft type <span className="font-medium">
                &quot;{query}&quot;</span></div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </PositionedItem>
          </PositionedGroup>
        </div>
      ) : (
        <>
          {visibleGroups.map(([manufacturer, aircraft]) => (
            <div key={manufacturer} className="space-y-2">
              {/* Sticky manufacturer header */}
              <div className="sticky top-0 z-10 bg-background">
                <h2 className="text-xl font-semibold flex items-center">
                  {manufacturer}
                  <Badge className="ml-3" variant="basic">
                    {aircraft.length}
                  </Badge>
                </h2>
              </div>

              <PositionedGroup>
                {aircraft.map((type) => (
                  <AircraftTypeItem
                    key={`${type.Manufacturer}-${type.Type}-${type.Model}`}
                    type={type}
                  />
                ))}
              </PositionedGroup>
            </div>
          ))}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="py-4">
              <PositionedGroup>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </PositionedGroup>
            </div>
          )}
        </>
      )
      }
    </div >
  );
}
