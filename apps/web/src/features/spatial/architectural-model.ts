import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Project, Property } from "@/domain/types";

/** Original architectural study. Inventory IDs belong to glazing, never decorative buildings. */
export function createArchitecturalModel(
  project: Project,
  properties: Property[],
  night: boolean,
) {
  const root = new THREE.Group();
  root.name = "ARVESSA / Stillwater architectural study";
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const resources = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const material = (color: number, roughness = 0.7, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.add(m);
    return m;
  };
  const stone = material(0xe7e0cb, 0.78),
    edge = material(0xf6efdc, 0.62),
    plaster = material(0xcfc6b0, 0.92),
    bronze = material(0x665540, 0.3, 0.6),
    oak = material(0x867052, 0.78),
    earth = material(0x566047, 0.95),
    fabric = material(0xf1e8d4, 0.95);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x9db8ad,
    roughness: 0.17,
    metalness: 0.2,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.add(glass);
  const water = new THREE.MeshPhysicalMaterial({
    color: night ? 0x1d5757 : 0x5b9b98,
    roughness: 0.12,
    metalness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  materials.add(water);
  const glow = material(0xe5c492, 0.4);
  glow.emissive.setHex(0xf2c383);
  glow.emissiveIntensity = night ? 1.8 : 0.08;
  const leaf = [0x526747, 0x6c7950, 0x7c8555, 0x3c5842].map((c) =>
    material(c, 0.97),
  );
  const transform = new THREE.Object3D();
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
    transform.position.set(x, y, z);
    transform.rotation.set(0, ry, 0);
    transform.scale.set(sx, sy, sz);
    transform.updateMatrix();
    const geo = (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(
      transform.matrix,
    );
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
    r = 0.1,
  ) => add(new RoundedBoxGeometry(w, h, d, 2, r), m, x, y, z);
  const cylinder = (
    r1: number,
    r2: number,
    h: number,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) => add(new THREE.CylinderGeometry(r1, r2, h, 12), m, x, y, z);
  const tree = (x: number, z: number, scale = 1, seed = 0) => {
    cylinder(0.09 * scale, 0.18 * scale, 3.3 * scale, oak, x, 1.5 * scale, z);
    for (let i = 0; i < 13; i++) {
      const angle = i * 2.399 + seed;
      const radius = (0.4 + (i % 4) * 0.22) * scale;
      add(
        new THREE.IcosahedronGeometry(1, 1),
        leaf[(i + seed) % 4],
        x + Math.cos(angle) * radius,
        (3.1 + (i % 3) * 0.45) * scale,
        z + Math.sin(angle) * radius,
        angle,
        0.75 * scale,
        (0.75 + (i % 2) * 0.25) * scale,
        0.8 * scale,
      );
    }
  };
  const shrub = (x: number, y: number, z: number, scale = 0.55) => {
    for (let i = 0; i < 4; i++)
      add(
        new THREE.IcosahedronGeometry(1, 1),
        leaf[i],
        x + (i % 2) * 0.45,
        y + (i % 2) * 0.13,
        z + Math.floor(i / 2) * 0.35,
        0,
        scale,
        scale * 0.7,
        scale,
      );
  };
  const siteWidth = Math.max(42, project.towers.length * 24 + 8);
  round(siteWidth, 1, 44, stone, 0, -0.65, 0, 0.35);
  round(siteWidth + 0.4, 0.2, 44.4, bronze, 0, -1.22, 0, 0.08);
  box(240, 0.15, 240, material(night ? 0x1b302d : 0xcfd4c6, 0.95), 0, -1.45, 0);
  // Paving joints and a continuous waterfront promenade establish scale.
  for (let x = -siteWidth / 2 + 2; x < siteWidth / 2 - 1; x += 2)
    box(0.024, 0.015, 41, plaster, x, -0.12, 0);
  for (let z = -19; z < 20; z += 2)
    box(siteWidth - 2, 0.015, 0.024, plaster, 0, -0.11, z);
  round(siteWidth - 6, 0.25, 8, edge, 0, -0.1, 15, 0.15);
  round(siteWidth - 7, 0.15, 6.8, water, 0, 0.045, 15, 0.12);
  for (let i = 0; i < 8; i++)
    box(
      siteWidth - 8,
      0.015,
      0.035,
      material(0x82b5aa, 0.3, 0.3),
      0,
      0.13,
      12.1 + i * 0.85,
    );
  // Boardwalk and pergola, deliberately not additional inventory towers.
  for (let i = 0; i < 28; i++)
    box(0.28, 0.12, 4.3, oak, -4.9 + i * 0.36, 0.03, -16.8);
  for (const x of [-5, 5])
    for (const z of [-19, -14.5]) cylinder(0.1, 0.1, 3.7, bronze, x, 1.8, z);
  for (let i = 0; i < 18; i++)
    box(0.13, 0.22, 5.4, oak, -5.3 + i * 0.63, 3.7, -16.8);
  box(11, 0.25, 0.18, bronze, 0, 3.5, -19.4);
  box(11, 0.25, 0.18, bronze, 0, 3.5, -14.2);
  round(3, 0.38, 1.1, stone, 0, 0.22, -17.3, 0.12);
  round(2.8, 0.12, 1, fabric, 0, 0.47, -17.3, 0.06);
  const units: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>[] =
    [];
  const towerPositions = new Map<string, THREE.Vector3>();
  for (let ti = 0; ti < project.towers.length; ti++) {
    const tower = project.towers[ti],
      x = (ti - (project.towers.length - 1) / 2) * 24;
    const z = ti % 2 ? -0.8 : 1.1;
    towerPositions.set(
      tower,
      new THREE.Vector3(x, project.floors * 3.15 + 2, z),
    );
    round(18.6, 0.32, 16.2, stone, x, 0.05, z, 0.18);
    for (let step = 0; step < 3; step++)
      box(7, 0.12, 1.3, edge, x, -0.02 + step * 0.12, z + 9 - step * 0.42);
    // Vertical cores anchor otherwise horizontal balcony bands.
    box(
      2,
      project.floors * 3.15,
      5,
      plaster,
      x,
      project.floors * 1.575 + 0.3,
      z,
    );
    for (let f = 1; f <= project.floors; f++) {
      const y = 0.35 + (f - 1) * 3.15;
      round(18, 0.25, 15.5, edge, x, y, z, 0.09);
      round(17.75, 0.11, 15.25, stone, x, y + 0.18, z, 0.04);
      box(15.8, 0.14, 12, plaster, x, y + 2.85, z);
      // Pier and deep loggia articulation, not a stack of coloured unit boxes.
      for (const px of [-8.1, 0, 8.1])
        for (const side of [-1, 1])
          box(0.28, 2.75, 1.35, stone, x + px, y + 1.53, z + side * 6.6);
      for (const side of [-1, 1]) {
        box(17.2, 0.055, 0.08, bronze, x, y + 1.12, z + side * 7.55);
        box(17.1, 0.78, 0.035, glass, x, y + 0.71, z + side * 7.55);
        box(17.2, 0.06, 0.09, bronze, x, y + 0.29, z + side * 7.55);
        for (let j = 0; j < 9; j++)
          box(
            0.045,
            0.87,
            0.06,
            bronze,
            x - 8.1 + j * 2.025,
            y + 0.74,
            z + side * 7.55,
          );
      }
      for (const side of [-1, 1]) {
        box(0.04, 0.8, 14.5, glass, x + side * 8.65, y + 0.7, z);
        box(0.065, 0.055, 14.8, bronze, x + side * 8.65, y + 1.12, z);
        for (let j = 0; j < 4; j++)
          box(
            0.3,
            2.75,
            0.15,
            stone,
            x + side * 8.1,
            y + 1.53,
            z - 5.5 + j * 3.7,
          );
      }
      for (let n = 1; n <= 4; n++) {
        const p = properties.find(
          (p) => p.tower === tower && p.floor === f && p.number === n,
        );
        if (!p) continue;
        const side = n <= 2 ? -1 : 1;
        const ux = x + (n % 2 ? -4.1 : 4.1),
          uz = z + side * 5.9;
        box(7.6, 2.48, 0.15, plaster, ux, y + 1.48, z + side * 0.9);
        box(7.5, 0.09, 4.6, oak, ux, y + 0.28, z + side * 3.5);
        box(
          1.6,
          1.8,
          0.18,
          oak,
          ux + (n % 2 ? 2.4 : -2.4),
          y + 1.2,
          z + side * 1.15,
        );
        // Glazing is a selectable architectural element linked to a real demo property.
        const mat = new THREE.MeshPhysicalMaterial({
          color: night ? 0x806e49 : 0x6e8d80,
          roughness: 0.16,
          metalness: 0.22,
          clearcoat: 1,
          transparent: true,
          opacity: 0.72,
          side: THREE.DoubleSide,
          depthWrite: false,
          emissive: night ? 0x806036 : 0x000000,
          emissiveIntensity: night ? 0.6 : 0,
        });
        materials.add(mat);
        const g = new THREE.PlaneGeometry(7.55, 2.42);
        resources.add(g);
        const window = new THREE.Mesh(g, mat);
        window.position.set(ux, y + 1.49, uz);
        window.rotation.y = side < 0 ? Math.PI : 0;
        window.userData = {
          propertyId: p.id,
          floor: f,
          tower,
          availability: p.availability,
          baseColor: night ? 0x806e49 : 0x6e8d80,
        };
        root.add(window);
        units.push(window);
        for (let mullion = 0; mullion < 5; mullion++)
          box(
            0.045,
            2.5,
            0.075,
            bronze,
            ux - 3.8 + mullion * 1.9,
            y + 1.49,
            uz + side * 0.05,
          );
        box(7.7, 0.05, 0.08, bronze, ux, y + 2.71, uz + side * 0.04);
        box(7.7, 0.06, 0.08, bronze, ux, y + 0.26, uz + side * 0.04);
        // Curtains, balcony furniture and recessed warm light add inhabitable depth.
        box(0.35, 2.35, 0.12, fabric, ux - 3.35, y + 1.5, uz - side * 0.13);
        box(0.35, 2.35, 0.12, fabric, ux + 3.35, y + 1.5, uz - side * 0.13);
        cylinder(0.38, 0.38, 0.32, stone, ux + 2.7, y + 0.42, z + side * 6.8);
        round(
          1.05,
          0.5,
          0.65,
          fabric,
          ux + 1.5,
          y + 0.51,
          z + side * 6.75,
          0.12,
        );
        box(2.5, 0.028, 0.075, glow, ux, y + 2.74, uz - side * 0.3);
      }
      if (f % 2 === 0) {
        for (const side of [-1, 1]) {
          box(3, 0.5, 0.65, plaster, x - 5, y + 0.48, z + side * 7);
          for (let j = 0; j < 5; j++)
            shrub(x - 6 + j * 0.55, y + 0.85, z + side * 7, 0.28);
        }
      }
    }
    const roof = project.floors * 3.15 + 0.35;
    round(18.8, 0.42, 16.1, edge, x, roof, z, 0.13);
    round(16.6, 0.2, 13.9, earth, x, roof + 0.31, z, 0.16);
    for (const side of [-1, 1]) {
      box(18.3, 0.45, 0.16, stone, x, roof + 0.5, z + side * 7.7);
      box(0.16, 0.45, 15.5, stone, x + side * 9.1, roof + 0.5, z);
    }
    // Roof garden and set-back penthouse pavilion silhouette.
    box(5, 1.5, 3.5, plaster, x, roof + 1.05, z - 2.5);
    round(5.5, 0.16, 4, edge, x, roof + 1.85, z - 2.5, 0.08);
    for (let i = 0; i < 10; i++)
      shrub(x - 7 + (i % 5) * 3.3, roof + 0.65, z + (i < 5 ? -5.8 : 5.8), 0.5);
    for (let i = 0; i < 5; i++)
      box(0.13, 1.8, 0.15, bronze, x - 3 + i * 1.5, roof + 1.1, z + 3.5);
    for (let i = 0; i < 11; i++)
      box(0.12, 0.14, 3, oak, x - 3.3 + i * 0.66, roof + 2, z + 3.2);
  }
  // Planted courtyards, benches, lights and waterfront seating.
  for (let i = 0; i < 18; i++) {
    const x = (i < 9 ? -1 : 1) * (siteWidth / 2 - 2.5),
      z = -17 + (i % 9) * 4.2;
    cylinder(1.2, 1.3, 0.3, plaster, x, 0.02, z);
    tree(x, z, 0.8 + (i % 3) * 0.12, i);
  }
  for (let i = 0; i < 8; i++) {
    const x = -siteWidth / 2 + 5 + (i * (siteWidth - 10)) / 7;
    tree(x, -11, 0.78 + (i % 2) * 0.17, i + 2);
    if (i % 2 === 0) {
      box(2.5, 0.38, 0.65, stone, x, 0.12, -12.8);
      for (let j = 0; j < 6; j++)
        box(2.5, 0.06, 0.07, oak, x, 0.36, -13 + j * 0.1);
    }
    cylinder(0.055, 0.055, 1.1, bronze, x, 0.5, 10.3);
    cylinder(0.14, 0.14, 0.12, glow, x, 1.1, 10.3);
  }
  for (let i = 0; i < 6; i++) {
    const x = -13 + i * 5.2;
    round(1.4, 0.23, 2.5, oak, x, 0.15, 20, 0.1);
    round(1.25, 0.13, 2.3, fabric, x, 0.34, 20, 0.06);
    cylinder(0.35, 0.35, 0.45, stone, x + 1.15, 0.2, 20);
  }
  // Merge static geometry by material to keep draw calls stable as detail increases.
  for (const [m, list] of buckets) {
    const merged = mergeGeometries(list, false);
    for (const g of list) g.dispose();
    if (!merged) continue;
    resources.add(merged);
    const mesh = new THREE.Mesh(merged, m);
    mesh.castShadow = m !== glass && m !== water;
    mesh.receiveShadow = true;
    root.add(mesh);
  }
  return {
    root,
    units,
    towerPositions,
    dispose() {
      for (const g of resources) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
