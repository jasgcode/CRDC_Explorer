import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseInfiniteScrollOptions {
  totalItems: number;
  initialItemsPerPage?: number;
  threshold?: number;
}

export const useInfiniteScroll = <T extends any[]>({
  totalItems,
  initialItemsPerPage = 10,
  threshold = 20
}: UseInfiniteScrollOptions) => {
  const [visibleItems, setVisibleItems] = useState(initialItemsPerPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setVisibleItems(initialItemsPerPage);
    setHasMore(totalItems > initialItemsPerPage);
  }, [totalItems, initialItemsPerPage]);

  const loadMoreItems = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setVisibleItems(prevVisible => {
      const newVisible = Math.min(prevVisible + initialItemsPerPage, totalItems);
      if (newVisible >= totalItems) {
        setHasMore(false);
      }
      return newVisible;
    });
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, totalItems, initialItemsPerPage]);

  const handleScroll = useCallback(
    (containerRef: RefObject<HTMLElement>) => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - threshold && !isLoadingMore && hasMore) {
        loadMoreItems();
      }
    },
    [loadMoreItems, isLoadingMore, hasMore, threshold]
  );

  return {
    visibleItems,
    hasMore,
    isLoadingMore,
    handleScroll,
    loadMoreItems
  };
};