/**
 * Components barrel export
 * =========================
 * Re-export all shared components from here.
 * Components will be added as the portfolio sections are built.
 *
 * Future exports:
 * export { Navbar } from "./navbar";
 * export { Footer } from "./footer";
 * export { Section } from "./section";
 * export { ProjectCard } from "./project-card";
 * export { CosmicBackground } from "./cosmic-background";
 */

export { CinematicLoader } from "./CinematicLoader";
export { StoryCanvas } from "./StoryCanvas";
export { CosmicTerminal } from "./CosmicTerminal";
export { CosmicChatbot } from "./CosmicChatbot";
export { WebGLFallback } from "./WebGLFallback";

// Explorable Planet Worlds
export { default as ProjectsWorld } from "./worlds/ProjectsWorld";
export { default as SkillsWorld } from "./worlds/SkillsWorld";
export { default as ExperienceWorld } from "./worlds/ExperienceWorld";
export { default as ContactWorld } from "./worlds/ContactWorld";
export { default as ResumeWorld } from "./worlds/ResumeWorld";
export { default as CreatorWorld } from "./worlds/CreatorWorld";
export { SectionOverlays } from "./SectionOverlays";

