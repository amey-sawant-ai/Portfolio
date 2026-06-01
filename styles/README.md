# Styles Directory

This directory is reserved for additional CSS modules and component-specific
stylesheets that go beyond the global theme in `app/globals.css`.

## When to Use This Directory

- **Component-scoped CSS Modules**: `navbar.module.css`, `hero.module.css`
- **Three.js canvas overlays**: Styles for UI layered over the 3D scene
- **Animation keyframes**: Complex keyframe animations in separate files
- **Print styles**: If a resume/print version is needed

## Conventions

- Use CSS Modules (`.module.css`) for component-scoped styles
- Keep global theme tokens in `app/globals.css`
- Prefer Tailwind utilities for one-off styling; use CSS Modules for complex components
