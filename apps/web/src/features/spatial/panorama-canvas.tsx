"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { ResidenceLayout } from "./residence-layout";
export const tourRooms = ["living", "kitchen", "bedroom-1", "balcony"] as const;
export default function PanoramaCanvas({
  layout,
  room,
  onRoom,
  onFallback,
  reset,
}: {
  layout: ResidenceLayout;
  room: string;
  onRoom: (id: string) => void;
  onFallback: () => void;
  reset: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    select = useRef(onRoom);
  select.current = onRoom;
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      onFallback();
      return;
    }
    let disposed = false,
      frame = 0,
      texture: THREE.Texture | undefined;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.append(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(
        72,
        el.clientWidth / el.clientHeight,
        0.1,
        100,
      );
    const geo = new THREE.SphereGeometry(30, 48, 32);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { panorama: { value: null } },
      vertexShader:
        "varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:
        "uniform sampler2D panorama; varying vec3 direction; void main(){vec3 d=normalize(direction);vec2 uv=vec2(atan(d.x,-d.z)/6.28318530718+0.5,1.0-acos(clamp(d.y,-1.0,1.0))/3.14159265359);gl_FragColor=texture2D(panorama,uv); #include <colorspace_fragment> }"
          .replace(" #include", "\n#include")
          .replace("> }", ">\n}"),
    });
    scene.add(new THREE.Mesh(geo, mat));
    new THREE.TextureLoader().load(
      `/images/tours/${layout.beds}br-${room}.webp`,
      (t) => {
        if (disposed) {
          t.dispose();
          return;
        }
        texture = t;
        t.colorSpace = THREE.SRGBColorSpace;
        mat.uniforms.panorama.value = t;
        setLoading(false);
      },
      undefined,
      () => {
        if (!disposed) onFallback();
      },
    );
    const current = layout.rooms.find((r) => r.id === room)!;
    const origin = new THREE.Vector3(
      current.x + current.w / 2,
      1.55,
      current.z + current.d / 2,
    );
    const dots = tourRooms
      .filter((id) => id !== room)
      .map((id) => {
        const r = layout.rooms.find((r) => r.id === id)!;
        const direction = new THREE.Vector3(r.x + r.w / 2, 1.1, r.z + r.d / 2)
          .sub(origin)
          .normalize()
          .multiplyScalar(10);
        const button = document.createElement("button");
        button.className = "tour-hotspot";
        button.textContent = `↗ ${r.name}`;
        button.setAttribute("aria-label", `Đi tới ${r.name}`);
        button.onclick = () => select.current(id);
        el.append(button);
        return { button, direction };
      });
    let yaw = room === "living" || room === "kitchen" ? Math.PI : 0,
      pitch = 0,
      down: { x: number; y: number; pointer: number } | null = null;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const press = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      renderer.domElement.setPointerCapture(e.pointerId);
      if (pointers.size === 1)
        down = { x: e.clientX, y: e.clientY, pointer: e.pointerId };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        down = null;
      }
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        camera.fov = THREE.MathUtils.clamp(
          camera.fov + (pinch - d) * 0.15,
          35,
          95,
        );
        camera.updateProjectionMatrix();
        pinch = d;
      } else if (down) {
        yaw -= (e.clientX - down.x) * 0.005;
        pitch = THREE.MathUtils.clamp(
          pitch + (e.clientY - down.y) * 0.005,
          -1.35,
          1.35,
        );
        down = { x: e.clientX, y: e.clientY, pointer: e.pointerId };
      }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      down = null;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.04, 35, 95);
      camera.updateProjectionMatrix();
    };
    const key = (e: KeyboardEvent) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "-"].includes(
          e.key,
        )
      )
        return;
      e.preventDefault();
      if (e.key === "ArrowLeft") yaw += 0.15;
      if (e.key === "ArrowRight") yaw -= 0.15;
      if (e.key === "ArrowUp") pitch = Math.min(1.35, pitch + 0.12);
      if (e.key === "ArrowDown") pitch = Math.max(-1.35, pitch - 0.12);
      if (e.key === "+") camera.fov = Math.max(35, camera.fov - 5);
      if (e.key === "-") camera.fov = Math.min(95, camera.fov + 5);
      camera.updateProjectionMatrix();
    };
    const lost = (e: Event) => {
      e.preventDefault();
      onFallback();
    };
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Tour 360°; phím mũi tên để nhìn quanh, cộng trừ để zoom",
    );
    canvas.addEventListener("pointerdown", press);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("keydown", key);
    canvas.addEventListener("webglcontextlost", lost);
    const resize = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    resize.observe(el);
    let last = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (document.hidden || performance.now() - last < 32) return;
      last = performance.now();
      camera.lookAt(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch),
      );
      camera.updateMatrixWorld();
      renderer.render(scene, camera);
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      for (const dot of dots) {
        const p = dot.direction.clone().project(camera);
        dot.button.hidden =
          forward.dot(dot.direction) < 0 ||
          Math.abs(p.x) > 0.87 ||
          Math.abs(p.y) > 0.83;
        dot.button.style.left = `${(p.x + 1) * 50}%`;
        dot.button.style.top = `${(1 - p.y) * 50}%`;
      }
    };
    animate();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      texture?.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      canvas.remove();
      dots.forEach((d) => d.button.remove());
    };
  }, [layout, room, onFallback, reset]);
  return (
    <div className="panorama-canvas" ref={host}>
      {loading && (
        <span className="tour-loading" role="status">
          Đang mở không gian…
        </span>
      )}
    </div>
  );
}
