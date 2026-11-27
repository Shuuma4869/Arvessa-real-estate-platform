import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";

const evidence = process.env.ARVESSA_PUBLIC_EVIDENCE;
async function capture(page: Page, name: string) {
  if (!evidence) return;
  await mkdir(evidence, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: join(evidence, name + ".jpg"),
    type: "jpeg",
    quality: 82,
    animations: "disabled",
  });
}

for (const width of [1440, 390]) {
  test(`public collection and vertical inventory at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    await expect(page.locator(".hero-scene-image img")).toBeVisible();
    await capture(page, "landing-" + width);
    await page.getByRole("button", { name: "Không gian", exact: true }).click();
    await expect(page.locator(".hero-scene-image img")).toHaveAttribute(
      "src",
      /two-bedroom/,
    );
    const collection = page.getByRole("region", { name: "Bộ sưu tập dự án" });
    await collection.scrollIntoViewIfNeeded();
    await collection.focus();
    await page.keyboard.press("End");
    const card = collection.locator(".coverflow-card.active");
    await expect(card.getByRole("link")).toHaveAttribute(
      "href",
      "/properties/A0302",
    );
    const favorite = card.getByRole("button", { name: "Yêu thích A0302" });
    await card.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
    const favoriteBefore = await favorite.getAttribute("aria-pressed");
    await favorite.click();
    await expect(favorite).toHaveAttribute(
      "aria-pressed",
      String(favoriteBefore !== "true"),
    );
    const compare = card.getByRole("button", { name: "So sánh A0302" });
    await compare.click();
    await expect(compare).toHaveAttribute("aria-pressed", "true");
    await capture(page, "coverflow-" + width);
    await page.goto("/discover");
    await expect(page.locator(".results-toolbar strong")).toHaveText("84");
    await page
      .getByRole("navigation", { name: "Lọc nhanh theo dự án" })
      .getByRole("button", { name: /Cedar House/ })
      .click();
    await expect(page.locator(".results-toolbar strong")).toHaveText("16");
    await capture(page, "discover-" + width);
    await page.getByRole("button", { name: "Sơ đồ vị trí" }).click();
    await expect(page.locator(".discovery-level")).toHaveCount(4);
    await expect(page.locator(".discovery-level .unit-tile")).toHaveCount(16);
    await page.getByRole("button", { name: /C0401/ }).click();
    await expect(
      page.getByRole("dialog").getByRole("link", { name: "Xem chi tiết căn" }),
    ).toHaveAttribute("href", "/properties/C0401");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("masterplan selects the same unit across geometry tiers", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/projects/stillwater#masterplan");
  const site = page.locator("#masterplan");
  await site
    .getByRole("button", { name: "Khám phá tháp B", exact: true })
    .click();
  await site.getByLabel("Tầng", { exact: true }).selectOption("4");
  await site.getByLabel("căn phù hợp", { exact: false }).selectOption("B0402");
  await expect(site.getByRole("link", { name: "Xem căn B0402" })).toBeVisible();
  await site.getByRole("button", { name: "Khám phá tổng thể 3D" }).click();
  const canvas = site.locator("canvas");
  await expect(canvas).toHaveAttribute("data-inventory", "48");
  await site.getByLabel("Góc nhìn khu đất").selectOption("waterfront");
  await site.getByRole("button", { name: "Nhãn tháp" }).click();
  await expect(
    site.getByRole("button", { name: "Khám phá tháp B", exact: true }),
  ).toHaveCount(0);
  await capture(page, "masterplan-1440");
  await site.getByRole("link", { name: "Mở mô hình tương tác" }).click();
  await expect(page.getByLabel("Chọn căn bằng bàn phím")).toHaveValue("B0402");
  const model = page.locator("canvas");
  const measured: Record<string, number> = {};
  for (const tier of ["standard", "compact"]) {
    await page
      .getByRole("combobox", { name: "Chi tiết mô hình" })
      .selectOption(tier);
    await expect(model).toHaveAttribute("data-geometry-tier", tier);
    await expect(model).toHaveAttribute("data-inventory", "48");
    measured[tier] = Number(await model.getAttribute("data-triangles"));
  }
  expect(measured.compact).toBeGreaterThan(0);
  expect(measured.compact).toBeLessThan(measured.standard);
  if (evidence) {
    await mkdir(evidence, { recursive: true });
    await writeFile(
      join(evidence, "inventory-lod.json"),
      JSON.stringify(
        {
          viewport: page.viewportSize(),
          renderer: await model.getAttribute("data-renderer"),
          triangles: measured,
          inventory: 48,
        },
        null,
        2,
      ),
    );
  }
  await model.scrollIntoViewIfNeeded();
  await capture(page, "showroom-1440");
  await page.getByRole("button", { name: "Chế độ 2D" }).click();
  await expect(page.locator(".canvas-wrap .unit-tile")).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "Khám phá căn B0402" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/stillwater#masterplan");
  await site.getByRole("button", { name: "Khám phá tổng thể 3D" }).click();
  await expect(canvas).toHaveAttribute("data-geometry-tier", "compact");
  await canvas.scrollIntoViewIfNeeded();
  await capture(page, "masterplan-390");
});
