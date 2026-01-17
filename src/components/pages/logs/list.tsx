import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchAssetsByIds } from "@/actions/pages/fleet/fetch";
import { fetchLogs } from "@/actions/pages/logs/fetch";

import { Log } from "@/types/logs";
import { Fleet } from "@/types/fleet";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { format } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { FlightListItem } from "@/components/pages/logs/flight-list-item";
import { SimulatorListItem } from "@/components/pages/logs/simulator-list-item";
import { ErrorContainer } from "@/components/ui/error-container";

import { ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 50;

// Utility function to group logs by month
function groupLogsByMonth(logs: Log[]): Record<string, Log[]> {
  const grouped: Record<string, Log[]> = {};

  logs.forEach((log) => {
    const date = new Date(log.date);
    const monthKey = format(date, "MMMM yyyy");

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }

    grouped[monthKey].push(log);
  });

  return grouped;
}

interface LogListProps {
  searchQuery: string;
  filters: {
    showFlights: boolean;
    showSimulators: boolean;
  };
  sortOrder: "asc" | "desc";
}

export function LogList({ searchQuery, filters, sortOrder }: LogListProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [fleetMap, setFleetMap] = useState<Record<string, Fleet>>({});

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data and reset on search query change
  const loadLogs = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const result = await fetchLogs({
          searchQuery,
          page,
          pageSize: ITEMS_PER_PAGE,
          // sortBy: "date-desc", // Optional: add sorting if needed
        })

        if (result.error) {
          setError(result.error);
          return;
        }

        if (append) {
          setLogs((prev) => [...prev, ...result.logs]);
        } else {
          setLogs(result.logs);
        }

        setHasMore(result.hasMore);
        setCurrentPage(page);
      } catch (err) {
        setError("Failed to load crew members");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery]
  );

  const filteredAndSortedLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (log._type === "flight" && !filters.showFlights) return false;
        if (log._type === "simulator" && !filters.showSimulators) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [logs, filters.showFlights, filters.showSimulators, sortOrder]);

  useEffect(() => {
    async function loadFleet() {
      const ids = Array.from(
        new Set(
          filteredAndSortedLogs
            .map((f) => f.aircraft_id)
            .filter(Boolean)
        )
      );

      if (!ids.length) return;

      const { assets } = await fetchAssetsByIds(ids);

      const map = assets.reduce<Record<string, Fleet>>((acc, asset) => {
        acc[asset.id] = asset;
        return acc;
      }, {});

      setFleetMap(map);
    }

    loadFleet();
  }, [filteredAndSortedLogs]);

  // Debounced search handler
  const debouncedLoad = useDebouncedCallback(() => {
    loadLogs(1, false);
  }, 300);

  // Load data on mount and when search query changes
  useEffect(() => {
    if (searchQuery) {
      debouncedLoad();
    } else {
      loadLogs(1, false);
    }
  }, [searchQuery, loadLogs, debouncedLoad]);

  // Group logs whenever the logs array changes
  const groupedLogs = useMemo(
    () => groupLogsByMonth(filteredAndSortedLogs),
    [filteredAndSortedLogs]
  );

  // Load more handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadLogs(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadingMore, loadLogs]);

  // Infinite scroll sentinel
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: loadingMore,
    onLoadMore: handleLoadMore,
  });

  // Loading state
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="sticky top-0 z-10">
          <Skeleton className="h-6 w-48 rounded-sm" />
        </div>
        <PositionedGroup>
          {Array.from({ length: 10 }).map((_, index) => (
            <ListItemSkeleton key={index} />
          ))}
        </PositionedGroup>
      </div>
    )
  }

  // Error state
  if (error) {
    return <ErrorContainer title="Error Loading Logs" message={error} />;
  }

  // Empty state
  if (logs.length === 0) {
    return (
      <div className="flex justify-center text-center py-12 text-muted-foreground w-full">
        <p className="w-2/3">
          {searchQuery
            ? `No logs found matching "${searchQuery}".`
            : "No logs found. Start logging your flights and simulator sessions!"}
        </p>
      </div>
    );
  }

  // Render grouped logs by month
  return (
    <>
      {Object.entries(groupedLogs).map(([month, monthLogs]) => (
        <div key={month} className="space-y-2 mb-6">
          <div
            id={`section-${month}`}
            className="sticky top-0 z-10 bg-background pt-2 pb-1"
          >
            <h2 className="text-xl font-semibold flex items-center">
              {month}
              <span className="ml-3 text-sm text-muted-foreground font-normal">
                {monthLogs.length}
              </span>
            </h2>
          </div>

          <PositionedGroup>
            {monthLogs.map((log) =>
              log._type === "flight" ? (
                <FlightListItem key={log.id} flight={log} aircraft={fleetMap[log.aircraft_id]} />
              ) : (
                <SimulatorListItem key={log.id} session={log} simulator={fleetMap[log.aircraft_id]} />
              )
            )}
          </PositionedGroup>
        </div>
      ))}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-4">
          <PositionedGroup>
            {Array.from({ length: 3 }).map((_, index) => (
              <ListItemSkeleton key={`loading-${index}`} />
            ))}
          </PositionedGroup>
        </div>
      )}
    </>
  )
}

export function ListItemSkeleton() {
  return (
    <PositionedItem className="px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-4 w-full">
      {/* LEADING COLUMN — 3 ROWS */}
      <div className="min-w-0 ml-2 flex flex-col gap-1">
        {/* Row 1 */}
        <Skeleton className="h-4 w-36" />

        {/* Row 2 */}
        <Skeleton className="h-6 w-40" />

        {/* Row 3 */}
        <Skeleton className="h-3 w-28" />
      </div>

      {/* TRAILING COLUMN — mirrors real layout */}
      <div className="shrink-0 grid grid-rows-3 grid-cols-[auto_auto] items-center gap-x-3">
        {/* Row 1 — aircraft */}
        <Skeleton className="h-3 w-28 justify-self-end" />

        {/* Row 2 — duration */}
        <Skeleton className="h-4 w-16 justify-self-end" />

        {/* Row 3 — spacer */}
        <div />

        {/* Chevron */}
        <ChevronRight className="col-start-2 row-span-3 w-5 h-5 text-muted-foreground" />
      </div>
    </PositionedItem>
  );
}