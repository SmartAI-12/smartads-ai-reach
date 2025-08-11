import React, { useState, useRef, TouchEvent, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  className,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pullIndicatorRef = useRef<HTMLDivElement>(null);

  const checkIfCanPull = () => {
    if (disabled) return false;
    
    const container = containerRef.current;
    if (!container) return false;
    
    // Can only pull if at the top of the scrollable area
    return container.scrollTop <= 0;
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    setCanPull(checkIfCanPull());
    if (!canPull) return;
    
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || !canPull) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    // Only allow pulling down
    if (deltaY > 0 && checkIfCanPull()) {
      e.preventDefault();
      
      // Apply diminishing returns for smoother feel
      const dampening = 0.5;
      const newPullDistance = Math.min(deltaY * dampening, threshold * 1.5);
      setPullDistance(newPullDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !canPull) {
      setPullDistance(0);
      return;
    }
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    setCanPull(false);
  };

  useEffect(() => {
    // Reset pull distance when refreshing completes
    if (!isRefreshing) {
      setPullDistance(0);
    }
  }, [isRefreshing]);

  const getIndicatorOpacity = () => {
    return Math.min(pullDistance / threshold, 1);
  };

  const getIndicatorRotation = () => {
    if (isRefreshing) return 'animate-spin';
    return pullDistance >= threshold ? 'rotate-180' : `rotate-${Math.min(pullDistance / threshold * 180, 180)}`;
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <div
        ref={pullIndicatorRef}
        className={cn(
          "absolute top-0 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-200",
          "flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-md",
          (pullDistance > 0 || isRefreshing) ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(-50%, ${Math.max(pullDistance - 24, -48)}px)`,
          opacity: isRefreshing ? 1 : getIndicatorOpacity(),
        }}
      >
        <RefreshCw 
          className={cn(
            "h-5 w-5 text-primary transition-transform duration-200",
            getIndicatorRotation()
          )}
        />
      </div>

      {/* Content container */}
      <div
        ref={containerRef}
        className="h-full overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};