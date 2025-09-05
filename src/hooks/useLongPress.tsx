import { useCallback, useRef, useState } from 'react';

export interface LongPressOptions {
  threshold?: number; // Duration in ms for long press (default: 400ms)
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

export const useLongPress = (
  onLongPress: () => void,
  options: LongPressOptions = {}
) => {
  const { threshold = 400, onStart, onFinish, onCancel } = options;
  const isLongPressActive = useRef(false);
  const isPressed = useRef(false);
  const timerId = useRef<NodeJS.Timeout>();
  const [isLongPressing, setIsLongPressing] = useState(false);

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    // Prevent text selection on long press
    event.preventDefault();
    
    if (isPressed.current) return;
    
    isPressed.current = true;
    isLongPressActive.current = false;
    setIsLongPressing(false);
    
    onStart?.();

    timerId.current = setTimeout(() => {
      if (isPressed.current) {
        isLongPressActive.current = true;
        setIsLongPressing(true);
        
        // Trigger haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        onLongPress();
        onFinish?.();
      }
    }, threshold);
  }, [onLongPress, threshold, onStart, onFinish]);

  const cancel = useCallback(() => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    
    if (isPressed.current && !isLongPressActive.current) {
      onCancel?.();
    }
    
    isLongPressActive.current = false;
    isPressed.current = false;
    setIsLongPressing(false);
  }, [onCancel]);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    start(event);
  }, [start]);

  const onTouchEnd = useCallback(() => {
    cancel();
  }, [cancel]);

  const onTouchMove = useCallback(() => {
    cancel();
  }, [cancel]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    start(event);
  }, [start]);

  const onMouseUp = useCallback(() => {
    cancel();
  }, [cancel]);

  const onMouseLeave = useCallback(() => {
    cancel();
  }, [cancel]);

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    isLongPressing
  };
};