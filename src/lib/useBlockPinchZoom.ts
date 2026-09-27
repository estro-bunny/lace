import { useEffect } from "react";

/**
 * Two people's thumbs landing on the screen at once — both on the rope
 * pull, or both racing to tap "Hold — I'm ready" during the hand-off — is
 * exactly the input pattern browsers use to detect a pinch-zoom gesture.
 * `touch-action: manipulation` (set globally in index.css) handles most of
 * it, but iOS Safari also fires its own proprietary `gesturestart` /
 * `gesturechange` events for pinch detection, independent of touch-action,
 * and some Android/Chrome versions still zoom on a stray multi-touch
 * `touchmove` even with touch-action set. This blocks both, app-wide, once.
 */
export function useBlockPinchZoom() {
  useEffect(() => {
    const blockGesture = (e: Event) => e.preventDefault();
    const blockMultiTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    // iOS Safari only: fires on pinch start/change/end regardless of touch-action.
    document.addEventListener("gesturestart", blockGesture, { passive: false });
    document.addEventListener("gesturechange", blockGesture, { passive: false });
    document.addEventListener("gestureend", blockGesture, { passive: false });
    // General fallback for any two-finger move that would otherwise pinch-zoom.
    document.addEventListener("touchmove", blockMultiTouchMove, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("gesturechange", blockGesture);
      document.removeEventListener("gestureend", blockGesture);
      document.removeEventListener("touchmove", blockMultiTouchMove);
    };
  }, []);
}
