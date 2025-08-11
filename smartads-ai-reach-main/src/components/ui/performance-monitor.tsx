import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  fps: number;
  networkRequests: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible = false,
  position = 'bottom-right',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    fps: 60,
    networkRequests: 0,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    const updateInterval = 1000; // Update every second

    const updateMetrics = () => {
      const currentTime = performance.now();
      
      // Calculate FPS
      frameCount++;
      if (currentTime - lastTime >= updateInterval) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
        
        // Get render time from performance entries
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const renderTime = navigationEntries.length > 0 
          ? Math.round(navigationEntries[0].loadEventEnd - navigationEntries[0].fetchStart)
          : 0;

        // Count components (approximate by counting React elements)
        const componentCount = document.querySelectorAll('[data-reactroot] *').length;

        // Count network requests
        const resourceEntries = performance.getEntriesByType('resource');
        const networkRequests = resourceEntries.length;

        setMetrics({
          renderTime,
          memoryUsage,
          componentCount,
          fps,
          networkRequests,
        });

        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateMetrics);
    };

    const animationId = requestAnimationFrame(updateMetrics);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const getPerformanceColor = (metric: string, value: number) => {
    switch (metric) {
      case 'fps':
        if (value >= 55) return 'bg-green-500';
        if (value >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
      case 'memory':
        if (value <= 50) return 'bg-green-500';
        if (value <= 100) return 'bg-yellow-500';
        return 'bg-red-500';
      case 'renderTime':
        if (value <= 1000) return 'bg-green-500';
        if (value <= 3000) return 'bg-yellow-500';
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className={`fixed z-50 ${getPositionClasses()}`}
        onClick={() => setIsExpanded(true)}
      >
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <Activity className="h-3 w-3 mr-1" />
          {metrics.fps} FPS
        </Badge>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </CardTitle>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>FPS</span>
            </div>
            <Badge 
              variant="outline"
              className={getPerformanceColor('fps', metrics.fps)}
            >
              {metrics.fps}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>Memory</span>
            </div>
            <Badge 
              variant="outline"
              className={getPerformanceColor('memory', metrics.memoryUsage)}
            >
              {metrics.memoryUsage} MB
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Load Time</span>
            </div>
            <Badge 
              variant="outline"
              className={getPerformanceColor('renderTime', metrics.renderTime)}
            >
              {metrics.renderTime} ms
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Components</span>
            </div>
            <Badge variant="outline">
              {metrics.componentCount}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>Requests</span>
            </div>
            <Badge variant="outline">
              {metrics.networkRequests}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};