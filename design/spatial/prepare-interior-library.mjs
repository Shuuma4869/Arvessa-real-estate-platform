/** Derive shareable real-time furniture and material maps from the source lock. */
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const root = fileURLToPath(new URL("../../", import.meta.url));
const library = resolve(root, ".agent-work/photoreal/library");
const out = resolve(root, "apps/web/public/spatial-flagships/library");
const work = resolve(root, ".agent-work/definitive");
await mkdir(out, {recursive:true});
const cli = fileURLToPath(new URL("./node_modules/@gltf-transform/cli/bin/cli.js", import.meta.url));
const resized = resolve(work, "sofa-512.glb");
execFileSync(process.execPath, [cli, "resize", resolve(library, "GlamVelvetSofa/GlamVelvetSofa.glb"), resized, "--width", "512", "--height", "512"], {stdio:"inherit"});
execFileSync(process.execPath, [cli, "webp", resized, resolve(out, "velvet-sofa.glb"), "--quality", "90"], {stdio:"inherit"});
for (const name of ["oak_veneer_01", "marble_01", "fabric_pattern_05"]) {
  for (const channel of ["Diffuse", "Rough", "nor_gl"]) {
    await sharp(resolve(library,name,channel+".jpg")).resize({width:512,height:512,fit:"inside"})
      .webp({quality:channel==="nor_gl"?96:89}).toFile(resolve(out,name+"-"+channel+".webp"));
  }
}
