import { useCallback, useEffect, useState } from "react";

import { fetchFleet } from "@/actions/pages/fleet/fetch";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

import { Fleet, FleetGroupBy } from "@/types/fleet";

import { ErrorContainer } from "@/components/ui/error-container";
import { PositionedGroup } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import FleetListItem, {
  FleetListItemSkeleton,
} from "@/components/pages/fleet/list-item";

const ITEMS_PER_PAGE = 50;

// Utility function to group fleet by selected
function groupFleet(
  fleet: Fleet[],
  groupBy: FleetGroupBy
): Record<string, Fleet[]> {
  const grouped: Record<string, Fleet[]> = {};

  fleet.forEach((fleet) => {
    // Group based on selected
    let key = "";
    switch (groupBy) {
      case "operator":
        key = fleet.operator ?? "No Operator";
        break;
      case "type":
        key = fleet.is_simulator ? "Simulator" : "Aircraft";
        break;
      case "icaoType":
        key = fleet.type ?? "Unknown Type";
        break;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(fleet);
  });

  // Sort the groups alphabetically, with # at the end
  const sortedGrouped: Record<string, Fleet[]> = {};
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  sortedKeys.forEach((key) => {
    sortedGrouped[key] = grouped[key];
  });

  return sortedGrouped;
}

interface FleetListProps {
  searchQuery: string;
  groupBy: FleetGroupBy
}

export function FleetList({ searchQuery, groupBy = "type" }: FleetListProps) {
  const [fleet, setFleet] = useState<Fleet[]>([]);
  const [groupedFleet, setGroupedFleet] = useState<Record<string, Fleet[]>>({});

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data and reset on search query change
  const loadFleet = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const result = await fetchFleet({
          searchQuery,
          page,
          pageSize: ITEMS_PER_PAGE,
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        if (append) {
          setFleet((prev) => [...prev, ...result.fleet]);
        } else {
          setFleet(result.fleet);
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

  // Debounced search handler
  const debouncedLoad = useDebouncedCallback(() => {
    loadFleet(1, false);
  }, 300);

  // Load data on mount and when search query changes
  useEffect(() => {
    if (searchQuery) {
      debouncedLoad();
    } else {
      loadFleet(1, false);
    }
  }, [searchQuery, loadFleet, debouncedLoad]);

  // Group fleet whenever the fleet array changes
  useEffect(() => {
    setGroupedFleet(groupFleet(fleet, groupBy));
  }, [fleet, groupBy]);

  // Load more handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadFleet(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadingMore, loadFleet]);

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
            <FleetListItemSkeleton key={index} />
          ))}
        </PositionedGroup>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorContainer title="Error Loading Crew Members" message={error} />
    );
  }

  // Empty state
  if (fleet.length === 0) {
    return (
      <div className="flex justify-center text-center py-12 text-muted-foreground w-full">
        <p className="w-2/3">
          {searchQuery
            ? `No crew members found matching "${searchQuery}".`
            : "No crew members found. You can create them by clicking on the plus icon in the top right corner."}
        </p>
      </div>
    );
  }

  return (
    <>
      {Object.entries(groupedFleet).map(([groupKey, groupedFleet]) => {
        return (
          <div key={groupKey} className="space-y-2 mb-6">
            <div
              id={`section-${groupKey}`}
              className="sticky top-0 z-10 bg-background pt-2 pb-1"
            >
              <h2 className="text-xl font-semibold flex items-center">
                {groupKey}
              </h2>
            </div>

            <PositionedGroup>
              {groupedFleet.map((fleet) => (
                <FleetListItem key={fleet.id} fleet={fleet} />
              ))}
            </PositionedGroup>
          </div>
        );
      })}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-4">
          <PositionedGroup>
            {Array.from({ length: 3 }).map((_, index) => (
              <FleetListItemSkeleton key={`loading-${index}`} />
            ))}
          </PositionedGroup>
        </div>
      )}
    </>
  );
}
