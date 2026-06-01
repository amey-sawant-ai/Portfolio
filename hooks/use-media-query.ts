/**
 * useMediaQuery hook
 * ===================
 * Reactive media query matching for responsive JS logic.
 * Useful for adjusting Three.js scene parameters based on screen size.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * // Reduce particle count on mobile for performance
 */

"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
