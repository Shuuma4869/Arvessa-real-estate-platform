import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("active masterplan tower remains readable and links to matching inventory", async ({
  page,
}) => {
  await page.goto("/projects/stillwater");
  await page.getByRole("button", { name: "Khám phá tổng thể 3D" }).click();
  await expect(page.locator(".masterplan canvas")).toHaveAttribute(
    "data-inventory",
    "48",
  );
  const tower = page.getByRole("button", { name: "Chọn tháp B", exact: true });
  await tower.click();
  await expect(tower).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "Mở mô hình tương tác" }),
  ).toHaveAttribute("href", /tower=B/);
  const result = await new AxeBuilder({ page })
    .include(".masterplan-towers")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("floorplan types, furnished WebGL, room navigation and real panorama keyboard", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/properties/A0302");
  const experience = page.getByRole("region", {
    name: "Khám phá không gian căn A0302",
  });
  await experience.scrollIntoViewIfNeeded();
  await expect(
    experience.getByLabel("Mặt bằng 2 phòng ngủ, 107 mét vuông"),
  ).toBeVisible();
  await experience
    .getByRole("button", { name: "Dollhouse 3D", exact: true })
    .click();
  await expect(experience.locator("canvas")).toHaveAttribute("data-rooms", "8");
  const canvas = experience.locator("canvas");
  const before = await canvas.screenshot();
  await experience.getByRole("button", { name: "Đặt lại góc nhìn" }).click();
  const rect = await canvas.boundingBox();
  if (!rect) throw Error("Missing WebGL canvas");
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2 + 90,
    rect.y + rect.height / 2 + 30,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.waitForTimeout(400);
  expect(Buffer.compare(before, await canvas.screenshot())).not.toBe(0);
  await experience
    .getByRole("button", { name: "Tour 360°", exact: true })
    .click();
  await expect(experience.getByText("Đang mở không gian…")).toHaveCount(0);
  const pano = experience.locator("canvas");
  await pano.focus();
  const image = await pano.screenshot();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(120);
  expect(Buffer.compare(image, await pano.screenshot())).not.toBe(0);
  await experience
    .getByRole("button", { name: "Phòng tiếp theo", exact: true })
    .click();
  await expect(experience.locator(".residence-room-info")).toContainText(
    "Bếp & phòng ăn",
  );
  await expect(experience.getByText("Đang mở không gian…")).toHaveCount(0);
  await experience
    .locator("canvas")
    .evaluate((c) =>
      c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(experience.getByRole("status")).toContainText("Mặt bằng 2D");
  for (const [id, beds] of [
    ["A0301", 1],
    ["A0304", 3],
  ] as const) {
    await page.goto(`/properties/${id}`);
    await expect(page.locator(".residence-plan svg").first()).toHaveAttribute(
      "aria-label",
      new RegExp(`Mặt bằng ${beds} phòng ngủ`),
    );
  }
  expect(errors).toEqual([]);
});
test("new spatial controls are accessible and mobile fits", async ({
  page,
}) => {
  await page.goto("/properties/A0302");
  await page
    .getByRole("region", { name: "Khám phá không gian căn A0302" })
    .scrollIntoViewIfNeeded();
  const results = await new AxeBuilder({ page })
    .include(".residence-experience")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  for (const width of [360, 390, 768, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("coverflow drag releases CTA and hero changes actual image", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Không gian", exact: true }).click();
  await expect(page.locator(".hero-scene-image img")).toHaveAttribute(
    "src",
    /stillwater-two-bedroom/,
  );
  const stage = page.locator(".coverflow-stage");
  await stage.scrollIntoViewIfNeeded();
  const r = await stage.boundingBox();
  if (!r) throw Error("Missing coverflow");
  await page.mouse.move(r.x + r.width / 2, r.y + 120);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 - 160, r.y + 120, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const link = page.locator(".coverflow-card.active a");
  const href = await link.getAttribute("href");
  await link.click();
  await expect(page).toHaveURL(new RegExp(href!));
});
