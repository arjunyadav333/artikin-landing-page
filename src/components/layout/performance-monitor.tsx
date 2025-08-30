import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceStats {
  pageLoadTime: number;
  queryCount: number;
  slowQueries: string[];
  cacheHitRate: number;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    pageLoadTime: 0,
    queryCount: 0,
    slowQueries: [],
    cacheHitRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      // Track page load performance
      const performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            setStats(prev => ({
              ...prev,
              pageLoadTime: entry.duration
            }));
          }
        });
      });

      if ('PerformanceObserver' in window) {
        performanceObserver.observe({ entryTypes: ['navigation'] });
      }

      return () => performanceObserver.disconnect();
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        📊 Perf
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Performance Monitor</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Page Load:</span>
          <Badge variant={stats.pageLoadTime > 3000 ? 'destructive' : 'secondary'}>
            {Math.round(stats.pageLoadTime)}ms
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">DB Queries:</span>
          <Badge variant={stats.queryCount > 10 ? 'destructive' : 'secondary'}>
            {stats.queryCount}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Cache Hit Rate:</span>
          <Badge variant={stats.cacheHitRate < 70 ? 'destructive' : 'secondary'}>
            {stats.cacheHitRate}%
          </Badge>
        </div>

        {stats.slowQueries.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">Slow Queries:</span>
            <div className="mt-1 space-y-1">
              {stats.slowQueries.map((query, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              console.clear();
              setStats({
                pageLoadTime: 0,
                queryCount: 0,
                slowQueries: [],
                cacheHitRate: 0
              });
            }}
          >
            Clear Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}