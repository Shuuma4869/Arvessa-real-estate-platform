/** Reproducible local screenshot and frame-interval evidence. Not an artistic approval. */
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cpus, totalmem, platform, release } from "node:os";
import { mkdir, writeFile } from "node:fs/promises";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve(root, ".agent-work/browsers");
const require = createRequire(resolve(root, "apps/web/package.json"));
const { chromium } = require("@playwright/test");
const out = resolve(root, "docs/visual-rebuild/evidence/photoreal");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args:
    process.platform === "win32" &&
    process.env.ARVESSA_BENCHMARK_HARDWARE === "1"
      ? ["--use-angle=d3d11", "--ignore-gpu-blocklist"]
      : [],
});
const results = {
  date: new Date().toISOString(),
  browser: browser.version(),
  headless: true,
  hardware: {
    os: platform(),
    release: release(),
    cpu: cpus()[0]?.model,
    logicalProcessors: cpus().length,
    systemMemoryBytes: totalmem(),
    hardwareRequested: process.env.ARVESSA_BENCHMARK_HARDWARE === "1",
  },
  measurements: [],
  picking: [],
  qualitySwitches: [],
  screenshots: [],
  errors: [],
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => results.errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) results.errors.push(`${r.status()} ${r.url()}`);
  });
  await page.addInitScript(() => {
    window.__visualVitals = { lcp: null, cls: 0 };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        window.__visualVitals.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        if (!e.hadRecentInput) window.__visualVitals.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(
    `http://127.0.0.1:${process.env.ARVESSA_TEST_PORT || "3000"}/spatial-review`,
    { waitUntil: "networkidle" },
  );
  results.initialVitals = await page.evaluate(() => window.__visualVitals);
  const shot = async (name, selector = ".flagship-workspace") => {
    await page
      .locator(selector)
      .screenshot({ path: resolve(out, name + ".png") });
    results.screenshots.push(name + ".png");
  };
  for (const [scene, label] of [
    ["Stillwater", "The Stillwater"],
    ["A0302", "Residence A0302"],
  ]) {
    await page.getByRole("button", { name: new RegExp(label) }).click();
    const photoNames =
      scene === "Stillwater"
        ? ["Ánh sáng ban ngày", "Giờ vàng", "Toàn cảnh dự án"]
        : ["Dollhouse", "Phòng khách", "Bếp & phòng ăn"];
    for (let i = 0; i < photoNames.length; i++) {
      await page
        .locator(".flagship-view-controls")
        .getByRole("button", { name: photoNames[i], exact: true })
        .click();
      await page
        .locator(".flagship-photograph img")
        .evaluate((img) => img.decode());
      await shot(`${scene}-photo-${i}-1440`);
    }
    await page.getByRole("button", { name: "Mô hình 3D", exact: true }).click();
    const model = page.getByTestId("flagship-model");
    await model.waitFor();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="flagship-model"]')?.dataset
          .loaded === "true",
      {},
      { timeout: 120000 },
    );
    await page.waitForTimeout(1000);
    await shot(`${scene}-glb-1440`);
    const before = await page.getByTestId("flagship-selection").innerText();
    const rect = await model.boundingBox();
    let picked = null;
    for (const fy of [0.4, 0.5, 0.6, 0.3, 0.7]) {
      for (const fx of [0.3, 0.4, 0.5, 0.6, 0.7]) {
        await page.mouse.click(
          rect.x + rect.width * fx,
          rect.y + rect.height * fy,
        );
        const after = await page.getByTestId("flagship-selection").innerText();
        if (after !== before) {
          picked = { scene, fx, fy, before, after };
          break;
        }
      }
      if (picked) break;
    }
    results.picking.push(
      picked || { scene, error: "No raycast selection change" },
    );
    await page
      .getByRole("button", { name: "Đo hiệu năng xoay", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        Boolean(
          document.querySelector('[data-testid="flagship-model"]')?.dataset
            .benchmark,
        ),
      {},
      { timeout: 120000 },
    );
    results.measurements.push({
      scene,
      quality: await page.getByLabel("Chất lượng vật liệu").inputValue(),
      device: "desktop viewport",
      ...JSON.parse(await model.getAttribute("data-benchmark")),
    });
    await page.waitForTimeout(500);
    const idle = Number(await model.getAttribute("data-frames"));
    await page.waitForTimeout(600);
    results.measurements.at(-1).idleRenderDelta =
      Number(await model.getAttribute("data-frames")) - idle;
    await page.getByLabel("Chất lượng vật liệu").selectOption("high");
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="flagship-model"]')?.dataset
          .loaded === "true",
      {},
      { timeout: 120000 },
    );
    await page.waitForFunction(
      () =>
        Number(
          document.querySelector('[data-testid="flagship-model"]')?.dataset
            .textureBytesEstimate,
        ) > 100000000,
      {},
      { timeout: 120000 },
    );
    await page.waitForTimeout(1000);
    await shot(`${scene}-glb-high-1440`);
    results.qualitySwitches.push({
      scene,
      quality: await page.getByLabel("Chất lượng vật liệu").inputValue(),
      loaded: await model.getAttribute("data-loaded"),
    });
    await page.getByLabel("Chất lượng vật liệu").selectOption("balanced");
    await page.setViewportSize({ width: 390, height: 844 });
    // Remount so mobile DPR and shadow policy reflect a cold mobile viewport.
    await page.getByRole("button", { name: "Ảnh Cycles", exact: true }).click();
    await page.getByRole("button", { name: "Mô hình 3D", exact: true }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="flagship-model"]')?.dataset
          .loaded === "true",
      {},
      { timeout: 120000 },
    );
    await page.waitForTimeout(600);
    await shot(`${scene}-glb-390`);
    await page
      .getByRole("button", { name: "Đo hiệu năng xoay", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        Boolean(
          document.querySelector('[data-testid="flagship-model"]')?.dataset
            .benchmark,
        ),
      {},
      { timeout: 120000 },
    );
    results.measurements.push({
      scene,
      quality: await page.getByLabel("Chất lượng vật liệu").inputValue(),
      device: "mobile viewport emulation, same desktop hardware",
      ...JSON.parse(await model.getAttribute("data-benchmark")),
    });
    results.measurements.at(-1).horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (scene === "A0302") {
      await page
        .getByRole("button", { name: "Phòng khách 360°", exact: true })
        .click();
      await page
        .locator(".flagship-tour canvas")
        .waitFor({ state: "visible", timeout: 45000 });
      await page
        .locator(".tour-loading")
        .waitFor({ state: "hidden", timeout: 45000 });
      await page.waitForTimeout(100);
      await shot("A0302-tour-390");
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.waitForTimeout(100);
      await shot("A0302-tour-1440");
    } else await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await writeFile(
    resolve(out, "runtime.json"),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
console.log(
  JSON.stringify(
    {
      measurements: results.measurements,
      picking: results.picking,
      errors: results.errors,
    },
    null,
    2,
  ),
);

if (
  results.errors.length ||
  results.picking.some((p) => p.error) ||
  results.measurements.some((m) => m.horizontalOverflow)
)
  throw new Error(
    "Review found a runtime, selection or overflow error. Inspect runtime.json.",
  );
