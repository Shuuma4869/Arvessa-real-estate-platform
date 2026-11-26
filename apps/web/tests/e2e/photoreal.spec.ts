import { test, expect } from "@playwright/test";

test("flagship exterior loads a real GLB, rotates, and keeps inventory links", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/spatial-review");
  await page.getByRole("button", { name: "Mô hình 3D", exact: true }).click();
  const model = page.getByTestId("flagship-model");
  await expect(model).toHaveAttribute("data-loaded", "true");
  await testInfo.attach("WebGL renderer", {
    body:
      (await model.locator("canvas").getAttribute("data-renderer")) ||
      "unavailable",
    contentType: "text/plain",
  });
  await testInfo.attach("GLB load time (traced test browser)", {
    body: (await model.getAttribute("data-load-ms")) || "unavailable",
    contentType: "text/plain",
  });
  await expect
    .poll(async () => Number(await model.getAttribute("data-triangles")))
    .toBeGreaterThan(10000);
  const before = await model.getAttribute("data-camera");
  const box = await model.boundingBox();
  if (!box) throw Error("Missing GLB viewport");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 95,
    box.y + box.height / 2 + 20,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(model).not.toHaveAttribute("data-camera", before || "");
  await expect(model.locator("canvas")).toHaveAttribute(
    "data-render-scale",
    "1",
  );
  await page.getByLabel("Tháp", { exact: true }).selectOption("B");
  await page.getByLabel("Tầng", { exact: true }).selectOption("4");
  await page.getByRole("button", { name: /B0403/ }).click();
  await expect(
    page.getByRole("link", { name: "Khám phá căn B0403" }),
  ).toHaveAttribute("href", "/properties/B0403");
  expect(errors).toEqual([]);
});

test("A0302 GLB and floorplan retain room selection and recover context loss", async ({
  page,
}) => {
  await page.goto("/spatial-review");
  await page.getByRole("button", { name: /Residence A0302/ }).click();
  await page.getByRole("button", { name: "Mô hình 3D", exact: true }).click();
  const model = page.getByTestId("flagship-model");
  await expect(model).toHaveAttribute("data-loaded", "true");
  await page.getByRole("button", { name: "Phòng ngủ 2", exact: true }).click();
  await expect(page.getByTestId("flagship-selection")).toContainText(
    "Phòng ngủ 2",
  );
  await page.getByRole("button", { name: "Mặt bằng", exact: true }).click();
  await expect(
    page.getByLabel("Mặt bằng 2 phòng ngủ, 107 mét vuông"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mô hình 3D", exact: true }).click();
  await expect(model).toHaveAttribute("data-loaded", "true");
  await model
    .locator("canvas")
    .evaluate((c) =>
      c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(
    page.getByRole("button", { name: "Thử lại", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(model).toHaveAttribute("data-loaded", "true");
  await expect(
    page.getByRole("button", { name: "Thử lại", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Đi tới quy trình giữ căn" }),
  ).toHaveAttribute("href", "/reserve/A0302");
});

test("flagship panorama changes with keyboard and review remains usable on mobile", async ({
  page,
}) => {
  await page.goto("/spatial-review");
  await page.getByRole("button", { name: /Residence A0302/ }).click();
  await page.getByRole("button", { name: "Phòng ngủ 2", exact: true }).click();
  await page
    .getByRole("button", { name: "Phòng khách 360°", exact: true })
    .click();
  await expect(page.getByTestId("flagship-selection")).toContainText(
    "Phòng khách",
  );
  await expect(
    page.getByRole("button", { name: "Phòng ngủ 2", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Đang mở không gian…", { exact: true }),
  ).toHaveCount(0);
  const canvas = page.locator(".flagship-tour canvas");
  await expect(canvas).toBeVisible();
  const before = await canvas.screenshot();
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => Buffer.compare(before, await canvas.screenshot()))
    .not.toBe(0);
  await expect(page.locator(".flagship-tour .tour-hotspot")).toHaveCount(0);
  await page.getByRole("button", { name: "Ảnh Cycles", exact: true }).click();
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
