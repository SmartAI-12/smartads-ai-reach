import { useMemo } from 'react';

interface UseVirtualizationProps {
  totalItems: number;
  threshold?: number;
  itemHeight?: number;
  containerHeight?: number;
}

export const useVirtualization = ({
  totalItems,
  threshold = 100,
  itemHeight = 60,
  containerHeight = 400,
}: UseVirtualizationProps) => {
  return useMemo(() => {
    const shouldVirtualize = totalItems > threshold;
    
    if (!shouldVirtualize) {
      return {
        shouldVirtualize: false,
        containerHeight,
        itemHeight,
        visibleItems: totalItems,
      };
    }

    const visibleItems = Math.ceil(containerHeight / itemHeight) + 5; // +5 for overscan

    return {
      shouldVirtualize: true,
      containerHeight,
      itemHeight,
      visibleItems: Math.min(visibleItems, totalItems),
    };
  }, [totalItems, threshold, itemHeight, containerHeight]);
};