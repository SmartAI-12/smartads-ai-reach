import React, { useState, useRef, TouchEvent } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Edit, Archive, CheckCircle } from 'lucide-react';

interface SwipeAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

const defaultLeftActions: SwipeAction[] = [
  {
    key: 'complete',
    label: 'Complete',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-500',
    action: () => {},
  },
];

const defaultRightActions: SwipeAction[] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-blue-500',
    action: () => {},
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
    color: 'bg-yellow-500',
    action: () => {},
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    color: 'bg-red-500',
    action: () => {},
  },
];

export const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  leftActions = defaultLeftActions,
  rightActions = defaultRightActions,
  threshold = 100,
  className,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeAction, setActiveAction] = useState<SwipeAction | null>(null);
  
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Apply some resistance at the edges
    const maxSwipe = window.innerWidth * 0.3;
    const resistanceFactor = Math.abs(deltaX) > maxSwipe ? 0.3 : 1;
    const newTranslateX = deltaX * resistanceFactor;
    
    setTranslateX(newTranslateX);

    // Determine active action
    const absTranslateX = Math.abs(newTranslateX);
    if (absTranslateX > threshold) {
      const actions = newTranslateX > 0 ? leftActions : rightActions;
      const actionIndex = Math.min(
        Math.floor((absTranslateX - threshold) / 80),
        actions.length - 1
      );
      setActiveAction(actions[actionIndex] || null);
    } else {
      setActiveAction(null);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (activeAction && Math.abs(translateX) > threshold) {
      // Execute the action
      activeAction.action();
      
      // Animate back to center
      setTranslateX(0);
      setActiveAction(null);
    } else {
      // Snap back to center
      setTranslateX(0);
      setActiveAction(null);
    }
  };

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;
    
    const isVisible = side === 'left' ? translateX > threshold : translateX < -threshold;
    if (!isVisible) return null;

    return (
      <div 
        className={cn(
          "absolute top-0 h-full flex items-center",
          side === 'left' ? 'left-0' : 'right-0'
        )}
      >
        {actions.map((action, index) => (
          <div
            key={action.key}
            className={cn(
              "h-full flex items-center justify-center text-white transition-all duration-200",
              action.color,
              activeAction?.key === action.key && "scale-110",
              side === 'left' ? 'border-r border-white/20' : 'border-l border-white/20'
            )}
            style={{ width: '80px' }}
          >
            <div className="flex flex-col items-center gap-1">
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderActions(leftActions, 'left')}
      {renderActions(rightActions, 'right')}
      
      <div
        className={cn(
          "relative z-10 transition-transform duration-200 ease-out",
          isDragging && "transition-none"
        )}
        style={{ 
          transform: `translateX(${translateX}px)`,
          backgroundColor: 'var(--background)'
        }}
      >
        {children}
      </div>
    </div>
  );
};