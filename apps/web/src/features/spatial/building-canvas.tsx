"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createArchitecturalModel } from "./architectural-model";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Property, Project } from "@/domain/types";
export default function BuildingCanvas({
  project,
  properties,
  selected,
  floor,
  tower,
  availableOnly,
  night,
  cameraView,
  reducedMotion,
  onPick,
  onTowerPick,
  onFallback,
  onProgress,
}: {
  project: Project;
  properties: Property[];
  selected: string;
  floor: number;
  tower: string;
  availableOnly: boolean;
  night: boolean;
  cameraView: string;
  reducedMotion: boolean;
  onPick: (id: string) => void;
  onTowerPick?: (tower: string) => void;
  onFallback: () => void;
  onProgress: (n: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    selection = useRef(selected),
    floorRef = useRef(floor),
    towerRef = useRef(tower),
    filter = useRef(availableOnly),
    picker = useRef(onPick);
  const towerPicker = useRef(onTowerPick);
  towerPicker.current = onTowerPick;
  const viewRef = useRef(cameraView),
    motionRef = useRef(reducedMotion);
  viewRef.current = cameraView;
  motionRef.current = reducedMotion;
  selection.current = selected;
  floorRef.current = floor;
  towerRef.current = tower;
  filter.current = availableOnly;
  picker.current = onPick;
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      onFallback();
      return;
    }
    onProgress(20);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, container.clientWidth < 600 ? 1 : 1.5),
    );
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = night ? 1.1 : 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(
        38,
        container.clientWidth / container.clientHeight,
        0.1,
        250,
      );
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = night ? 0.25 : 0.65;
    room.dispose();
    pmrem.dispose();
    camera.position.set(45, 34, 57);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, project.floors * 1.4, 0);
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    controls.enableDamping = !reducedQuery.matches && !motionRef.current;
    controls.minDistance = 22;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.update();
    scene.add(
      new THREE.AmbientLight(night ? 0xa6c6da : 0xd9eaf2, night ? 0.45 : 0.65),
    );
    const sun = new THREE.DirectionalLight(
      night ? 0xadc7df : 0xffedce,
      night ? 1 : 2.3,
    );
    sun.position.set(-25, 42, 25);
    sun.castShadow = true;
    const shadowSize = container.clientWidth < 600 ? 1024 : 2048;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(sun.shadow.camera, {
      left: -55,
      right: 55,
      top: 55,
      bottom: -55,
      near: 1,
      far: 160,
    });
    sun.shadow.normalBias = 0.08;
    scene.add(sun);
    const model = createArchitecturalModel(project, properties, night);
    scene.add(model.root);
    const unitMeshes = model.units;
    const labels = new CSS2DRenderer();
    labels.setSize(container.clientWidth, container.clientHeight);
    Object.assign(labels.domElement.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
    });
    container.appendChild(labels.domElement);
    for (const [tower, position] of model.towerPositions) {
      const button = document.createElement("button");
      button.className = "tower-scene-label";
      button.textContent = `Tháp ${tower} · ${properties.filter((p) => p.tower === tower && p.availability === "AVAILABLE").length} căn trống`;
      button.setAttribute("aria-label", `Khám phá tháp ${tower}`);
      button.style.pointerEvents = "auto";
      button.onclick = () => towerPicker.current?.(tower);
      const label = new CSS2DObject(button);
      label.position.copy(position);
      scene.add(label);
    }
    const tooltip = document.createElement("span");
    tooltip.className = "unit-scene-tooltip";
    tooltip.hidden = true;
    container.appendChild(tooltip);
    onProgress(90);
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let hover = "",
      down = { x: 0, y: 0 },
      frame = 0,
      disposed = false;
    const hit = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const unitHit = raycaster.intersectObjects(
        unitMeshes.filter(
          (m) =>
            (!floorRef.current || m.userData.floor === floorRef.current) &&
            (!towerRef.current || m.userData.tower === towerRef.current) &&
            (!filter.current || m.userData.availability === "AVAILABLE"),
        ),
      )[0];
      if (!unitHit) return undefined;
      const opaque = raycaster.intersectObject(model.root, true).find((hit) => {
        const mesh = hit.object as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.Material
        >;
        return (
          !mesh.userData.propertyId &&
          mesh.material &&
          !mesh.material.transparent
        );
      });
      if (opaque && opaque.distance < unitHit.distance - 0.03) return undefined;
      return unitHit.object.userData.propertyId as string;
    };
    const move = (e: PointerEvent) => {
      hover = hit(e) || "";
      renderer.domElement.style.cursor = hover ? "pointer" : "grab";
      const p = properties.find((p) => p.id === hover);
      tooltip.hidden = !p;
      if (p)
        tooltip.textContent = `${p.id} · ${p.beds} PN · ${p.area} m² · ${p.availability}`;
    };
    const press = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const release = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 7) {
        const id = hit(e);
        if (id) picker.current(id);
      }
    };
    const lost = (e: Event) => {
      e.preventDefault();
      onFallback();
    };
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerdown", press);
    renderer.domElement.addEventListener("pointerup", release);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const resize = new ResizeObserver(() => {
      const w = container.clientWidth,
        h = container.clientHeight;
      if (w && h) {
        renderer.setSize(w, h);
        labels.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    resize.observe(container);
    const colors: Record<string, number> = {
      AVAILABLE: night ? 0x806e49 : 0x6e8d80,
      HELD: 0xb69a59,
      RESERVED: 0x8b8e81,
      SOLD: 0x5d6662,
    };
    let lastView = "",
      transitioning = false;
    const destination = camera.position.clone();
    const target = controls.target.clone();
    const cancelTransition = () => {
      transitioning = false;
    };
    controls.addEventListener("start", cancelTransition);
    let lastTime = 0,
      previousState = "",
      firstFrame = true;
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      // Cap to 30 FPS and suspend drawing in background tabs.
      const time = performance.now();
      if (document.hidden || time - lastTime < 32) return;
      const elapsed = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const reduce = reducedQuery.matches || motionRef.current;
      controls.enableDamping = !reduce;
      if (lastView !== viewRef.current) {
        lastView = viewRef.current;
        const h = project.floors * 1.4;
        destination.set(
          ...((lastView === "front"
            ? [0, h + 9, 80]
            : lastView === "aerial"
              ? [25, 72, 44]
              : [45, 34, 57]) as [number, number, number]),
        );
        target.set(0, h, 0);
        destination
          .sub(target)
          .multiplyScalar(Math.max(1, 1.4 / camera.aspect))
          .add(target);
        transitioning = true;
      }
      if (transitioning) {
        const speed = reduce ? 1 : 1 - Math.exp(-elapsed * 6);
        camera.position.lerp(destination, speed);
        controls.target.lerp(target, speed);
        if (camera.position.distanceTo(destination) < 0.02)
          transitioning = false;
      }
      for (const m of unitMeshes) {
        const id = m.userData.propertyId,
          selected = id === selection.current,
          highlight = id === hover;
        const dim =
          (floorRef.current > 0 && m.userData.floor !== floorRef.current) ||
          (towerRef.current !== "" && m.userData.tower !== towerRef.current) ||
          (filter.current && m.userData.availability !== "AVAILABLE");
        m.material.color.setHex(
          selected
            ? 0xd8b35d
            : highlight
              ? 0xb7c995
              : colors[m.userData.availability] || 0x5c8171,
        );
        m.material.transparent = true;
        m.material.opacity = dim ? 0.13 : selected || highlight ? 0.92 : 0.65;
        m.material.emissive.setHex(
          selected ? 0x59401b : night ? 0x122b35 : 0x000000,
        );
      }
      const changed = controls.update();
      const state = [
        selection.current,
        floorRef.current,
        towerRef.current,
        filter.current,
        hover,
        camera.aspect,
      ].join("|");
      if (!firstFrame && !changed && !transitioning && previousState === state)
        return;
      firstFrame = false;
      previousState = state;
      renderer.render(scene, camera);
      labels.render(scene, camera);
      renderer.domElement.dataset.drawCalls = String(
        renderer.info.render.calls,
      );
      renderer.domElement.dataset.triangles = String(
        renderer.info.render.triangles,
      );
      renderer.domElement.dataset.inventory = String(unitMeshes.length);
    };
    animate();
    onProgress(100);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      controls.removeEventListener("start", cancelTransition);
      environment.dispose();
      sun.shadow.map?.dispose();
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerdown", press);
      renderer.domElement.removeEventListener("pointerup", release);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      model.dispose();
      labels.domElement.remove();
      tooltip.remove();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [project, properties, night, onFallback, onProgress]);
  return (
    <div
      ref={host}
      style={{ position: "absolute", inset: 0 }}
      role="group"
      aria-label={`Mô hình 3D ${project.name}. Dùng chuột hoặc chạm để xoay. Các căn có lựa chọn bàn phím tương đương ở bảng bên cạnh.`}
    />
  );
}
