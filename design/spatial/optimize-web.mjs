import { readFile, writeFile, mkdir, copyFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import validator from "gltf-validator";
import sharp from "sharp";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
const here = dirname(fileURLToPath(import.meta.url)),
  root = resolve(here, "../..");
const source = resolve(root, ".agent-work/photoreal/flagships");
const output = resolve(root, "apps/web/public/spatial-flagships");
await mkdir(output, { recursive: true });
const lock = JSON.parse(
  await readFile(resolve(here, "assets.lock.json"), "utf8"),
);
const credits = [
  "# ARVESSA flagship asset credits",
  "",
  "Architecture · Vision · Experience",
  "",
  "Powered by Poly Haven. Models, textures and HDRI: CC0. No website preview images are used.",
  "",
];
for (const asset of lock.assets) {
  credits.push(
    `- **${asset.id}** — ${asset.author || Object.keys(asset.authors).join(", ")}. [Source](${asset.source}), [${asset.license}](${asset.license_url}).`,
  );
}
credits.push(
  "",
  "GlamVelvetSofa © 2021 Wayfair, LLC; Eric Chadwick. Changes: placement, scaling and web export optimization; original blue velvet material retained. No endorsement implied. Architecture and custom fixtures assembled for ARVESSA. See design/spatial/assets.lock.json for pinned sources and checksums.",
  "",
);
await writeFile(resolve(output, "CREDITS.md"), credits.join("\n"));
const cli = resolve(here, "node_modules/@gltf-transform/cli/bin/cli.js");
const report = {
  visualApproval: "PENDING",
  tool: "glTF Transform 4.5.1 + Khronos glTF Validator",
  models: [],
  photographs: [],
};
if (process.argv.includes("--images-only")) {
  report.models = JSON.parse(
    await readFile(resolve(output, "production-report.json"), "utf8"),
  ).models;
}
for (const name of process.argv.includes("--images-only")
  ? []
  : ["A0302", "Stillwater"]) {
  const raw = resolve(source, `web-raw/${name}.glb`);
  const validation = await validator.validateBytes(
    new Uint8Array(await readFile(raw)),
    { uri: `${name}.glb`, maxIssues: 100 },
  );
  await writeFile(
    resolve(source, `${name}.validation.json`),
    JSON.stringify(validation, null, 2),
  );
  if (validation.issues.numErrors)
    throw Error(`${name}: ${validation.issues.numErrors} glTF errors`);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(raw);
  for (const material of document.getRoot().listMaterials()) {
    if (/leaves/i.test(material.getName())) {
      material.setDoubleSided(true);
      if (material.getAlphaMode() === "BLEND")
        material.setAlphaMode("MASK").setAlphaCutoff(0.35);
    } else if (!/curtain|cloth|cotton/i.test(material.getName()))
      material.setDoubleSided(false);
  }
  let input = resolve(source, `web-raw/${name}-prepared.glb`);
  await io.write(input, document);
  for (const [step, options] of [
    ["dedup", []],
    ["weld", []],
    ...(name === "Stillwater"
      ? [["simplify", ["--ratio", ".35", "--error", ".001"]]]
      : []),
    ["tangents", []],
    ["prune", []],
    ["instance", []],
    ["webp", ["--quality", "95"]],
    ["meshopt", ["--level", "medium"]],
  ]) {
    if (step === "meshopt") {
      const meshDocument = await io.read(input);
      for (const mesh of meshDocument.getRoot().listMeshes())
        for (const primitive of mesh.listPrimitives()) {
          const tangent = primitive.getAttribute("TANGENT"),
            normal = primitive.getAttribute("NORMAL");
          if (!tangent || !normal) continue;
          const t = [],
            n = [];
          for (let i = 0; i < tangent.getCount(); i++) {
            tangent.getElement(i, t);
            if (Math.hypot(t[0], t[1], t[2]) > 0.5) continue;
            normal.getElement(i, n);
            const axis = Math.abs(n[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0];
            const dot = axis[0] * n[0] + axis[1] * n[1] + axis[2] * n[2];
            const vector = axis.map((v, j) => v - dot * n[j]);
            const length = Math.hypot(...vector);
            tangent.setElement(i, [...vector.map((v) => v / length), 1]);
          }
        }
      const repaired = resolve(source, `web-raw/${name}-tangent-repaired.glb`);
      await io.write(repaired, meshDocument);
      input = repaired;
    }
    const target =
      step === "meshopt"
        ? resolve(output, `${name}.glb`)
        : resolve(source, `web-raw/${name}-${step}.glb`);
    execFileSync(process.execPath, [cli, step, input, target, ...options], {
      stdio: "inherit",
    });
    input = target;
  }
  report.models.push({
    name,
    rawBytes: (await stat(raw)).size,
    webBytes: (await stat(input)).size,
    validation: validation.issues,
    ...JSON.parse(
      await readFile(resolve(source, `web-raw/${name}.stats.json`), "utf8"),
    ),
  });
  const balanced = resolve(output, `${name}-balanced.glb`);
  const balancedRaw = resolve(source, `web-raw/${name}-balanced.glb`);
  execFileSync(
    process.execPath,
    [
      cli,
      "resize",
      resolve(source, `web-raw/${name}-tangent-repaired.glb`),
      balancedRaw,
      "--width",
      "512",
      "--height",
      "512",
    ],
    { stdio: "inherit" },
  );
  execFileSync(
    process.execPath,
    [cli, "meshopt", balancedRaw, balanced, "--level", "medium"],
    { stdio: "inherit" },
  );
  report.models.at(-1).balancedBytes = (await stat(balanced)).size;
}
for (const name of process.argv.includes("--models-only")
  ? []
  : [
      "Stillwater-day",
      "Stillwater-golden",
      "Stillwater-aerial",
      "A0302-living",
      "A0302-kitchen",
      "A0302-dollhouse",
      "A0302-living-360",
    ]) {
  const target = resolve(output, name + ".webp");
  await sharp(resolve(source, name + ".png"))
    .webp({ quality: 92, effort: 6 })
    .toFile(target);
  report.photographs.push({
    ...JSON.parse(
      await readFile(resolve(source, name + ".render.json"), "utf8"),
    ),
    webFile: name + ".webp",
    webBytes: (await stat(target)).size,
  });
}
await copyFile(
  resolve(source, "stillwater-interaction.json"),
  resolve(output, "stillwater-interaction.json"),
);
await copyFile(
  resolve(source, "daylight-web.hdr"),
  resolve(output, "daylight.hdr"),
);
report.environment = JSON.parse(
  await readFile(resolve(source, "daylight-web.json"), "utf8"),
);
await writeFile(
  resolve(output, "production-report.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    report.models.map(
      ({ name, rawBytes, webBytes, scene_triangles, validation }) => ({
        name,
        rawBytes,
        webBytes,
        scene_triangles,
        errors: validation.numErrors,
        warnings: validation.numWarnings,
      }),
    ),
    null,
    2,
  ),
);
