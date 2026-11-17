import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
async function login(page: Page, role = "buyer") {
  await page.goto("/sign-in");
  await page.getByLabel("Vai trò trình diễn").selectOption(role);
  await page.getByRole("button", { name: "Vào không gian demo" }).click();
  await expect(page.getByLabel("Chuyển vai trò demo")).toBeVisible();
}
async function deposit(page: Page) {
  await login(page);
  await page.goto("/reserve/A0302");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByLabel("Tôi đã đọc điều khoản demo").check();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByLabel("Tôi xác nhận hồ sơ demo").check();
  await page.getByRole("button", { name: "Gửi yêu cầu giữ căn demo" }).click();
  await page.getByRole("button", { name: "Tiếp tục thanh toán demo" }).click();
  await page
    .getByLabel("Tôi hiểu và đồng ý điều khoản thanh toán mô phỏng.")
    .check();
  await page.getByRole("button", { name: "Gửi thanh toán demo" }).click();
  await expect(
    page.locator(".badge").filter({ hasText: "Đã xác nhận cọc demo" }).first(),
  ).toBeVisible();
}
async function approve(page: Page, kind: string, approved = true) {
  await login(page, "admin");
  await page.goto("/management/approvals");
  await page
    .getByRole("row")
    .filter({ hasText: kind })
    .getByRole("button", { name: /Mở hồ sơ/ })
    .click();
  await page
    .getByLabel("Ý kiến phê duyệt / từ chối")
    .fill("Đã kiểm tra hồ sơ trình diễn");
  await page
    .getByRole("button", {
      name: approved ? "Phê duyệt yêu cầu" : "Từ chối yêu cầu",
    })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Chi tiết phê duyệt" })
      .locator(".badge")
      .first(),
  ).toContainText(approved ? "Đã duyệt" : "Từ chối");
}
test("deposit → legal version → manager approval → signed contract → buyer", async ({
  page,
}) => {
  await deposit(page);
  await login(page, "legal");
  await page.goto("/crm/contracts");
  await page.getByRole("button", { name: "Tạo dự thảo" }).click();
  await page.getByRole("button", { name: /Mở hồ sơ/ }).click();
  await page
    .getByRole("button", { name: "Cập nhật checklist / phiên bản" })
    .click();
  await page
    .getByLabel("Mục đã kiểm tra, phân cách bằng dấu phẩy")
    .fill("Hồ sơ khách hàng,Điều khoản dự án");
  await page.getByLabel("Nhận xét", { exact: true }).fill("Đủ hồ sơ demo");
  await page.getByRole("button", { name: "Lưu hồ sơ demo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /Mở hồ sơ/ }).click();
  await page.getByRole("button", { name: "Gửi rà soát và phê duyệt" }).click();
  await expect(page.getByRole("dialog")).toContainText("Chờ duyệt");
  await approve(page, "Duyệt hợp đồng");
  await login(page, "legal");
  await page.goto("/crm/contracts");
  await page.getByRole("button", { name: /Mở hồ sơ/ }).click();
  await page.getByRole("button", { name: "Ký hợp đồng mô phỏng" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.getByRole("dialog").first()).toContainText("Đã ký demo");
  await login(page);
  await page.goto("/buyer/contracts");
  await expect(page.getByRole("table")).toContainText("Đã ký demo");
  await page.goto("/properties/A0302");
  await expect(
    page.locator(".badge").filter({ hasText: "Đã bán" }).first(),
  ).toBeVisible();
});
test("refund rejection then approval updates linked buyer payment and stock", async ({
  page,
}) => {
  await deposit(page);
  await page.goto("/buyer/payments");
  await page.getByRole("button", { name: "Yêu cầu hoàn demo" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.locator(".badge").filter({ hasText: "Chờ duyệt hoàn" }).first(),
  ).toBeVisible();
  await approve(page, "Hoàn tiền demo", false);
  await login(page);
  await page.goto("/buyer/payments");
  await page.getByRole("button", { name: "Yêu cầu hoàn demo" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.locator(".badge").filter({ hasText: "Chờ duyệt hoàn" }).first(),
  ).toBeVisible();
  await approve(page, "Hoàn tiền demo");
  await login(page);
  await page.goto("/buyer/payments");
  await expect(
    page.locator(".badge").filter({ hasText: "Đã hoàn mô phỏng" }).first(),
  ).toBeVisible();
  await page.goto("/properties/A0302");
  await expect(
    page.locator(".badge").filter({ hasText: "Còn trống" }).first(),
  ).toBeVisible();
});
test("waitlist buyer → sales callback and project inventory extension", async ({
  page,
}) => {
  await login(page);
  await page.goto("/buyer/reservations");
  await page.getByRole("button", { name: "Thêm vào danh sách chờ" }).click();
  await expect(page.getByRole("table")).toContainText("Đang chờ");
  await login(page, "sales");
  await page.goto("/crm/reservations");
  await page.getByRole("button", { name: "Đánh dấu đã liên hệ" }).click();
  await expect(page.getByRole("table")).toContainText("Đã liên hệ demo");
  await login(page, "admin");
  await page.goto("/management/inventory");
  await page.getByLabel("Số tầng / tháp (chỉ thêm)").fill("7");
  await page.getByRole("button", { name: "Lưu cấu hình dự án demo" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/explorer");
  await page.getByRole("button", { name: "Chế độ 2D" }).click();
  await page
    .getByRole("combobox", { name: "Tầng", exact: true })
    .selectOption("7");
  await expect(page.locator(".unit-tile")).toHaveCount(8);
});
test("public consultation creates CRM record and CMS updates landing", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByLabel("Tên demo").fill("Khách Website QA");
  await page.getByLabel("Email demo").fill("websiteqa@example.test");
  await page
    .getByLabel("Bạn muốn tìm hiểu điều gì?")
    .fill("Tìm hiểu căn A0302");
  await page.getByRole("button", { name: "Lưu yêu cầu tư vấn demo" }).click();
  await expect(page.getByText("Đã ghi nhận trong demo.")).toBeVisible();
  await login(page, "admin");
  await page.goto("/crm/leads");
  await expect(page.getByRole("table")).toContainText("Khách Website QA");
  await page.goto("/management/cms");
  await page
    .getByLabel("Tiêu đề landing")
    .fill("Một góc nhìn mới. Một nhịp sống riêng.");
  await page.getByRole("button", { name: "Lưu cấu hình demo" }).click();
  await expect(page.locator(".toast")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Một góc nhìn mới.",
  );
  await page.goto("/crm/reports");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất giỏ hàng CSV" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  const stream = await download.createReadStream();
  let csv = "";
  for await (const chunk of stream!) csv += chunk.toString();
  expect(csv).toContain("A0302");
});
test("signup validates password, verifies OTP, keeps profile but no password", async ({
  page,
}) => {
  await page.goto("/sign-up");
  await page.getByLabel("Tên hiển thị demo").fill("Khách Mới QA");
  await page.getByLabel("Email demo").fill("newqa@example.test");
  await page.getByLabel("Mật khẩu mô phỏng").fill("short");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".error-text")).toContainText("8 ký tự");
  await page.getByLabel("Mật khẩu mô phỏng").fill("DemoOnly123!");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByLabel("Mã xác minh demo").fill("123456");
  await page.getByRole("button", { name: "Xác minh và tiếp tục" }).click();
  await expect(page.locator(".error-text")).toContainText("chưa đúng");
  await page.getByLabel("Mã xác minh demo").fill("246810");
  await page.getByRole("button", { name: "Xác minh và tiếp tục" }).click();
  await expect(page).toHaveURL(/buyer\/dashboard/);
  await page.goto("/buyer/profile");
  await expect(
    page.getByRole("heading", { name: "Khách Mới QA" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("DemoOnly123!");
  await page.goto("/forgot-password");
  await page.getByRole("button", { name: "Mở quy trình đặt lại demo" }).click();
  await expect(page).toHaveURL(/reset-password/);
  await page.getByLabel("Mật khẩu mô phỏng").fill("ResetOnly123!");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page).toHaveURL(/verify/);
});
test("actual 3D pointer raycast selects a different unit and supports drag", async ({
  page,
}) => {
  await page.goto("/explorer");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const rect = (await canvas.boundingBox())!;
  let picked = false;
  for (const fx of [0.4, 0.5, 0.6, 0.3, 0.7]) {
    for (const fy of [0.4, 0.5, 0.6, 0.3]) {
      // Labels are now real buttons over the model. Probe visible glazing using
      // actual pointer coordinates, without waiting for a label to stop covering canvas.
      const x = rect.x + rect.width * fx,
        y = rect.y + rect.height * fy;
      if (
        await page.evaluate(
          ({ x, y }) => document.elementFromPoint(x, y)?.tagName !== "CANVAS",
          { x, y },
        )
      )
        continue;
      await page.mouse.click(x, y);
      const selection = await page
        .getByLabel("Chọn căn bằng bàn phím")
        .inputValue();
      if (selection && selection !== "A0302") {
        picked = true;
        break;
      }
    }
    if (picked) break;
  }
  expect(picked).toBe(true);
  await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width * 0.65,
    rect.y + rect.height * 0.55,
    { steps: 12 },
  );
  await page.mouse.up();
  await page.getByRole("button", { name: "Ban đêm" }).click();
  await expect(page.locator("canvas")).toBeVisible();
});
test("extended accessibility, responsive workspace and visual evidence", async ({
  page,
}) => {
  test.setTimeout(180000);
  await mkdir("../../docs/qa-evidence", { recursive: true });
  const results: unknown[] = [];
  for (const path of [
    "/sign-up",
    "/discover",
    "/properties/A0302",
    "/explorer",
    "/contact",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    results.push({ path, violations: result.violations });
    expect
      .soft(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        path,
      )
      .toEqual([]);
  }
  await login(page, "admin");
  for (const path of ["/crm/leads", "/crm/pipeline", "/management/approvals"]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    results.push({ path, violations: result.violations });
    expect
      .soft(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        path,
      )
      .toEqual([]);
  }
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/discover", "/crm/leads", "/management/inventory"]) {
      await page.goto(path);
      expect
        .soft(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${path}@${width}`,
        )
        .toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [path, name] of [
    ["/", "landing"],
    ["/crm/dashboard", "crm"],
    ["/explorer", "explorer"],
  ]) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    for (const img of await page.locator('img[loading="lazy"]').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty("complete", true);
      expect(
        await img.evaluate((e) => (e as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    if (path === "/explorer")
      await expect(page.locator("canvas")).toBeVisible();
    await page.screenshot({
      path: `../../docs/qa-evidence/${name}.png`,
      fullPage: path !== "/crm/dashboard",
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({
    path: "../../docs/qa-evidence/mobile.png",
    fullPage: true,
  });
  await writeFile(
    "../../.agent-work/axe-extended.json",
    JSON.stringify(results, null, 2),
  );
});

test("finance adjustment requires approval and updates buyer amount", async ({
  page,
}) => {
  await deposit(page);
  await login(page, "finance");
  await page.goto("/crm/payments");
  await page
    .getByRole("button", { name: "Đề nghị điều chỉnh cọc", exact: true })
    .click();
  await page.getByLabel("Số tiền cọc đề nghị (VND)").fill("150000000");
  await page.getByLabel("Lý do điều chỉnh").fill("Sửa số liệu nhập demo");
  await page.getByRole("button", { name: "Gửi đề nghị điều chỉnh" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await approve(page, "Điều chỉnh cọc demo");
  await login(page);
  await page.goto("/buyer/payments");
  await expect(page.locator(".reservation-card h3")).toContainText(
    "150.000.000",
  );
});

test("preferences persist, dark contrast, sound opt-in and session expiry", async ({
  page,
}) => {
  await login(page, "admin");
  await page.goto("/crm/personal");
  await page.getByLabel("Màu giao diện").selectOption("dark");
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tắt âm thanh", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Giảm chuyển động", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Dùng chuyển động mặc định" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("[data-theme]")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await expect(
    page.getByRole("button", { name: "Tắt âm thanh", exact: true }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Tắt âm thanh", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Bật âm thanh", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mô phỏng phiên hết hạn" }).click();
  await expect(
    page.getByRole("heading", { name: /phiên đăng nhập/ }),
  ).toBeVisible();
});

test("WebGL unavailable recovers to keyboard-operable 2D", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (
        kind === "webgl" ||
        kind === "webgl2" ||
        kind === "experimental-webgl"
      )
        return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/explorer");
  await expect(page.locator(".unit-tile")).toHaveCount(48);
  await page.getByRole("button", { name: /B0402/ }).click();
  await expect(
    page.getByRole("link", { name: "Khám phá căn B0402" }),
  ).toBeVisible();
});
test("all nine demo roles land in allowed areas", async ({ page }) => {
  for (const role of [
    "buyer",
    "sales",
    "leader",
    "support",
    "legal",
    "finance",
    "manager",
    "admin",
    "platform",
  ]) {
    await login(page, role);
    await expect(
      page.getByRole("heading", { level: 1, name: "Tổng quan" }),
    ).toBeVisible();
    if (role === "buyer")
      await expect(
        page
          .getByRole("navigation", { name: "Điều hướng workspace" })
          .getByRole("link", { name: "Bất động sản của tôi" }),
      ).toBeVisible();
    if (role === "legal")
      await expect(page.locator(".metric-grid")).toContainText("Đang rà soát");
    if (role === "finance")
      await expect(page.locator(".metric-grid")).toContainText("Chờ đối soát");
    if (role === "support")
      await expect(page.locator(".metric-grid")).toContainText("Tickets");
  }
});
test("Customer 360 presents the same deposit as Buyer Payments", async ({
  page,
}) => {
  await deposit(page);
  await login(page, "manager");
  await page.goto("/crm/customers");
  await page
    .getByRole("row")
    .filter({ hasText: "Minh Anh" })
    .getByRole("button", { name: /Mở hồ sơ/ })
    .click();
  const detail = page.getByRole("dialog");
  await expect(detail).toContainText("A0302");
  await expect(
    detail.locator(".badge").filter({ hasText: "Đã xác nhận cọc demo" }),
  ).toBeVisible();
  await expect(
    detail.locator(".badge").filter({ hasText: "Đã xác nhận demo" }),
  ).toBeVisible();
});

test("mobile buyer completes deposit and can use appointment dialog", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await deposit(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.goto("/buyer/appointments");
  await page
    .getByRole("button", { name: "Đặt lịch tham quan", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((e) => e.getBoundingClientRect().width <= innerWidth),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Đặt lịch tham quan", exact: true }),
  ).toBeFocused();
});
