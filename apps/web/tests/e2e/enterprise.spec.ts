import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, role: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Vai trò trình diễn").selectOption(role);
  await page.getByRole("button", { name: "Vào không gian demo" }).click();
  await expect(page.getByLabel("Chuyển vai trò demo")).toBeVisible();
}

test("công việc cá nhân được hoàn tất và đồng bộ với danh sách CRM", async ({
  page,
}) => {
  await signIn(page, "sales");
  await page.goto("/crm/personal");
  await expect(
    page.getByRole("heading", { name: "Lịch tham quan sắp tới" }),
  ).toBeVisible();
  const task = "Chuẩn bị lịch tham quan cho Minh Anh";
  await page.getByRole("button", { name: "Xử lý", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Trạng thái").selectOption("Hoàn thành");
  await dialog.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByText("Bạn đã xử lý hết công việc được giao."),
  ).toBeVisible();
  await expect(page.getByText("Cập nhật · " + task)).toBeVisible();
  await page.getByRole("link", { name: "Xem công việc" }).click();
  await expect(page.getByRole("row").filter({ hasText: task })).toContainText(
    "Hoàn thành",
  );
});

test("quản trị chuyển giữa ma trận CRM và Management", async ({ page }) => {
  await signIn(page, "admin");
  await page.goto("/management/security");
  const matrix = page.locator(".permission-table");
  await expect(matrix.locator("tbody tr")).toHaveCount(14);
  await page.getByLabel("Không gian phân quyền").selectOption("management");
  await expect(matrix.locator("tbody tr")).toHaveCount(8);
  await expect(
    matrix.getByRole("rowheader", { name: "Thiết lập workspace" }),
  ).toBeVisible();
});

test("khách đổi giờ sau xác nhận, chuyên viên duyệt lại và khách nhận thông báo", async ({
  page,
}) => {
  await signIn(page, "buyer");
  await page.goto("/buyer/appointments");
  await page
    .getByRole("button", { name: /Mở hồ sơ/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  const date =
    new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10) + "T14:30";
  await dialog.getByLabel("Ngày giờ tham quan").fill(date);
  await dialog.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "A0302" }),
  ).toContainText("Chờ xác nhận");
  await signIn(page, "sales");
  await page.goto("/crm/personal");
  await page.getByRole("button", { name: "Mở lịch hẹn" }).click();
  await dialog.getByLabel("Trạng thái").selectOption("Đã xác nhận");
  await dialog.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(dialog).toHaveCount(0);
  await signIn(page, "buyer");
  await page.getByRole("button", { name: "Thông báo", exact: true }).click();
  await expect(
    dialog.getByText("Cập nhật · Lịch tham quan A0302").first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/buyer/appointments");
  await expect(
    page.getByRole("row").filter({ hasText: "A0302" }),
  ).toContainText("Đã xác nhận");
});
