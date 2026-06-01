/**
 * Shared TypeScript types for the portfolio
 * ==========================================
 * Common types used across components, pages, and utilities.
 */

/** Navigation item structure */
export interface NavItem {
  label: string;
  href: string;
}

/** Project card data structure — for the future Projects section */
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

/** Social link structure */
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

/**
 * Three.js scene configuration — will be used when 3D integration is added.
 * Defines camera, lighting, and post-processing parameters.
 */
export interface SceneConfig {
  camera: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
  fog?: {
    color: string;
    near: number;
    far: number;
  };
}

/** Generic component props with optional className override */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
