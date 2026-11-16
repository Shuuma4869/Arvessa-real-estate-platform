import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("project masterplan hotspot opens the matching 3D tower and gallery closes with keyboard", async ({
  page,
}) => {
  await page.goto("/projects/stillwater");
  const photo = page.getByRole("button", {
    name: "Mở phối cảnh 2 của The Stillwater",
  });
  await photo.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(photo).toBeFocused();
  await page
    .getByRole("button", { name: "Khám phá tháp B", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tháp B. Một góc nhìn riêng." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Mở mô hình tương tác" }).click();
  await expect(
    page.getByRole("combobox", { name: "Tháp", exact: true }),
  ).toHaveValue("B");
  await expect(
    page
      .getByLabel("Chọn căn bằng bàn phím")
      .locator("option")
      .filter({ hasText: "A0302" }),
  ).toHaveCount(0);
});

test("camera presets preserve unit selection with reduced motion and day/night", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/explorer?unit=B0402");
  await expect(page.locator("canvas")).toBeVisible();
  for (const name of ["Mặt đứng", "Từ trên cao", "Phối cảnh"]) {
    const button = page.getByRole("button", { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Chọn căn bằng bàn phím")).toHaveValue(
      "B0402",
    );
  }
  await page.getByRole("button", { name: "Ban đêm", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByLabel("Chọn căn bằng bàn phím")).toHaveValue("B0402");
  await page.getByRole("button", { name: "Chế độ 2D" }).click();
  await page.getByRole("button", { name: /^B0402/ }).click();
  await expect(
    page.getByRole("link", { name: "Khám phá căn B0402" }),
  ).toHaveAttribute("href", "/properties/B0402");
});

test("legacy project imagery remains distinct without resetting saved buyer data", async ({
  page,
}) => {
  await page.goto("/discover");
  await page
    .getByRole("button", { name: "Yêu thích A0101", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Bỏ yêu thích A0101", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const [project, asset] of [
    ["stillwater", "stillwater-blue-hour"],
    ["cedar", "cedar-courtyard"],
    ["horizon", "horizon-coast"],
  ]) {
    await page.goto(`/projects/${project}`);
    const image = page.locator(".project-hero img");
    await expect(image).toHaveAttribute("src", new RegExp(asset));
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Bỏ yêu thích A0101", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("new project, brand and mobile navigation remain accessible", async ({
  page,
}) => {
  for (const route of ["/projects/stillwater", "/brand"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở điều hướng" }).click();
  await expect(
    page.getByRole("navigation", { name: "Điều hướng chính" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
