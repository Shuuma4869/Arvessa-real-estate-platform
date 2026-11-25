"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { residenceLayout } from "./residence-layout";

type Props = {
  sceneName: "Stillwater" | "A0302";
  selected: string;
  onSelect: (id: string) => void;
  reset: number;
  view: "perspective" | "aerial";
  quality?: "balanced" | "high";
};
type UnitPosition = { id: string; blender: number[]; size: number[] };

/** A real GLB preview. Offline Cycles photographs are a separate, labelled view. */
export default function FlagshipCanvas({
  sceneName,
  selected,
  onSelect,
  reset,
  view,
  quality = "balanced",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const selection = useRef(selected),
    callback = useRef(onSelect);
  selection.current = selected;
  callback.current = onSelect;
  const [status, setStatus] = useState("Đang tải mô hình và vật liệu…");
  const [failure, setFailure] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [metrics, setMetrics] = useState("");
  const benchmarkRequest = useRef(false);
  const [benchmarkResult, setBenchmarkResult] = useState("");
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    delete el.dataset.loaded;
    delete el.dataset.firstFrameMs;
    delete el.dataset.benchmark;
    el.dataset.frames = "0";
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setFailure(true);
      setStatus(
        "Thiết bị chưa mở được WebGL. Có thể xem các ảnh render bên cạnh.",
      );
      return;
    }
    const interior = sceneName === "A0302";
    let disposed = false,
      frame = 0,
      dirty = true;
    const start = performance.now();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe4e3db);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, el.clientWidth < 650 ? 1 : 1.5),
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.domElement.setAttribute(
      "aria-label",
      interior
        ? "Mô hình GLB căn A0302, kéo để xoay"
        : "Mô hình GLB Stillwater, kéo để xoay và chọn căn",
    );
    renderer.domElement.setAttribute("tabindex", "0");
    el.append(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(renderer.domElement);
    controls.enableDamping = false;
    controls.minDistance = interior ? 6 : 35;
    controls.maxDistance = interior ? 30 : 170;
    controls.maxPolarAngle = Math.PI * 0.49;
    const target = interior
      ? new THREE.Vector3(5.12, 0.3, 5.22)
      : new THREE.Vector3(0, 5, 0);
    camera.position.set(
      ...((interior
        ? [17, 15, 23]
        : view === "aerial"
          ? [64, 83, 75]
          : [66, 35, 88]) as [number, number, number]),
    );
    controls.target.copy(target);
    controls.update();
    const invalidate = () => {
      dirty = true;
    };
    controls.addEventListener("change", invalidate);
    scene.add(new THREE.HemisphereLight(0xfaf5e8, 0x555b48, 0.8));
    const sun = new THREE.DirectionalLight(0xffeed6, 2.3);
    sun.position.set(-30, 60, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const radius = interior ? 13 : 52;
    Object.assign(sun.shadow.camera, {
      left: -radius,
      right: radius,
      top: radius,
      bottom: -radius,
      near: 1,
      far: 140,
    });
    sun.shadow.normalBias = interior ? 0.04 : 0.12;
    sun.shadow.bias = -0.0003;
    sun.target.position.copy(target);
    scene.add(sun, sun.target);
    const pmrem = new THREE.PMREMGenerator(renderer);
    let env: THREE.WebGLRenderTarget | undefined;
    const textures = new Set<THREE.Texture>(),
      geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>();
    const disposeTree = (root: THREE.Object3D) =>
      root.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        geometries.add(o.geometry);
        for (const material of Array.isArray(o.material)
          ? o.material
          : [o.material]) {
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
      });
    new HDRLoader().load(
      "/spatial-flagships/daylight.hdr",
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        env = pmrem.fromEquirectangular(texture);
        scene.environment = env.texture;
        scene.environmentIntensity = 0.7;
        texture.dispose();
        invalidate();
      },
      undefined,
      () => {
        /* Hemisphere and direct light remain usable if HDRI fails. */
      },
    );
    const pickers: THREE.Mesh[] = [];
    const pickerMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    materials.add(pickerMaterial);
    const addPicker = (
      id: string,
      size: [number, number, number],
      position: [number, number, number],
    ) => {
      const geometry = new THREE.BoxGeometry(...size);
      geometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, pickerMaterial);
      mesh.position.set(...position);
      mesh.userData.id = id;
      pickers.push(mesh);
      scene.add(mesh);
    };
    if (interior) {
      const layout = residenceLayout(2, 107),
        scale = Math.sqrt(107 / (layout.width * layout.depth));
      layout.rooms.forEach((room) =>
        addPicker(
          room.id,
          [room.w * scale, 0.08, room.d * scale],
          [(room.x + room.w / 2) * scale, 0.08, (room.z + room.d / 2) * scale],
        ),
      );
    } else {
      fetch("/spatial-flagships/stillwater-interaction.json")
        .then((r) => {
          if (!r.ok) throw new Error("Inventory");
          return r.json();
        })
        .then((units: UnitPosition[]) => {
          if (disposed) return;
          units.forEach((u) =>
            addPicker(
              u.id,
              [u.size[0], u.size[2], 0.14],
              [u.blender[0], u.blender[2], -u.blender[1]],
            ),
          );
          invalidate();
        })
        .catch(() => {
          if (!disposed)
            setStatus(
              "Không tải được vùng chọn căn. Dùng danh sách căn bên cạnh.",
            );
        });
    }
    const marker = new THREE.Box3Helper(new THREE.Box3(), 0xb08c4e);
    marker.visible = false;
    scene.add(marker);
    geometries.add(marker.geometry);
    materials.add(marker.material as THREE.Material);
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
      `/spatial-flagships/${sceneName}${quality === "balanced" ? "-balanced" : ""}.glb`,
      (gltf) => {
        disposeTree(gltf.scene);
        if (disposed) {
          geometries.forEach((g) => g.dispose());
          materials.forEach((m) => m.dispose());
          textures.forEach((t) => t.dispose());
          return;
        }
        gltf.scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            // Thin glazing does not cast opaque shadow-map rectangles.
            const surfaces = Array.isArray(o.material)
              ? o.material
              : [o.material];
            if (
              surfaces.some(
                (m) =>
                  m instanceof THREE.MeshPhysicalMaterial && m.transmission > 0,
              )
            ) {
              o.castShadow = false;
            }
            for (const m of surfaces) {
              // The balanced preview uses environment-reflective alpha glass.
              // Full screen-space refraction remains available in high quality.
              if (
                quality === "balanced" &&
                m instanceof THREE.MeshPhysicalMaterial &&
                m.transmission > 0
              ) {
                m.transmission = 0;
                m.transparent = true;
                m.opacity = 0.22;
                m.depthWrite = false;
              }
              if (
                m instanceof THREE.MeshStandardMaterial &&
                /leaves/i.test(m.name)
              ) {
                m.side = THREE.DoubleSide;
                m.alphaTest = 0.35;
                m.transparent = false;
              }
            }
          }
        });
        scene.add(gltf.scene);
        let estimatedTextureBytes = 0;
        textures.forEach((texture) => {
          const image = texture.image as
            { width?: number; height?: number } | undefined;
          estimatedTextureBytes +=
            ((image?.width || 0) * (image?.height || 0) * 4 * 4) / 3;
        });
        el.dataset.textureBytesEstimate = String(
          Math.round(estimatedTextureBytes),
        );
        renderer.shadowMap.needsUpdate = true;
        el.dataset.loaded = "true";
        el.dataset.loadMs = String(Math.round(performance.now() - start));
        setStatus("");
        invalidate();
      },
      undefined,
      () => {
        if (!disposed) {
          setFailure(true);
          setStatus("Chưa tải được mô hình. Thử lại hoặc xem ảnh render.");
        }
      },
    );
    let down = { x: 0, y: 0 };
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const press = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY };
    };
    const release = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 7)
        return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(pickers)[0];
      if (hit) callback.current(hit.object.userData.id);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      setFailure(true);
      setStatus("WebGL đã tạm dừng. Bấm thử lại để khôi phục mô hình.");
    };
    renderer.domElement.addEventListener("pointerdown", press);
    renderer.domElement.addEventListener("pointerup", release);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const resize = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      invalidate();
    });
    resize.observe(el);
    let previousSelection = "";
    let benchmarkStart = 0,
      benchmarkLast = 0;
    let frameTimes: number[] = [];
    const benchmarkOrigin = new THREE.Vector3();
    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      if (benchmarkRequest.current && el.dataset.loaded === "true") {
        benchmarkRequest.current = false;
        benchmarkStart = now;
        benchmarkLast = 0;
        frameTimes = [];
        benchmarkOrigin.copy(camera.position).sub(controls.target);
        controls.enabled = false;
        setBenchmarkResult("Đang đo: 1 giây làm nóng + 5 giây xoay…");
      }
      if (benchmarkStart) {
        const elapsed = now - benchmarkStart;
        if (elapsed >= 1000) {
          if (benchmarkLast) frameTimes.push(now - benchmarkLast);
          benchmarkLast = now;
        }
        camera.position
          .copy(benchmarkOrigin)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), (elapsed / 1000) * 0.17)
          .add(controls.target);
        camera.lookAt(controls.target);
        dirty = true;
        if (elapsed >= 6000 && frameTimes.length) {
          const sorted = [...frameTimes].sort((a, b) => a - b);
          const duration = frameTimes.reduce((a, b) => a + b, 0);
          const gl = renderer.getContext(),
            debug = gl.getExtension("WEBGL_debug_renderer_info");
          const measurement = {
            durationMs: duration,
            frames: frameTimes.length,
            fps: (frameTimes.length / duration) * 1000,
            p95FrameMs:
              sorted[
                Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
              ],
            renderer: debug
              ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
              : "Unavailable",
            width: el.clientWidth,
            height: el.clientHeight,
            dpr: renderer.getPixelRatio(),
            loadMs: Number(el.dataset.loadMs),
            firstFrameMs: Number(el.dataset.firstFrameMs),
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
            textureBytesEstimate: Number(el.dataset.textureBytesEstimate),
            userAgent: navigator.userAgent,
          };
          el.dataset.benchmark = JSON.stringify(measurement);
          setBenchmarkResult(
            `${measurement.fps.toFixed(1)} FPS · p95 ${measurement.p95FrameMs.toFixed(1)} ms · ${measurement.frames} khung hình đo`,
          );
          benchmarkStart = 0;
          controls.enabled = true;
          camera.position.copy(benchmarkOrigin).add(controls.target);
          controls.update();
        }
      }
      if (
        previousSelection !== selection.current ||
        (!marker.visible && pickers.length)
      ) {
        previousSelection = selection.current;
        const mesh = pickers.find((p) => p.userData.id === previousSelection);
        marker.visible = Boolean(mesh);
        if (mesh) {
          marker.box.setFromObject(mesh);
          marker.updateMatrixWorld(true);
        }
        dirty = true;
      }
      if (!dirty || document.hidden) return;
      dirty = false;
      renderer.render(scene, camera);
      if (el.dataset.loaded === "true" && !el.dataset.firstFrameMs)
        el.dataset.firstFrameMs = String(Math.round(performance.now() - start));
      el.dataset.drawCalls = String(renderer.info.render.calls);
      el.dataset.triangles = String(renderer.info.render.triangles);
      el.dataset.frames = String(Number(el.dataset.frames || 0) + 1);
      el.dataset.camera = camera.position
        .toArray()
        .map((v) => v.toFixed(2))
        .join(",");
      setMetrics(
        `${renderer.info.render.triangles.toLocaleString("vi-VN")} tam giác/khung (các lượt render) · ${renderer.info.render.calls} draw calls`,
      );
    };
    tick();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", press);
      renderer.domElement.removeEventListener("pointerup", release);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      env?.dispose();
      pmrem.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [sceneName, reset, view, attempt, quality]);
  return (
    <div className="flagship-model-shell">
      <div ref={host} className="flagship-model" data-testid="flagship-model" />
      {status && (
        <div className="flagship-loading" role="status">
          {status}
          {failure && (
            <button
              onClick={() => {
                setFailure(false);
                setStatus("Đang mở lại mô hình…");
                setAttempt((n) => n + 1);
              }}
            >
              Thử lại
            </button>
          )}
        </div>
      )}
      <p className="flagship-model-caption">
        GLB tương tác · Kéo để xoay · Cuộn để zoom <span>{metrics}</span>
      </p>
      {!status && (
        <div className="flagship-benchmark">
          <button
            onClick={() => {
              benchmarkRequest.current = true;
            }}
          >
            Đo hiệu năng xoay
          </button>
          <output aria-live="polite">{benchmarkResult}</output>
        </div>
      )}
    </div>
  );
}
