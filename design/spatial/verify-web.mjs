import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import validator from "gltf-validator";
const output = new URL(
  "../../apps/web/public/spatial-flagships/",
  import.meta.url,
);
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const results = [];
for (const name of ["Stillwater", "A0302"]) {
  const file = new URL(`${name}.glb`, output);
  const bytes = await readFile(file);
  const document = await io.read(fileURLToPath(file));
  let triangles = 0,
    primitives = 0;
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const instancing = node.getExtension("EXT_mesh_gpu_instancing");
    const copies = instancing ? instancing.listAttributes()[0].getCount() : 1;
    for (const primitive of mesh.listPrimitives()) {
      triangles +=
        (copies *
          (primitive.getIndices()?.getCount() ||
            primitive.getAttribute("POSITION").getCount())) /
        3;
      primitives++;
    }
  }
  const compressedValidation = await validator.validateBytes(
    new Uint8Array(bytes),
    { uri: `${name}.glb`, maxIssues: 200 },
  );
  const compression = document
    .getRoot()
    .listExtensionsUsed()
    .find((e) => e.extensionName === "EXT_meshopt_compression");
  compression?.dispose();
  const decodedValidation = await validator.validateBytes(
    await io.writeBinary(document),
    { uri: `${name}-decoded.glb`, maxIssues: 200 },
  );
  const item = {
    name,
    bytes: bytes.length,
    sceneTriangles: triangles,
    drawPrimitives: primitives,
    textures: document
      .getRoot()
      .listTextures()
      .map((t) => ({
        name: t.getName(),
        bytes: t.getImage()?.byteLength,
        dimensions: t.getSize(),
        format: t.getMimeType(),
      })),
    compressedValidation: compressedValidation.issues,
    decodedValidation: decodedValidation.issues,
  };
  results.push(item);
  if (decodedValidation.issues.numErrors)
    throw Error(`${name}: decoded GLB has validation errors`);
}
await writeFile(
  new URL("verification.json", output),
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify(
    results.map((r) => ({
      name: r.name,
      bytes: r.bytes,
      sceneTriangles: r.sceneTriangles,
      primitives: r.drawPrimitives,
      errors: r.decodedValidation.numErrors,
      warnings: r.decodedValidation.numWarnings,
    })),
    null,
    2,
  ),
);
