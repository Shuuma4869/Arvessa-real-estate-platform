/** Build a mobile GLB from the uncompressed, tangent-corrected web derivative. */
import { execFileSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const [name, sourceDir] = process.argv.slice(2);
if (!["Stillwater", "A0302"].includes(name) || !sourceDir) {
  throw new Error("Expected A0302 or Stillwater and the Blender export directory");
}
const raw = resolve(root, sourceDir, "web-raw");
const target = resolve(root, "apps/web/public/spatial-flagships", name + "-light.glb");
const cli = resolve(here, "node_modules/@gltf-transform/cli/bin/cli.js");
let input = resolve(raw, name + "-tangent-repaired.glb");
for (const [step, args] of [
  ["simplify", ["--ratio", "0.28", "--error", "0.002"]],
  ["resize", ["--width", "256", "--height", "256"]],
  ["meshopt", ["--level", "medium"]],
]) {
  const output = step === "meshopt" ? target : resolve(raw, name + "-light-" + step + ".glb");
  execFileSync(process.execPath, [cli, step, input, output, ...args], { stdio: "inherit" });
  input = output;
}
console.log(name, (await stat(target)).size, "bytes");
