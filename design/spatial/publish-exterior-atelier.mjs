import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const source = path.join(root, ".agent-work/definitive/exterior-v2");
const oldSource = path.join(root, ".agent-work/photoreal/flagships");
const output = path.join(root, "apps/web/public/spatial-flagships");
const evidence = path.join(root, "docs/frontend-definitive/evidence");
await mkdir(evidence, { recursive: true });

const labels = {
  day: "Terrasse / Daylight",
  golden: "West elevation / Golden hour",
  night: "Water court / Night",
  aerial: "Site plan / Aerial",
  entrance: "Residence A / Entrance",
  landscape: "Water garden / Promenade",
  facade: "Residence B / Facade detail",
  showroom: "Scale model / Showroom",
};

async function hash(filename) {
  const result = createHash("sha256");
  for await (const chunk of createReadStream(filename)) result.update(chunk);
  return result.digest("hex");
}

const staging = path.join(source, "delivery");
await mkdir(staging, { recursive: true });
const records = [];
const sceneSHA256 = await hash(path.join(source, "Stillwater.blend"));
for (const key of Object.keys(labels)) {
  const name = "Stillwater-" + key;
  const filename = path.join(source, "final", name + ".png");
  const settings = JSON.parse(await readFile(filename.replace(/\.png$/, ".render.json"), "utf8"));
  const metadata = await sharp(filename).metadata();
  if (settings.sourceSHA256 !== sceneSHA256 || metadata.width !== settings.width || metadata.height !== settings.height || !settings.seconds || settings.renderer !== "Cycles")
    throw Error("Source render and measurements disagree: " + key);
  const webFile = name + ".webp";
  const target = path.join(staging, webFile);
  await sharp(filename).webp({ quality: 92, effort: 5 }).toFile(target);
  records.push({ ...settings, webFile, webBytes: (await stat(target)).size, sha256: await hash(target) });
}

const sourceMap = JSON.parse(await readFile(path.join(source, "stillwater-interaction.json"), "utf8"));
const publishedMap = JSON.parse(await readFile(path.join(output, "stillwater-interaction.json"), "utf8"));
if (sourceMap.length !== 48 || JSON.stringify(sourceMap) !== JSON.stringify(publishedMap))
  throw Error("Stillwater unit mapping differs from the 48 inventory records");

for (const record of records) {
  const tmp = path.join(output, record.webFile + ".tmp");
  await copyFile(path.join(staging, record.webFile), tmp);
  await rename(tmp, path.join(output, record.webFile));
}
const reportPath = path.join(output, "production-report.json");
const report = JSON.parse(await readFile(reportPath, "utf8"));
report.photographs = [...records, ...report.photographs.filter(row => !row.webFile.startsWith("Stillwater-"))];
await writeFile(reportPath + ".tmp", JSON.stringify(report, null, 2) + "\n");
await rename(reportPath + ".tmp", reportPath);

const measurements = { originalSceneSHA256: await hash(path.join(oldSource, "Stillwater.blend")),
  restoredSourceSHA256: await hash(path.join(root, ".agent-work/definitive/source-baseline/Stillwater.blend")),
  productionSceneSHA256: sceneSHA256,
  productionSourceBytes: (await stat(path.join(source, "Stillwater.blend"))).size,
  unitCount: sourceMap.length, mappedTowers: [...new Set(sourceMap.map(unit => unit.tower))], photographs: records };
if (measurements.originalSceneSHA256 !== measurements.restoredSourceSHA256) throw Error("Baseline and recovery copy differ");
await writeFile(path.join(evidence, "stillwater-render-log.json"), JSON.stringify(measurements, null, 2) + "\n");

async function contactSheet(entries, out, width, height) {
  const tiles = [];
  for (const [i, [image, label]] of entries.entries()) {
    const left = (i % 2) * width;
    const top = Math.floor(i / 2) * (height + 48);
    tiles.push({ input: await sharp(image).resize(width, height, { fit: "contain", background: "#252725" }).png().toBuffer(), left, top });
    const caption = Buffer.from(`<svg width="${width}" height="48"><text x="16" y="30" fill="#e9e5db" font-family="Arial" font-size="18">${label}</text></svg>`);
    tiles.push({ input: caption, left, top: top + height });
  }
  await sharp({ create: { width: width * 2, height: Math.ceil(entries.length/2) * (height + 48), channels: 3, background: "#252725" } })
    .composite(tiles).webp({ quality: 88 }).toFile(path.join(evidence, out));
}
await contactSheet(Object.entries(labels).map(([key, label]) => [path.join(staging, "Stillwater-" + key + ".webp"), label]),
  "stillwater-editorial-plates.webp", 640, 427);
await contactSheet(["day", "aerial", "golden"].flatMap(key => [
  [path.join(oldSource, "Stillwater-" + key + ".png"), "Before / " + key],
  [path.join(staging, "Stillwater-" + key + ".webp"), "After / " + key],
]), "stillwater-before-after.webp", 640, 427);
console.log("Published", records.length, "measured Cycles plates; validated 48 unit anchors.");
