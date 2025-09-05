import { useEffect, useRef, useState } from 'react';

export interface ViewportInfo {
  height: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
}

export const useVisualViewport = () => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    height: window.innerHeight,
    keyboardHeight: 0,
    isKeyboardOpen: false
  });
  
  const initialHeight = useRef(window.innerHeight);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Store initial height
    initialHeight.current = window.innerHeight;

    const handleViewportChange = () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Use visual viewport API if available (preferred on iOS Safari)
      if ('visualViewport' in window && window.visualViewport) {
        const visualViewport = window.visualViewport;
        const keyboardHeight = initialHeight.current - visualViewport.height;
        const isKeyboardOpen = keyboardHeight > 100; // Threshold for keyboard detection

        setViewportInfo({
          height: visualViewport.height,
          keyboardHeight: Math.max(0, keyboardHeight),
          isKeyboardOpen
        });
      } else {
        // Fallback to window.innerHeight
        const currentHeight = window.innerHeight;
        const keyboardHeight = initialHeight.current - currentHeight;
        const isKeyboardOpen = keyboardHeight > 100;

        setViewportInfo({
          height: currentHeight,
          keyboardHeight: Math.max(0, keyboardHeight),
          isKeyboardOpen
        });
      }
    };

    const handleResize = () => {
      // Debounce resize events
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(handleViewportChange, 150);
    };

    // Set up event listeners
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialHeight.current = window.innerHeight;
        handleViewportChange();
      }, 500); // Wait for orientation change to complete
    });

    // Initial call
    handleViewportChange();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  return viewportInfo;
};