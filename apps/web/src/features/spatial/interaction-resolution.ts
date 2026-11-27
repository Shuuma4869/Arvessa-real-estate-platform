import type { WebGLRenderer } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

/** Keep the idle image intact; bound raster work during software-rendered gestures. */
export function interactionResolution(
  renderer: WebGLRenderer,
  controls: OrbitControls,
  invalidate: () => void,
) {
  const gl = renderer.getContext();
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const device = debug
    ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
    : "unknown";
  const software = /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(
    device,
  );
  const fullRatio = renderer.getPixelRatio();
  let active = false;
  let restore: ReturnType<typeof setTimeout> | undefined;
  renderer.domElement.dataset.renderer = device;
  renderer.domElement.dataset.renderScale = String(fullRatio);
  const scale = (ratio: number) => {
    if (renderer.getPixelRatio() === ratio) return;
    renderer.setPixelRatio(ratio);
    renderer.domElement.dataset.renderScale = String(ratio);
    invalidate();
  };
  const scheduleRestore = () => {
    clearTimeout(restore);
    restore = setTimeout(() => {
      restore = undefined;
      scale(fullRatio);
    }, 240);
  };
  const start = () => {
    active = true;
    clearTimeout(restore);
    restore = undefined;
  };
  const change = () => {
    if (software && (active || restore !== undefined)) {
      scale(Math.min(fullRatio, 0.65));
      if (!active) scheduleRestore();
    }
  };
  const end = () => {
    active = false;
    if (software && renderer.getPixelRatio() !== fullRatio) scheduleRestore();
  };
  controls.addEventListener("start", start);
  controls.addEventListener("change", change);
  controls.addEventListener("end", end);
  return () => {
    clearTimeout(restore);
    controls.removeEventListener("start", start);
    controls.removeEventListener("change", change);
    controls.removeEventListener("end", end);
  };
}
