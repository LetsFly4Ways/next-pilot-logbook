import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "100px",
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelNodeRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasMore &&
        !isLoading &&
        !loadingRef.current
      ) {
        loadingRef.current = true;
        onLoadMore();
        setTimeout(() => {
          loadingRef.current = false;
        }, 500);
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin,
      threshold,
    });

    // Re-attach to the sentinel node if it's already in the DOM
    if (sentinelNodeRef.current) {
      observerRef.current.observe(sentinelNodeRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observerCallback, rootMargin, threshold]);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelNodeRef.current = node;
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  return sentinelRef;
}
