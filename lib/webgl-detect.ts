/**
 * WebGL Feature Detection
 * ========================
 * Detects whether the browser/GPU supports WebGL context creation.
 * Used to decide whether to render the Three.js StoryCanvas or a
 * CSS-only fallback experience.
 */

let _webGLSupported: boolean | null = null;

export function isWebGLAvailable(): boolean {
  if (_webGLSupported !== null) return _webGLSupported;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    _webGLSupported = gl !== null;
  } catch {
    _webGLSupported = false;
  }

  return _webGLSupported;
}
