"use client";

import { useState, useEffect, useCallback } from "react";

import { Crew } from "@/types/crew";
import { fetchCrewMembers } from "@/actions/pages/crew/fetch";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { Skeleton } from "@/components/ui/skeleton";
import { PositionedGroup } from "@/components/ui/positioned-group";
import { ErrorContainer } from "@/components/ui/error-container";
import CrewListItem, {
  CrewListItemSkeleton,
} from "@/components/pages/crew/list-item";
import { usePreferences } from "@/components/context/preferences-provider";

const ITEMS_PER_PAGE = 50;

// Utility function to group crews by last name initial
function groupCrewByInitial(
  crews: Crew[],
  nameDisplay: "first-last" | "last-first"
): Record<string, Crew[]> {
  const grouped: Record<string, Crew[]> = {};

  crews.forEach((crew) => {
    // Group by first letter based on nameDisplay preference
    const initial =
      nameDisplay === "last-first"
        ? crew.last_name?.charAt(0).toUpperCase() || "#"
        : crew.first_name?.charAt(0).toUpperCase() || "#";

    if (!grouped[initial]) {
      grouped[initial] = [];
    }
    grouped[initial].push(crew);
  });

  // Sort the groups alphabetically, with # at the end
  const sortedGrouped: Record<string, Crew[]> = {};
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

interface CrewListProps {
  searchQuery: string;
}

export function CrewList({ searchQuery }: CrewListProps) {
  const { preferences } = usePreferences();
  const nameDisplay = preferences.nameDisplay;

  const [crews, setCrews] = useState<Crew[]>([]);
  const [groupedCrews, setGroupedCrews] = useState<Record<string, Crew[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data and reset on search query change
  const loadCrews = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const result = await fetchCrewMembers({
          searchQuery,
          page,
          pageSize: ITEMS_PER_PAGE,
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        if (append) {
          setCrews((prev) => [...prev, ...result.crews]);
        } else {
          setCrews(result.crews);
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
    loadCrews(1, false);
  }, 300);

  // Load data on mount and when search query changes
  useEffect(() => {
    if (searchQuery) {
      debouncedLoad();
    } else {
      loadCrews(1, false);
    }
  }, [searchQuery, loadCrews, debouncedLoad]);

  // Group crews whenever the crews array changes
  useEffect(() => {
    setGroupedCrews(groupCrewByInitial(crews, nameDisplay));
  }, [crews, nameDisplay]);

  // Load more handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadCrews(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadingMore, loadCrews]);

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
            <CrewListItemSkeleton key={index} />
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
  if (crews.length === 0) {
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

  // Render grouped crew list
  return (
    <>
      {Object.entries(groupedCrews).map(([groupKey, groupedCrew]) => {
        const firstLetter = groupKey.charAt(0).toUpperCase();

        return (
          <div key={groupKey} className="space-y-2 mb-6">
            <div
              id={`section-${firstLetter}`}
              className="sticky top-0 z-10 bg-background pt-2 pb-1"
            >
              <h2 className="text-xl font-semibold flex items-center">
                {groupKey}
                <span className="ml-3 text-sm text-muted-foreground font-normal">
                  {groupedCrew.length}
                </span>
              </h2>
            </div>

            <PositionedGroup>
              {groupedCrew.map((crew) => (
                <CrewListItem
                  key={crew.id}
                  crew={crew}
                  nameDisplay={nameDisplay}
                />
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
              <CrewListItemSkeleton key={`loading-${index}`} />
            ))}
          </PositionedGroup>
        </div>
      )}
    </>
  );
}
