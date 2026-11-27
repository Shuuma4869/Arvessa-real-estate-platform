import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

test("production lab performance: LCP, CLS and interaction timing", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(180000);
  const records: Record<string, unknown>[] = [];
  for (const profile of ["desktop-local", "mobile-lab-4x-cpu"]) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({
        baseURL,
        viewport: profile.startsWith("mobile")
          ? { width: 390, height: 844 }
          : { width: 1440, height: 1000 },
      });
      const page = await context.newPage();
      if (profile.startsWith("mobile")) {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await cdp.send("Network.enable");
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 100,
          downloadThroughput: 200000,
          uploadThroughput: 100000,
        });
      }
      await page.addInitScript(() => {
        const metrics = {
          lcp: 0,
          cls: 0,
          events: [] as number[],
          longTasks: [] as number[],
          supported: PerformanceObserver.supportedEntryTypes,
        };
        (window as unknown as { arvessaLab: typeof metrics }).arvessaLab =
          metrics;
        for (const type of [
          "largest-contentful-paint",
          "layout-shift",
          "event",
          "longtask",
        ]) {
          if (!metrics.supported.includes(type)) continue;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const e = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
                interactionId: number;
              };
              if (type === "largest-contentful-paint")
                metrics.lcp = e.startTime;
              if (type === "layout-shift" && !e.hadRecentInput)
                metrics.cls += e.value;
              if (type === "event" && e.interactionId)
                metrics.events.push(e.duration);
              if (type === "longtask") metrics.longTasks.push(e.duration);
            }
          }).observe({
            type,
            buffered: true,
            ...(type === "event" ? { durationThreshold: 16 } : {}),
          });
        }
      });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);
      await page.locator(".immersive-carousel").scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Dự án 2: Cedar House" }).click();
      await page.getByRole("button", { name: "Dự án 3: Horizon Bay" }).click();
      await page.waitForTimeout(400);
      const metrics: Record<string, unknown> = await page.evaluate(() => ({
        ...(window as unknown as { arvessaLab: Record<string, unknown> })
          .arvessaLab,
        transferBytes: performance
          .getEntriesByType("resource")
          .reduce(
            (sum, e) => sum + (e as PerformanceResourceTiming).transferSize,
            0,
          ),
        resources: performance.getEntriesByType("resource").length,
      }));
      records.push({ profile, run, ...metrics });
      expect
        .soft(Number(metrics.lcp), `${profile} run ${run}: LCP`)
        .toBeGreaterThan(0);
      expect
        .soft(Number(metrics.lcp), `${profile} run ${run}: LCP`)
        .toBeLessThanOrEqual(2500);
      expect
        .soft(Number(metrics.cls), `${profile} run ${run}: CLS`)
        .toBeLessThanOrEqual(0.1);
      await context.close();
    }
  }
  await mkdir("../../docs/qa-evidence", { recursive: true });
  await writeFile(
    "../../docs/qa-evidence/performance.json",
    JSON.stringify(
      {
        date: new Date().toISOString().slice(0, 10),
        browser: browser.version(),
        kind: "Local lab only; event durations are not field INP",
        conditions:
          "Production loopback; 3 cold browser contexts each. Mobile: 390x844, CPU x4, RTT 100ms, download 200000 B/s. Desktop: 1440x1000, unthrottled. DPR 1. No field samples.",
        records,
      },
      null,
      2,
    ),
  );
});
