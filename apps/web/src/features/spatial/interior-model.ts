import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { ResidenceLayout } from "./residence-layout";

/** Original furnished geometry. The same scene supplies dollhouse and room panoramas. */
export function createInterior(layout: ResidenceLayout, enclosed = false) {
  const root = new THREE.Group();
  root.position.set(-layout.width / 2, 0, -layout.depth / 2);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>(),
    materials = new Set<THREE.Material>(),
    geometries = new Set<THREE.BufferGeometry>();
  const mat = (color: number, roughness = 0.8, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.add(m);
    return m;
  };
  const cream = mat(0xefe7d6),
    wall = mat(0xe9dfcc),
    oak = mat(0x967652),
    wood = mat(0x513e2e),
    bronze = mat(0x736348, 0.32, 0.65),
    stone = mat(0xc6b9a2),
    ink = mat(0x243e35),
    white = mat(0xfaf5e9),
    terracotta = mat(0xa76a4f),
    leaf = mat(0x53734a),
    black = mat(0x242724, 0.3, 0.3),
    rug = mat(0xbab09b),
    blue = mat(0x628b89, 0.15, 0.25);
  const library = "/spatial-flagships/library/";
  const textures = new Set<THREE.Texture>();
  let disposed = false;
  const loader = new THREE.TextureLoader();
  const finishes = [
    [oak, "oak_veneer_01"],
    [stone, "marble_01"],
    [rug, "fabric_pattern_05"],
  ] as const;
  const requests = finishes.flatMap(([surface, name]) => {
    surface.color.setHex(0xffffff);
    surface.normalScale.setScalar(0.55);
    return (
      [
        ["map", "Diffuse"],
        ["roughnessMap", "Rough"],
        ["normalMap", "nor_gl"],
      ] as const
    ).map(async ([slot, channel]) => {
      const texture = await loader.loadAsync(
        library + name + "-" + channel + ".webp",
      );
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      if (slot === "map") texture.colorSpace = THREE.SRGBColorSpace;
      textures.add(texture);
      surface[slot] = texture;
      surface.needsUpdate = true;
    });
  });
  requests.push(
    new GLTFLoader()
      .loadAsync(library + "velvet-sofa.glb")
      .then(({ scene: sofa }) => {
        sofa.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          node.castShadow = node.receiveShadow = true;
          if (disposed) node.geometry.dispose();
          else geometries.add(node.geometry);
          for (const surface of Array.isArray(node.material)
            ? node.material
            : [node.material]) {
            for (const value of Object.values(surface))
              if (value instanceof THREE.Texture) {
                if (disposed) value.dispose();
                else textures.add(value);
              }
            if (disposed) surface.dispose();
            else materials.add(surface);
          }
        });
        if (disposed) return;
        const box = new THREE.Box3().setFromObject(sofa);
        const width = box.max.x - box.min.x;
        const scale = 3.03 / width;
        const center = box.getCenter(new THREE.Vector3());
        sofa.scale.setScalar(scale);
        sofa.position.set(
          2.05 - center.x * scale,
          0.065 - box.min.y * scale,
          6.24 - center.z * scale,
        );
        root.add(sofa);
      }),
  );
  const ready = Promise.all(requests);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xb8d7d3,
    roughness: 0.08,
    metalness: 0,
    envMapIntensity: 0.03,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.add(glass);
  const emissive = mat(0xffe3b3);
  emissive.emissive.setHex(0xffd69b);
  emissive.emissiveIntensity = 0.45;
  const temp = new THREE.Object3D();
  const add = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
    sx = 1,
    sy = 1,
    sz = 1,
  ) => {
    temp.position.set(x, y, z);
    temp.rotation.set(0, ry, 0);
    temp.scale.set(sx, sy, sz);
    temp.updateMatrix();
    const geo = (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(
      temp.matrix,
    );
    // Apply material scale in floor-plan units after orienting each furniture part.
    if (m === oak || m === stone || m === rug) {
      const pos = geo.getAttribute("position"),
        norm = geo.getAttribute("normal"),
        uv = geo.getAttribute("uv");
      const repeat = m === rug ? 0.75 : 1.8;
      for (let i = 0; i < pos.count; i++) {
        const nx = Math.abs(norm.getX(i)),
          ny = Math.abs(norm.getY(i)),
          nz = Math.abs(norm.getZ(i));
        const u = nx > ny && nx > nz ? pos.getZ(i) : pos.getX(i);
        const v = ny >= nx && ny >= nz ? pos.getZ(i) : pos.getY(i);
        uv.setXY(i, u / repeat, v / repeat);
      }
    }
    g.dispose();
    const list = buckets.get(m) || [];
    list.push(geo);
    buckets.set(m, list);
  };
  const box = (
    w: number,
    h: number,
    d: number,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
  ) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, ry);
  const round = (
    w: number,
    h: number,
    d: number,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    r = 0.09,
  ) => add(new RoundedBoxGeometry(w, h, d, 2, r), m, x, y, z);
  const cyl = (
    r: number,
    h: number,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) => add(new THREE.CylinderGeometry(r, r, h, 24), m, x, y, z);
  const ball = (
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    sx: number,
    sy = sx,
    sz = sx,
  ) => add(new THREE.SphereGeometry(1, 16, 10), m, x, y, z, 0, sx, sy, sz);
  const plant = (x: number, z: number, scale = 1) => {
    cyl(0.21 * scale, 0.5 * scale, stone, x, 0.25 * scale, z);
    cyl(0.025 * scale, 1.1 * scale, wood, x, 0.9 * scale, z);
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4;
      ball(
        x + Math.cos(a) * 0.3 * scale,
        (0.8 + i * 0.09) * scale,
        z + Math.sin(a) * 0.3 * scale,
        leaf,
        0.24 * scale,
        0.1 * scale,
        0.4 * scale,
      );
    }
  };
  const chair = (x: number, z: number, angle = 0) => {
    round(0.55, 0.12, 0.55, terracotta, x, 0.47, z);
    box(0.55, 0.55, 0.1, terracotta, x, 0.78, z - 0.24);
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        box(
          0.045,
          0.42,
          0.045,
          bronze,
          x + a * 0.21,
          0.22,
          z + b * 0.21,
          angle,
        );
  };
  const doorWall = (x: number, z: number, length: number) => {
    const gap = 0.95,
      part = (length - gap) / 2;
    box(part, 2.8, 0.14, wall, x + part / 2, 1.4, z);
    box(part, 2.8, 0.14, wall, x + length - part / 2, 1.4, z);
    box(gap, 0.58, 0.14, wall, x + length / 2, 2.51, z);
    box(0.08, 2.22, 0.19, oak, x + part, 1.11, z);
    box(0.08, 2.22, 0.19, oak, x + part + gap, 1.11, z);
    box(gap, 0.08, 0.19, oak, x + length / 2, 2.2, z);
  };
  box(
    layout.width + 0.3,
    0.25,
    layout.depth + 0.3,
    stone,
    layout.width / 2,
    -0.15,
    layout.depth / 2,
  );
  // Thin staggered timber planks: geometry rather than a reused stock texture.
  for (let row = 0; row < 38; row++) {
    const z = 0.15 + row * 0.25;
    for (let col = 0; col < Math.ceil(layout.width / 1.4); col++) {
      const x = col * 1.4 + 0.7;
      box(
        Math.min(1.38, layout.width - col * 1.4),
        0.025,
        0.242,
        oak,
        Math.min(x, layout.width - 0.1),
        0.01,
        z,
      );
    }
  }
  box(layout.width, 0.07, 1.8, oak, layout.width / 2, 0.02, 10.5);
  for (let i = 0; i < Math.floor(layout.width / 0.15); i++)
    box(0.012, 0.01, 1.8, wood, i * 0.15, 0.06, 10.5);
  box(layout.width, 2.8, 0.18, wall, layout.width / 2, 1.4, 0);
  box(0.18, 2.8, enclosed ? 9.6 : 4, wall, 0, 1.4, enclosed ? 4.8 : 2);
  box(
    0.18,
    2.8,
    enclosed ? 9.6 : 4,
    wall,
    layout.width,
    1.4,
    enclosed ? 4.8 : 2,
  );
  if (enclosed) box(layout.width, 0.15, 9.6, cream, layout.width / 2, 2.9, 4.8);
  for (const r of layout.rooms) {
    const cx = r.x + r.w / 2,
      cz = r.z + r.d / 2;
    if (r.kind === "bedroom") {
      if (r.x > 0) box(0.14, 2.8, 4, wall, r.x, 1.4, 2);
      doorWall(r.x, 4, r.w);
      round(2.4, 0.03, 2.9, rug, cx, 0.04, 2.4, 0.05);
      round(1.85, 0.35, 2.18, wood, cx, 0.22, 1.7);
      round(1.8, 0.26, 2.1, white, cx, 0.51, 1.7);
      round(2, 0.95, 0.16, terracotta, cx, 0.8, 0.55, 0.08);
      round(1.8, 0.08, 1.35, cream, cx, 0.68, 2, 0.05);
      for (const side of [-1, 1]) {
        round(0.65, 0.16, 0.42, white, cx + side * 0.43, 0.72, 0.95);
        cyl(0.27, 0.45, wood, cx + side * 1.3, 0.27, 0.85);
        cyl(0.045, 0.3, bronze, cx + side * 1.3, 0.65, 0.85);
        ball(cx + side * 1.3, 0.85, 0.85, emissive, 0.16);
      }
      box(0.6, 2.2, 1.5, oak, r.x + 0.38, 1.1, 2.7);
      box(0.035, 1.2, 0.035, bronze, r.x + 0.7, 1.2, 2.7);
      box(1.3, 0.9, 0.06, bronze, cx, 1.8, 0.14);
      box(1.2, 0.8, 0.07, ink, cx, 1.8, 0.18);
      ball(cx + 0.15, 1.82, 0.23, terracotta, 0.3, 0.26, 0.02);
    }
    if (r.kind === "bath") {
      const front = r.z + r.d;
      box(r.w, 0.04, r.d, stone, cx, 0.04, cz);
      if (r.z === 0 && r.d < 4) {
        box(0.14, 2.8, 0.5, wall, r.x, 1.4, r.z + 0.25);
        box(0.14, 2.8, 0.5, wall, r.x, 1.4, front - 0.25);
        box(0.14, 0.6, r.d - 1, wall, r.x, 2.5, cz);
        box(r.w, 2.8, 0.14, wall, cx, 1.4, front);
      } else {
        box(0.14, 2.8, r.d, wall, r.x, 1.4, cz);
        doorWall(r.x, front, r.w);
      }
      round(0.85, 0.58, 0.42, wood, r.x + 0.55, 0.65, r.z + 0.35);
      round(0.6, 0.12, 0.35, white, r.x + 0.55, 0.99, r.z + 0.35);
      cyl(0.025, 0.23, bronze, r.x + 0.55, 1.1, r.z + 0.2);
      box(0.9, 0.8, 0.03, glass, r.x + 0.55, 1.6, r.z + 0.12);
      round(0.5, 0.42, 0.65, white, r.x + 0.5, 0.25, front - 0.6);
      box(0.035, 2.1, r.d - 0.2, glass, r.x + 1.35, 1.05, cz);
      cyl(0.025, 1.8, bronze, r.x + 2, 1.2, r.z + 0.2);
      ball(r.x + 2, 2.2, r.z + 0.4, bronze, 0.16, 0.025, 0.16);
    }
    if (r.kind === "living") {
      round(r.w - 1, 0.03, 3.25, rug, cx, 0.05, 7.35, 0.14);
      cyl(0.82, 0.12, stone, 2.3, 0.48, 7.8);
      cyl(0.45, 0.42, wood, 2.3, 0.23, 7.8);
      cyl(0.18, 0.04, bronze, 2.4, 0.57, 7.8);
      box(0.45, 0.04, 0.32, ink, 2.05, 0.58, 7.7, 0.2);
      ball(2.5, 0.72, 7.7, terracotta, 0.12, 0.18, 0.12);
      round(0.8, 0.25, 0.8, terracotta, r.w - 1, 0.4, 8.25);
      round(0.8, 0.55, 0.2, terracotta, r.w - 1, 0.7, 8.55);
      box(0.45, 0.45, 2.1, wood, 0.38, 0.35, 8.1);
      box(0.09, 0.9, 1.6, black, 0.19, 1.3, 8.1);
      plant(r.w - 0.45, 5.65, 1.2);
      plant(0.5, 9.1, 0.8);
      cyl(0.035, 1.65, bronze, 4, 0.85, 5.6);
      ball(4, 1.8, 5.6, emissive, 0.25, 0.16, 0.25);
    }
    if (r.kind === "kitchen") {
      for (let i = 0; i < Math.floor(r.w / 0.65); i++) {
        box(0.63, 0.85, 0.65, oak, r.x + 0.35 + i * 0.65, 0.45, 5.6);
        box(0.32, 0.035, 0.045, bronze, r.x + 0.35 + i * 0.65, 0.78, 5.96);
      }
      box(r.w - 0.1, 0.1, 0.75, stone, cx, 0.94, 5.6);
      box(r.w - 0.2, 0.75, 0.32, cream, cx, 1.95, 5.35);
      box(0.65, 0.02, 0.5, black, r.x + 1, 0.999, 5.6);
      for (const i of [-1, 1])
        cyl(0.12, 0.025, bronze, r.x + 1 + i * 0.18, 1.02, 5.6);
      round(0.65, 0.04, 0.4, white, r.x + r.w - 1, 1.01, 5.65);
      cyl(0.025, 0.28, bronze, r.x + r.w - 1, 1.15, 5.4);
      box(0.75, 2.25, 0.7, black, r.x + r.w - 0.45, 1.125, 6.5);
      box(0.04, 0.65, 0.04, bronze, r.x + r.w - 0.65, 1.35, 6.88);
      round(2.4, 0.12, 1.1, wood, cx, 0.8, 8.05, 0.2);
      for (const side of [-1, 1]) {
        box(0.12, 0.74, 0.7, wood, cx + side * 0.85, 0.38, 8.05);
        chair(cx + side * 0.7, 7.1);
        chair(cx + side * 0.7, 8.95);
      }
      for (const side of [-1, 1]) {
        cyl(0.035, 1.1, bronze, cx + side * 0.55, 2.3, 8.05);
        ball(cx + side * 0.55, 1.7, 8.05, emissive, 0.2, 0.15, 0.2);
      }
      cyl(0.18, 0.22, stone, cx, 0.97, 8.05);
      plant(r.x + r.w - 0.45, 9.1, 0.7);
    }
  }
  // Sliding glazing, curtains and an open-air loggia.
  for (let i = 0; i < Math.ceil(layout.width / 1.4); i++) {
    const x = Math.min(layout.width - 0.02, i * 1.4);
    box(0.045, 2.75, 0.07, bronze, x, 1.38, 9.6);
  }
  box(layout.width, 2.65, 0.025, glass, layout.width / 2, 1.4, 9.6);
  box(layout.width, 0.06, 0.1, bronze, layout.width / 2, 2.76, 9.6);
  for (const x of [0.35, layout.width - 0.35])
    for (let i = 0; i < 5; i++)
      cyl(0.045, 2.65, cream, x + i * 0.07, 1.4, 9.45);
  box(layout.width, 0.05, 0.08, bronze, layout.width / 2, 1.05, 11.35);
  box(layout.width, 0.9, 0.025, glass, layout.width / 2, 0.55, 11.35);
  for (let i = 0; i < Math.ceil(layout.width); i++)
    box(0.035, 1, 0.04, bronze, i, 0.54, 11.35);
  cyl(0.42, 0.06, stone, 2, 0.62, 10.5);
  cyl(0.06, 0.58, bronze, 2, 0.32, 10.5);
  chair(1.15, 10.5);
  chair(2.85, 10.5);
  for (let i = 0; i < 4; i++)
    plant(layout.width - 1.6 + i * 0.32, 10.7, 0.7 + i * 0.05);
  // Surroundings appear through the real glazing in panorama mode.
  if (enclosed) {
    blue.envMapIntensity = 0.08;
    box(180, 0.1, 180, blue, layout.width / 2, -2, 60);
    box(160, 0.5, 8, stone, layout.width / 2, -1.6, 28);
    for (let i = 0; i < 38; i++) {
      const x = -65 + i * 4,
        z = 28 + (i % 3) * 1.2;
      cyl(0.13, 3, wood, x, -0.1, z);
      for (let j = 0; j < 9; j++) {
        const a = j * 2.399;
        ball(
          x + Math.cos(a) * 0.8,
          1.8 + (j % 3) * 0.4,
          z + Math.sin(a) * 0.8,
          leaf,
          1.1,
          0.95,
          1.15,
        );
      }
    }
  }
  const pickers: THREE.Mesh[] = [];
  for (const r of layout.rooms) {
    const g = new THREE.PlaneGeometry(r.w - 0.1, r.d - 0.1);
    geometries.add(g);
    const m = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    materials.add(m);
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(r.x + r.w / 2, 0.1, r.z + r.d / 2);
    mesh.userData.roomId = r.id;
    root.add(mesh);
    pickers.push(mesh);
  }
  for (const [m, list] of buckets) {
    const g = mergeGeometries(list, false);
    list.forEach((g) => g.dispose());
    if (g) {
      geometries.add(g);
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = m !== glass;
      mesh.receiveShadow = true;
      root.add(mesh);
    }
  }
  return {
    root,
    pickers,
    ready,
    dispose() {
      disposed = true;
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
