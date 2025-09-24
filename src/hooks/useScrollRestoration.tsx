import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SCROLL_STORAGE_KEY = 'route-scroll-positions';
const LAST_ROUTE_KEY = 'last-visited-route';

export const useScrollRestoration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Save current scroll position before navigating
  const saveScrollPosition = useCallback((routeKey?: string) => {
    const key = routeKey || location.pathname;
    const scrollY = window.scrollY;
    
    try {
      const savedPositions = JSON.parse(sessionStorage.getItem(SCROLL_STORAGE_KEY) || '{}');
      savedPositions[key] = scrollY;
      sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(savedPositions));
    } catch (error) {
      console.warn('Failed to save scroll position:', error);
    }
  }, [location.pathname]);

  // Restore scroll position for current route
  const restoreScrollPosition = useCallback(() => {
    const key = location.pathname;
    
    try {
      const savedPositions = JSON.parse(sessionStorage.getItem(SCROLL_STORAGE_KEY) || '{}');
      const savedScrollY = savedPositions[key];
      
      if (typeof savedScrollY === 'number') {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollY);
        });
      }
    } catch (error) {
      console.warn('Failed to restore scroll position:', error);
    }
  }, [location.pathname]);

  // Navigate with scroll position saving and proper history management
  const navigateWithScrollSave = useCallback((
    path: string, 
    options?: { replace?: boolean; state?: any }
  ) => {
    saveScrollPosition();
    // Save current route as last visited (unless it's auth-related)
    if (!location.pathname.includes('/auth')) {
      try {
        sessionStorage.setItem(LAST_ROUTE_KEY, location.pathname);
      } catch (error) {
        console.warn('Failed to save last route:', error);
      }
    }
    // Ensure replace defaults to false to maintain proper history
    navigate(path, { replace: false, ...options });
  }, [navigate, saveScrollPosition, location.pathname]);

  // Restore last visited page (useful for app reloads)
  const restoreLastVisitedPage = useCallback(() => {
    try {
      const lastRoute = sessionStorage.getItem(LAST_ROUTE_KEY);
      if (lastRoute && lastRoute !== location.pathname && !lastRoute.includes('/auth')) {
        return lastRoute;
      }
    } catch (error) {
      console.warn('Failed to get last route:', error);
    }
    return null;
  }, [location.pathname]);

  // Clear last visited route (useful when user logs out)
  const clearLastVisitedPage = useCallback(() => {
    try {
      sessionStorage.removeItem(LAST_ROUTE_KEY);
    } catch (error) {
      console.warn('Failed to clear last route:', error);
    }
  }, []);

  // Restore scroll position when route changes
  useEffect(() => {
    // Only restore if navigating back (not initial page load or forward navigation)
    if (window.history.state && window.history.state.key) {
      const timeoutId = setTimeout(() => {
        restoreScrollPosition();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, restoreScrollPosition]);

  // Save scroll position before page unload and route changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
      // Save current route as last visited on page unload
      if (!location.pathname.includes('/auth')) {
        try {
          sessionStorage.setItem(LAST_ROUTE_KEY, location.pathname);
        } catch (error) {
          console.warn('Failed to save last route on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveScrollPosition, location.pathname]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    navigateWithScrollSave,
    restoreLastVisitedPage,
    clearLastVisitedPage
  };
};
};