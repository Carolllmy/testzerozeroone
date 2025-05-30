import { useState, useEffect, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeState {
  touchStart: { x: number; y: number } | null;
  touchEnd: { x: number; y: number } | null;
  swiping: boolean;
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  minSwipeDistance = 50
) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    touchStart: null,
    touchEnd: null,
    swiping: false
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setSwipeState({
      touchStart: { x: e.touches[0].clientX, y: e.touches[0].clientY },
      touchEnd: null,
      swiping: true
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setSwipeState(prev => {
      if (!prev.swiping) return prev;
      return {
        ...prev,
        touchEnd: { x: e.touches[0].clientX, y: e.touches[0].clientY }
      };
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setSwipeState(prev => {
      if (!prev.touchStart || !prev.touchEnd) {
        return { touchStart: null, touchEnd: null, swiping: false };
      }

      const deltaX = prev.touchEnd.x - prev.touchStart.x;
      const deltaY = prev.touchEnd.y - prev.touchStart.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Determine if it's a horizontal or vertical swipe
      if (absX > absY && absX > minSwipeDistance) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (absY > absX && absY > minSwipeDistance) {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      return { touchStart: null, touchEnd: null, swiping: false };
    });
  }, [handlers, minSwipeDistance]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isSwiping: swipeState.swiping,
    swipeDirection: swipeState.touchEnd && swipeState.touchStart
      ? {
          x: swipeState.touchEnd.x - swipeState.touchStart.x,
          y: swipeState.touchEnd.y - swipeState.touchStart.y
        }
      : null
  };
}