import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  queryTime: number;
  componentName: string;
}

export const usePerformanceMonitoring = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>();

  useEffect(() => {
    // Track component mount time
    const mountTime = Date.now() - startTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} mounted in ${mountTime}ms`);
    }

    // Track render completion
    const renderCompleteTime = Date.now();
    if (renderStartRef.current) {
      const renderDuration = renderCompleteTime - renderStartRef.current;
      console.log(`[Performance] ${componentName} rendered in ${renderDuration}ms`);
    }

    return () => {
      const unmountTime = Date.now() - startTimeRef.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} total lifecycle: ${unmountTime}ms`);
      }
    };
  }, [componentName]);

  const trackQueryPerformance = (queryName: string, startTime: number) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${queryName} completed in ${duration}ms`);
      
      // Log performance warnings
      if (duration > 2000) {
        console.warn(`[Performance Warning] ${queryName} took ${duration}ms - consider optimization`);
      }
    }
    
    return duration;
  };

  const startRender = () => {
    renderStartRef.current = Date.now();
  };

  return {
    trackQueryPerformance,
    startRender,
    componentStartTime: startTimeRef.current
  };
};

export const useQueryPerformance = (queryKey: string[]) => {
  const startTime = useRef<number>(Date.now());
  
  useEffect(() => {
    startTime.current = Date.now();
  }, [queryKey]);

  const markQueryComplete = () => {
    const duration = Date.now() - startTime.current;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Query Performance] ${queryKey.join('.')} completed in ${duration}ms`);
    }
    return duration;
  };

  return { markQueryComplete };
};