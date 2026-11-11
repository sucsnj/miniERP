import { useEffect, type RefObject } from 'react';

interface UseAutoFocusOptions {
  enabled?: boolean;
  focusIntervalMs?: number;
  visibilityIntervalMs?: number;
  topOffset?: number;
}

export function useAutoFocus<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    enabled = true,
    focusIntervalMs = 60000,
    visibilityIntervalMs = 180000,
    topOffset = 70,
  }: UseAutoFocusOptions = {}
) {
  useEffect(() => {
    if (!enabled) return;

    const focusInterval = window.setInterval(() => {
      ref.current?.focus();
    }, focusIntervalMs);

    const visibilityInterval = window.setInterval(() => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isVisible = rect.top >= topOffset && rect.bottom <= window.innerHeight;
      if (isVisible) return;

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus({ preventScroll: true });
    }, visibilityIntervalMs);

    return () => {
      window.clearInterval(focusInterval);
      window.clearInterval(visibilityInterval);
    };
  }, [ref, enabled, focusIntervalMs, visibilityIntervalMs, topOffset]);
}
