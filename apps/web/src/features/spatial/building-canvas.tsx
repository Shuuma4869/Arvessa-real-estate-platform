"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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
  onFallback: () => void;
  onProgress: (n: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    selection = useRef(selected),
    floorRef = useRef(floor),
    towerRef = useRef(tower),
    filter = useRef(availableOnly),
    picker = useRef(onPick);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = night ? 1.1 : 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    camera.position.set(28, 23, 35);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, project.floors * 1.4, 0);
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    controls.enableDamping = !reducedQuery.matches && !motionRef.current;
    controls.minDistance = 12;
    controls.maxDistance = 75;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.update();
    scene.add(
      new THREE.AmbientLight(night ? 0xa6c6da : 0xd9eaf2, night ? 0.45 : 0.65),
    );
    const sun = new THREE.DirectionalLight(
      night ? 0xadc7df : 0xffedce,
      night ? 1 : 2.3,
    );
    sun.position.set(15, 35, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -35,
      right: 35,
      top: 35,
      bottom: -35,
      near: 1,
      far: 100,
    });
    sun.shadow.normalBias = 0.08;
    scene.add(sun);
    const materials: THREE.Material[] = [],
      geometries: THREE.BufferGeometry[] = [];
    const box = (
      w: number,
      h: number,
      d: number,
      color: number,
      x: number,
      y: number,
      z: number,
    ) => {
      const g = new THREE.BoxGeometry(w, h, d),
        m = new THREE.MeshStandardMaterial({ color, roughness: 0.52 });
      geometries.push(g);
      materials.push(m);
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };
    box(
      project.towers.length * 13 + 8,
      0.4,
      23,
      night ? 0x35473a : 0xd7d0bb,
      0,
      -0.5,
      0,
    );
    const water = box(7, 0.15, 18, night ? 0x124c63 : 0x3d9aaa, 0, -0.23, 1);
    water.material.roughness = 0.12;
    water.material.metalness = 0.5;
    water.castShadow = false;
    const unitMeshes: THREE.Mesh<
      THREE.BoxGeometry,
      THREE.MeshStandardMaterial
    >[] = [];
    for (let ti = 0; ti < project.towers.length; ti++) {
      const tower = project.towers[ti],
        offset = (ti - (project.towers.length - 1) / 2) * 15;
      box(10, 0.5, 9, 0xc8bc9f, offset, 0.1, 0);
      for (let f = 1; f <= project.floors; f++) {
        const y = f * 2.6;
        box(10.5, 0.28, 9.5, night ? 0x958c73 : 0xe5dbc3, offset, y - 1.15, 0);
        for (let n = 1; n <= 4; n++) {
          const p = properties.find(
            (p) => p.tower === tower && p.floor === f && p.number === n,
          );
          if (!p) continue;
          const mesh = box(
            4.45,
            2.15,
            3.85,
            0x658477,
            offset + (n % 2 ? -2.3 : 2.3),
            y,
            n <= 2 ? -2.1 : 2.1,
          );
          mesh.userData.propertyId = p.id;
          mesh.castShadow = false;
          mesh.material.roughness = 0.18;
          mesh.material.metalness = 0.48;
          mesh.material.envMapIntensity = 1.3;
          mesh.userData.floor = f;
          mesh.userData.tower = tower;
          mesh.userData.availability = p.availability;
          unitMeshes.push(mesh);
          for (let column = 0; column < 3; column++)
            box(
              0.09,
              2.22,
              0.1,
              0xb8a887,
              mesh.position.x - 1.5 + column * 1.5,
              y,
              mesh.position.z + (n <= 2 ? -1.96 : 1.96),
            );
        }
        box(0.25, 2.6, 9.5, 0xd8ccb1, offset - 5, y - 0.1, 0);
        box(0.25, 2.6, 9.5, 0xd8ccb1, offset + 5, y - 0.1, 0);
      }
      box(10.8, 0.4, 9.8, 0xbeb294, offset, project.floors * 2.6 + 1.25, 0);
      // A planted roof and parapet express the same material language as the imagery.
      box(8.5, 0.18, 7.5, 0x456e59, offset, project.floors * 2.6 + 1.55, 0);
      for (const side of [-1, 1])
        box(
          10.7,
          0.65,
          0.12,
          0xc0ae8e,
          offset,
          project.floors * 2.6 + 1.7,
          side * 4.7,
        );
    }
    for (let i = 0; i < 12; i++) {
      const x = (i % 2 ? 1 : -1) * (project.towers.length * 6 + 4),
        z = -9 + Math.floor(i / 2) * 3.4;
      box(0.18, 1.5, 0.18, 0x72654c, x, 0.5, z);
      const g = new THREE.SphereGeometry(0.9, 10, 8),
        m = new THREE.MeshStandardMaterial({
          color: night ? 0x294c3d : 0x637e56,
          roughness: 1,
        });
      geometries.push(g);
      materials.push(m);
      const tree = new THREE.Mesh(g, m);
      tree.castShadow = true;
      tree.receiveShadow = true;
      tree.position.set(x, 1.7, z);
      tree.scale.set(1, 1.45, 1);
      scene.add(tree);
    }
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
      return raycaster.intersectObjects(
        unitMeshes.filter(
          (m) =>
            (!floorRef.current || m.userData.floor === floorRef.current) &&
            (!towerRef.current || m.userData.tower === towerRef.current) &&
            (!filter.current || m.userData.availability === "AVAILABLE"),
        ),
      )[0]?.object.userData.propertyId as string | undefined;
    };
    const move = (e: PointerEvent) => {
      hover = hit(e) || "";
      renderer.domElement.style.cursor = hover ? "pointer" : "grab";
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
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    resize.observe(container);
    const colors: Record<string, number> = {
      AVAILABLE: night ? 0x42899a : 0x4a90a1,
      HELD: 0xb69a59,
      RESERVED: 0x8b8e81,
      SOLD: 0x5d6662,
    };
    let lastView = "perspective",
      transitioning = false;
    const destination = camera.position.clone();
    const target = controls.target.clone();
    const cancelTransition = () => {
      transitioning = false;
    };
    controls.addEventListener("start", cancelTransition);
    let lastTime = 0;
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
            ? [0, h + 3, 43]
            : lastView === "aerial"
              ? [15, 48, 18]
              : [28, 23, 35]) as [number, number, number]),
        );
        target.set(0, h, 0);
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
        m.material.transparent = dim;
        m.material.opacity = dim ? 0.16 : 1;
        m.material.emissive.setHex(
          selected ? 0x59401b : night ? 0x122b35 : 0x000000,
        );
      }
      controls.update();
      renderer.render(scene, camera);
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
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [project, properties, night, onFallback, onProgress]);
  return (
    <div
      ref={host}
      style={{ position: "absolute", inset: 0 }}
      role="img"
      aria-label={`Mô hình 3D ${project.name}. Dùng chuột hoặc chạm để xoay. Các căn có lựa chọn bàn phím tương đương ở bảng bên cạnh.`}
    />
  );
}
