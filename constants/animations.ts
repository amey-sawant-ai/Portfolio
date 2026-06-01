/**
 * Animation constants for the cosmic/futuristic theme
 * ====================================================
 * Shared timing, easing, and duration values for consistent motion design.
 * These will be used by CSS transitions, Framer Motion, and Three.js animations.
 */

/** Standard easing curves */
export const EASING = {
  /** Smooth deceleration — primary ease for entrances */
  easeOut: [0.16, 1, 0.3, 1] as const,
  /** Smooth acceleration — primary ease for exits */
  easeIn: [0.6, 0, 0.84, 0] as const,
  /** Balanced — general purpose transitions */
  easeInOut: [0.65, 0, 0.35, 1] as const,
  /** Cosmic float — gentle, organic movement for background elements */
  cosmicFloat: [0.25, 0.46, 0.45, 0.94] as const,
} as const;

/** Standard durations in seconds */
export const DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  /** Page transition duration */
  pageTransition: 0.8,
  /** Stagger delay between sequential items */
  stagger: 0.08,
} as const;

/**
 * CSS custom property names for animation values.
 * These are set in globals.css and consumed here for JS/CSS consistency.
 */
export const ANIMATION_CSS_VARS = {
  transitionDuration: "--transition-duration",
  transitionEasing: "--transition-easing",
} as const;
