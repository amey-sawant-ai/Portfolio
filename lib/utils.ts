/**
 * Utility functions
 * =================
 * General-purpose helpers used across the portfolio.
 */

import { type ClassValue, clsx } from "clsx";

/**
 * Merges class names conditionally.
 * Combines clsx for conditional classes. Add tailwind-merge later if needed.
 *
 * @example cn("base-class", isActive && "active", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Formats a date string into a human-readable format.
 *
 * @example formatDate("2024-01-15") → "January 15, 2024"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Creates a debounced version of a function.
 * Useful for scroll/resize event handlers and Three.js resize callbacks.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
