import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: Page, role = "buyer") {
  await page.goto("/sign-in");
  await page.getByLabel("Vai trò trình diễn").selectOption(role);
  await page.getByRole("button", { name: "Vào không gian demo" }).click();
  await expect(page.getByLabel("Chuyển vai trò demo")).toBeVisible();
}
async function hold(page: Page, scenario = "normal", id = "A0302") {
  await page.goto(`/reserve/${id}`);
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByLabel("Tôi đã đọc điều khoản demo").check();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByLabel("Tôi xác nhận hồ sơ demo").check();
  if (scenario !== "normal") {
    await page.getByText("Kịch bản mô phỏng", { exact: true }).click();
    await page.getByLabel("Tình huống khi gửi").selectOption(scenario);
  }
  await page.getByRole("button", { name: "Gửi yêu cầu giữ căn demo" }).click();
}
async function pay(page: Page, outcome = "success") {
  await page.getByRole("button", { name: "Tiếp tục thanh toán demo" }).click();
  await page.getByLabel("Kết quả mô phỏng").selectOption(outcome);
  await page
    .getByLabel("Tôi hiểu và đồng ý điều khoản thanh toán mô phỏng.")
    .check();
  await page.getByRole("button", { name: "Gửi thanh toán demo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test("public landing → project → detail and carousel keyboard", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Một nhịp sống khác",
  );
  const carousel = page.getByRole("region", { name: "Bộ sưu tập dự án" });
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "Dự án 2: Cedar House" }),
  ).toHaveAttribute("aria-current", "true");
  await page.goto("/projects/stillwater");
  await page
    .getByRole("link", { name: "Garden residence A0302", exact: true })
    .click();
  await expect(page).toHaveURL(/properties\/A0302/);
  await expect(page.getByText("107 m²", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("discovery filters, empty state, quick view and compare", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByLabel("Tên hoặc mã căn").fill("A0302");
  await expect(page.locator(".property-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=A0302/);
  await page.getByRole("button", { name: "Xem nhanh" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "So sánh A0302" }).click();
  await page.getByLabel("Tên hoặc mã căn").fill("A0303");
  await page.getByRole("button", { name: "So sánh A0303" }).click();
  await page.getByRole("link", { name: "Mở so sánh" }).click();
  await expect(page.getByRole("table")).toContainText("A0302");
  await expect(page.getByRole("table")).toContainText("A0303");
  await page.goto("/discover?minArea=999");
  await expect(page.getByText("Chưa tìm thấy căn phù hợp")).toBeVisible();
});
test("3D canvas loads and selection navigates to correct property; 2D fallback usable", async ({
  page,
}) => {
  await page.goto("/explorer");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByLabel("Chọn căn bằng bàn phím").selectOption("B0402");
  await page.getByRole("link", { name: "Khám phá căn B0402" }).click();
  await expect(page).toHaveURL(/properties\/B0402/);
  await page.goto("/explorer");
  await page.getByRole("button", { name: "Chế độ 2D" }).click();
  await page
    .getByRole("combobox", { name: "Tầng", exact: true })
    .selectOption("2");
  await page.getByRole("button", { name: /A0202/ }).click();
  await expect(
    page.getByRole("link", { name: "Khám phá căn A0202" }),
  ).toBeVisible();
});
test("buyer cannot open CRM and sales cannot open financial moduleKey", async ({
  page,
}) => {
  await login(page);
  await page.goto("/crm/leads");
  await expect(
    page.getByRole("heading", { name: "Quyền truy cập giới hạn." }),
  ).toBeVisible();
  await login(page, "sales");
  await page.goto("/crm/payments");
  await expect(
    page.getByRole("heading", { name: "Quyền truy cập giới hạn." }),
  ).toBeVisible();
});
test("buyer favorites persist across reload", async ({ page }) => {
  await login(page);
  await page.goto("/properties/A0101");
  await page.getByRole("button", { name: "Yêu thích", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Bỏ yêu thích", exact: true }),
  ).toBeVisible();
  await page.goto("/buyer/properties");
  await expect(
    page.getByRole("heading", { name: "Garden residence A0101" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Garden residence A0101" }),
  ).toBeVisible();
});
test("buyer creates appointment and collision is blocked", async ({ page }) => {
  await login(page);
  await page.goto("/buyer/appointments");
  await page
    .getByRole("button", { name: "Đặt lịch tham quan", exact: true })
    .click();
  const date =
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) + "T10:30";
  await page.getByLabel("Ngày giờ tham quan").fill(date);
  await page.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Đặt lịch tham quan", exact: true })
    .click();
  await page.getByLabel("Ngày giờ tham quan").fill(date);
  await page.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(page.locator(".error-text[role=alert]")).toContainText(
    "Trùng lịch",
  );
});
test("hold, success payment, transaction history and reload", async ({
  page,
}) => {
  await login(page);
  await hold(page);
  await expect(page.getByText("Đang giữ căn", { exact: true })).toBeVisible();
  await pay(page);
  await expect(
    page.locator(".badge").filter({ hasText: "Đã xác nhận cọc demo" }).first(),
  ).toBeVisible();
  await page.goto("/buyer/payments");
  await expect(
    page.locator(".badge").filter({ hasText: "Đã xác nhận demo" }).first(),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Xem biên nhận demo" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "không phải chứng từ kế toán",
  );
});
test("conflict is explicit and has no payment action", async ({ page }) => {
  await login(page);
  await hold(page, "conflict");
  await expect(
    page.getByText("Xung đột giữ căn", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tiếp tục thanh toán demo" }),
  ).toHaveCount(0);
});
test("expired hold releases selection", async ({ page }) => {
  await login(page);
  await hold(page, "expired");
  await expect(page.getByText("Hết hạn giữ căn", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("button", { name: "Tiếp tục thanh toán demo" }),
  ).toHaveCount(0);
});
test("failed payment can retry, pending can reconcile in finance role", async ({
  page,
}) => {
  await login(page);
  await hold(page);
  await pay(page, "failed");
  await expect(
    page
      .locator(".badge")
      .filter({ hasText: "Thanh toán mô phỏng thất bại" })
      .first(),
  ).toBeVisible();
  await pay(page, "pending");
  await expect(
    page.locator(".badge").filter({ hasText: "Chờ đối soát" }).first(),
  ).toBeVisible();
  await login(page, "finance");
  await page.goto("/crm/payments");
  await page.getByRole("button", { name: "Đối soát: xác nhận" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.locator(".badge").filter({ hasText: "Đã xác nhận demo" }).first(),
  ).toBeVisible();
});
test("offline scenario errors and recovery completes", async ({ page }) => {
  await login(page);
  await hold(page, "offline");
  await expect(page.locator(".error-text[role=alert]")).toContainText(
    "Mất kết nối",
  );
  await page.getByLabel("Tình huống khi gửi").selectOption("normal");
  await page.getByRole("button", { name: "Gửi yêu cầu giữ căn demo" }).click();
  await expect(page.getByText("Đang giữ căn", { exact: true })).toBeVisible();
});
test("sales creates lead, converts opportunity, changes stage", async ({
  page,
}) => {
  await login(page, "sales");
  await page.goto("/crm/leads");
  await page
    .getByRole("button", { name: "Tạo khách hàng tiềm năng", exact: true })
    .click();
  await page.getByLabel("Họ tên").fill("Khách Kiểm Thử");
  await page.getByLabel("Email demo").fill("qa@example.test");
  await page.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("row")
    .filter({ hasText: "Khách Kiểm Thử" })
    .getByRole("button", { name: /Mở hồ sơ/ })
    .click();
  await page.getByRole("button", { name: "Chuyển thành cơ hội" }).click();
  await expect(page.getByRole("dialog")).toContainText("Đã chuyển");
  await page.goto("/crm/pipeline");
  await page
    .getByLabel("Giai đoạn Khách Kiểm Thử · A0302")
    .selectOption("Tham quan");
  await expect(
    page
      .locator(".kanban-column")
      .filter({ has: page.getByRole("heading", { name: /Tham quan/ }) }),
  ).toContainText("Khách Kiểm Thử");
});
test("extension flows from buyer to management approval", async ({ page }) => {
  await login(page);
  await hold(page);
  await page.getByRole("button", { name: "Yêu cầu gia hạn" }).click();
  await expect(
    page.getByText("Chờ duyệt gia hạn", { exact: true }),
  ).toBeVisible();
  await login(page, "manager");
  await page.goto("/management/approvals");
  await page.getByRole("button", { name: /Mở hồ sơ/ }).click();
  await page
    .getByLabel("Ý kiến phê duyệt / từ chối")
    .fill("Đã kiểm tra hồ sơ demo");
  await page.getByRole("button", { name: "Phê duyệt yêu cầu" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Chi tiết phê duyệt" }),
  ).toContainText("Đã duyệt");
});
test("buyer profile and support conversation", async ({ page }) => {
  await login(page);
  await page.goto("/buyer/profile");
  await page.getByRole("button", { name: "Chỉnh sửa hồ sơ" }).click();
  await page.getByLabel("Họ tên").fill("Minh Anh Demo");
  await page.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Minh Anh Demo" }),
  ).toBeVisible();
  await page.goto("/buyer/support");
  await page.getByRole("button", { name: "Tạo yêu cầu hỗ trợ" }).click();
  await page.getByLabel("Tiêu đề").fill("Cần sơ đồ chỗ đỗ xe");
  await page.getByLabel("Nội dung yêu cầu").fill("Vui lòng gửi sơ đồ demo");
  await page.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Cần sơ đồ chỗ đỗ xe" })
    .getByRole("button", { name: /Mở hồ sơ/ })
    .click();
  await page.getByLabel("Nội dung trả lời").fill("Tôi đã xem thông tin.");
  await page.getByRole("button", { name: "Gửi vào hội thoại demo" }).click();
  await expect(page.getByRole("dialog")).toContainText("Tôi đã xem thông tin.");
});
test("all CRM modules and management modules render without runtime errors", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page, "admin");
  for (const moduleKey of [
    "dashboard",
    "leads",
    "customers",
    "pipeline",
    "inventory",
    "appointments",
    "reservations",
    "payments",
    "contracts",
    "tasks",
    "support",
    "marketing",
    "reports",
    "personal",
  ]) {
    await page.goto("/crm/" + moduleKey);
    await expect(page.locator(".workspace-heading h1")).toBeVisible();
    await expect(page.getByText("Chưa tải được không gian.")).toHaveCount(0);
  }
  for (const moduleKey of [
    "dashboard",
    "teams",
    "approvals",
    "inventory",
    "finance",
    "security",
    "cms",
    "settings",
  ]) {
    await page.goto("/management/" + moduleKey);
    await expect(page.locator(".workspace-heading h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("responsive widths, keyboard, sound off and reduced-motion", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: `../../.agent-work/landing-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở điều hướng" }).click();
  await expect(
    page.getByRole("navigation", { name: "Điều hướng chính" }),
  ).toBeVisible();
  await login(page);
  await page.goto("/buyer/profile");
  await expect(
    page.getByRole("button", { name: "Bật âm thanh", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Thu gọn hoặc mở menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Điều hướng workspace" }),
  ).toBeVisible();
});
test("accessibility smoke on public, auth and workspace", async ({ page }) => {
  test.setTimeout(120000);
  for (const path of ["/", "/sign-in", "/discover"]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await login(page, "admin");
  await page.goto("/crm/dashboard");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
