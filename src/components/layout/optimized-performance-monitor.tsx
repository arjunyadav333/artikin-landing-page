import { useEffect, useState } from 'react';

// Lightweight performance monitor that only runs in development
export function OptimizedPerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);

  // Only render in development and only when explicitly requested
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white px-2 py-1 text-xs rounded opacity-50 hover:opacity-100"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Performance</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="text-xs space-y-1">
        <div>Check Network tab for auth calls</div>
        <div>React DevTools for re-renders</div>
      </div>
    </div>
  );
}