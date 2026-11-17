"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createInterior } from "./interior-model";
import type { ResidenceLayout } from "./residence-layout";
export default function ResidenceCanvas({
  layout,
  selected,
  onSelect,
  onFallback,
  reset,
  reducedMotion,
}: {
  layout: ResidenceLayout;
  selected: string;
  onSelect: (id: string) => void;
  onFallback: () => void;
  reset: number;
  reducedMotion: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    pick = useRef(onSelect),
    room = useRef(selected),
    resetRef = useRef(reset),
    motion = useRef(reducedMotion);
  pick.current = onSelect;
  room.current = selected;
  resetRef.current = reset;
  motion.current = reducedMotion;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onFallback();
      return;
    }
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, el.clientWidth < 600 ? 1 : 1.5),
    );
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    el.append(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(
        40,
        el.clientWidth / el.clientHeight,
        0.1,
        120,
      ),
      model = createInterior(layout);
    scene.add(model.root);
    const pmrem = new THREE.PMREMGenerator(renderer),
      envRoom = new RoomEnvironment(),
      env = pmrem.fromScene(envRoom, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.45;
    envRoom.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xf5f0dc, 0x5a6350, 2));
    const sun = new THREE.DirectionalLight(0xffe3b3, 3.5);
    sun.position.set(-8, 16, 9);
    sun.castShadow = true;
    const shadowSize = el.clientWidth < 600 ? 1024 : 2048;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(sun.shadow.camera, {
      left: -18,
      right: 18,
      top: 18,
      bottom: -18,
      near: 1,
      far: 50,
    });
    sun.shadow.normalBias = 0.025;
    scene.add(sun);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 7;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI * 0.46;
    const home = new THREE.Vector3(layout.width * 1.03, 15, 17);
    camera.position.copy(home);
    controls.target.set(0, 0, 0);
    controls.update();
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const press = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
    const release = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(model.pickers)[0];
      if (hit) pick.current(hit.object.userData.roomId);
    };
    const lost = (e: Event) => {
      e.preventDefault();
      onFallback();
    };
    renderer.domElement.addEventListener("pointerdown", press);
    renderer.domElement.addEventListener("pointerup", release);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const observer = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    observer.observe(el);
    let frame = 0,
      last = 0,
      previousReset = resetRef.current,
      previousRoom = room.current,
      transition = false,
      previousState = "",
      renderCount = 0;
    const target = new THREE.Vector3(),
      destination = home.clone();
    controls.addEventListener("start", () => (transition = false));
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (document.hidden || performance.now() - last < 32) return;
      last = performance.now();
      const reduced =
        motion.current ||
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      controls.enableDamping = !reduced;
      if (previousReset !== resetRef.current) {
        previousReset = resetRef.current;
        target.set(0, 0, 0);
        destination.copy(home);
        transition = true;
      }
      if (previousRoom !== room.current) {
        previousRoom = room.current;
        const r = layout.rooms.find((r) => r.id === room.current);
        if (r) {
          target.set(
            r.x + r.w / 2 - layout.width / 2,
            0.3,
            r.z + r.d / 2 - layout.depth / 2,
          );
          destination.copy(target).add(new THREE.Vector3(8, 12, 13));
          transition = true;
        }
      }
      if (transition) {
        camera.position.lerp(destination, reduced ? 1 : 0.09);
        controls.target.lerp(target, reduced ? 1 : 0.09);
        if (camera.position.distanceTo(destination) < 0.02) transition = false;
      }
      for (const mesh of model.pickers) {
        const m = mesh.material as THREE.MeshBasicMaterial;
        m.color.setHex(0xc4a467);
        m.opacity = mesh.userData.roomId === room.current ? 0.16 : 0;
      }
      const changed = controls.update();
      const state = [
        room.current,
        resetRef.current,
        el.clientWidth,
        el.clientHeight,
      ].join("|");
      if (renderCount && !changed && !transition && previousState === state)
        return;
      previousState = state;
      renderer.render(scene, camera);
      renderer.domElement.dataset.renderCount = String(++renderCount);
      renderer.domElement.dataset.drawCalls = String(
        renderer.info.render.calls,
      );
      renderer.domElement.dataset.rooms = String(model.pickers.length);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      model.dispose();
      env.dispose();
      sun.shadow.map?.dispose();
      renderer.domElement.removeEventListener("pointerdown", press);
      renderer.domElement.removeEventListener("pointerup", release);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [layout, onFallback]);
  return (
    <div
      ref={host}
      className="residence-canvas"
      role="group"
      aria-label="Dollhouse 3D có nội thất; kéo để xoay, cuộn để phóng to"
    />
  );
}
