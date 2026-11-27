import { expect, test } from "@playwright/test";

test("unsupported saved data survives a demo session without losing the original", async ({
  page,
}) => {
  const raw = JSON.stringify({ version: 22, savedNotes: ["Hồ sơ đang xử lý"] });
  await page.goto("/");
  await page.evaluate(
    (value) => localStorage.setItem("arvessa.demo.v1", value),
    raw,
  );
  await page.reload();
  await expect(page.locator(".storage-warning")).toContainText(
    "Bản lưu được giữ nguyên",
  );
  await page.goto("/properties/A0302");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A0302");
  expect(
    await page.evaluate(() => localStorage.getItem("arvessa.demo.v1")),
  ).toBe(raw);
});

test("older buyer records gain optional fields and keep their selection", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => localStorage.getItem("arvessa.demo.v1"));
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("arvessa.demo.v1")!);
    delete data.waitlist;
    delete data.recentlyViewed;
    delete data.preferences.widgets;
    data.favorites = ["B0302"];
    localStorage.setItem("arvessa.demo.v1", JSON.stringify(data));
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem("arvessa.demo.v1")!);
        return [
          data.favorites,
          data.waitlist,
          data.recentlyViewed,
          Array.isArray(data.preferences.widgets),
        ];
      }),
    )
    .toEqual([["B0302"], [], [], true]);
});
