import { beforeEach, describe, it, expect } from "vitest";
import { createSeed } from "@/services/mocks/seed";
import { executeCommand, expireHolds } from "@/services/mocks/engine";
import { Command, Actor } from "@/services/contracts/commands";
import { DemoState, Role, Scenario } from "@/domain/types";
import {
  canEnter,
  canModule,
  canApprove,
  canWrite,
} from "@/domain/permissions";
import { filterProperties } from "@/domain/discovery";
import { monthlyPayment, csvCell, money } from "@/domain/format";
import { remainingSeconds, transition } from "@/domain/reservation";
let state: DemoState;
const now = 1800000000000;
const actor = (role: Role = "buyer"): Actor => ({
  role,
  id: role === "buyer" ? "buyer-demo" : `staff-${role}`,
});
function run(c: Command, role: Role = "buyer", time = now) {
  const result = executeCommand(state, c, actor(role), time);
  state = result.state;
  return result.result.id;
}
function hold(
  scenario: Scenario = "normal",
  key = "hold-key",
  propertyId = "A0302",
) {
  return run({
    type: "hold",
    propertyId,
    buyerId: "buyer-demo",
    price: state.properties.find((p) => p.id === propertyId)!.price,
    accepted: true,
    key,
    scenario,
  });
}
function pay(id: string, result: "success" | "failed" | "pending" = "success") {
  return run({
    type: "pay",
    id,
    key: `pay-${state.audit.length}`,
    accepted: true,
    method: "Thẻ mô phỏng",
    result,
  });
}
beforeEach(() => {
  state = createSeed(now);
});
describe("Domain dữ liệu & discovery", () => {
  it("procedural model has exact inventory cardinality", () => {
    for (const p of state.projects)
      expect(state.properties.filter((u) => u.projectId === p.id)).toHaveLength(
        p.towers.length * p.floors * p.unitsPerFloor,
      );
    expect(new Set(state.properties.map((p) => p.id)).size).toBe(
      state.properties.length,
    );
  });
  it("filters price, area, direction and bedrooms together", () => {
    const rows = filterProperties(
      state.properties,
      new URLSearchParams(
        "projectId=stillwater&beds=2&direction=Đông Nam&maxPrice=10&minArea=100",
      ),
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(
      rows.every(
        (p) =>
          p.beds === 2 &&
          p.price <= 1e10 &&
          p.area >= 100 &&
          p.direction === "Đông Nam",
      ),
    ).toBe(true);
  });
  it("searches and sorts deterministically", () => {
    expect(
      filterProperties(state.properties, new URLSearchParams("q=A0302"))[0].id,
    ).toBe("A0302");
    const rows = filterProperties(
      state.properties,
      new URLSearchParams("sort=price-desc"),
    );
    expect(rows[0].price).toBeGreaterThanOrEqual(rows.at(-1)!.price);
  });
  it("returns empty for impossible filters", () =>
    expect(
      filterProperties(state.properties, new URLSearchParams("minArea=900")),
    ).toHaveLength(0));
  it("calculates zero-interest and amortized payments", () => {
    expect(monthlyPayment(120e6, 0, 10)).toBe(1e6);
    expect(monthlyPayment(1e9, 9, 20)).toBeCloseTo(8997259.56, 0);
  });
  it("formats currency and escapes CSV formulas", () => {
    expect(money(1e6)).toContain("1.000.000");
    expect(csvCell("=SUM(A1)")).toBe('"\'=SUM(A1)"');
    expect(csvCell('a"b')).toBe('"a""b"');
  });
});
describe("Role-aware UX decisions", () => {
  it.each([
    "sales",
    "leader",
    "support",
    "legal",
    "finance",
    "manager",
    "admin",
    "platform",
  ] as Role[])("buyer cannot enter %s CRM by URL", () => {
    expect(canEnter("buyer", "crm")).toBe(false);
    expect(canModule("buyer", "crm", "leads")).toBe(false);
  });
  it("separates finance, sales and approval authority", () => {
    expect(canModule("sales", "crm", "payments")).toBe(false);
    expect(canModule("finance", "crm", "payments")).toBe(true);
    expect(canApprove("sales", "refund")).toBe(false);
    expect(canApprove("finance", "refund")).toBe(true);
    expect(canApprove("leader", "extension")).toBe(true);
    expect(canWrite("legal", "leads")).toBe(false);
  });
  it("blocks buyer editing another profile", () =>
    expect(() =>
      run({
        type: "save",
        entity: "customers",
        values: {
          id: "customer-2",
          name: "Override",
          email: "test@example.test",
        },
      }),
    ).toThrow("Chỉ được sửa"));
  it("blocks sales editing out-of-scope lead", () =>
    expect(() =>
      run(
        {
          type: "save",
          entity: "leads",
          values: {
            id: "lead-2",
            name: "Override",
            email: "test@example.test",
          },
        },
        "sales",
      ),
    ).toThrow("người phụ trách khác"));
});
describe("Strict holds and payments", () => {
  it("holds one unit, reflects inventory and history", () => {
    hold();
    expect(state.reservations[0].status).toBe("TEMPORARILY_HELD");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "HELD",
    );
    expect(state.reservations[0].history).toHaveLength(2);
  });
  it("idempotent hold does not duplicate", () => {
    const first = hold();
    const second = hold();
    expect(first).toBe(second);
    expect(state.reservations).toHaveLength(1);
  });
  it("a second distinct request conflicts", () => {
    hold();
    hold("normal", "another-key");
    expect(state.reservations[0].status).toBe("HOLD_CONFLICT");
    expect(
      state.reservations.filter((r) => r.status === "TEMPORARILY_HELD"),
    ).toHaveLength(1);
  });
  it("simulated conflict does not claim inventory", () => {
    hold("conflict");
    expect(state.reservations[0].status).toBe("HOLD_CONFLICT");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "AVAILABLE",
    );
  });
  it.each(["offline", "price-change"] as Scenario[])(
    "%s fails without mutating input",
    (s) => {
      expect(() => hold(s)).toThrow();
      expect(state.reservations).toHaveLength(0);
    },
  );
  it("ineligible project denies hold", () =>
    expect(() => hold("normal", "horizon", "D0101")).toThrow("chưa mở"));
  it("expiry releases inventory and blocks payment", () => {
    const id = hold("expired");
    expireHolds(state, now + 5001);
    expect(state.reservations[0].status).toBe("HOLD_EXPIRED");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "AVAILABLE",
    );
    expect(() => pay(id)).toThrow("không còn đủ điều kiện");
  });
  it("countdown never negative", () => {
    expect(remainingSeconds(now, now + 100)).toBe(0);
    expect(remainingSeconds(now + 5000, now)).toBe(5);
  });
  it("invalid transitions are rejected", () =>
    expect(() => transition("HOLD_EXPIRED", "PAYMENT_PENDING")).toThrow());
  it("cancel releases unit", () => {
    const id = hold();
    run({ type: "reservation", id, action: "cancel" });
    expect(state.reservations[0].status).toBe("HOLD_CANCELLED");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "AVAILABLE",
    );
  });
  it("extension approval changes deadline", () => {
    const id = hold();
    const before = state.reservations[0].expiresAt;
    run({ type: "reservation", id, action: "extend" });
    expect(state.approvals[0].kind).toBe("extension");
    run(
      {
        type: "approve",
        id: state.approvals[0].id,
        approve: true,
        reason: "Đủ điều kiện",
      },
      "leader",
    );
    expect(state.reservations[0].expiresAt).toBe(before + 600000);
    expect(state.reservations[0].status).toBe("TEMPORARILY_HELD");
  });
  it("sales cannot approve an extension", () => {
    const id = hold();
    run({ type: "reservation", id, action: "extend" });
    expect(() =>
      run(
        {
          type: "approve",
          id: state.approvals[0].id,
          approve: true,
          reason: "Test",
        },
        "sales",
      ),
    ).toThrow("không có quyền");
  });
  it("rejecting extension retains deadline", () => {
    const id = hold();
    const before = state.reservations[0].expiresAt;
    run({ type: "reservation", id, action: "extend" });
    run(
      {
        type: "approve",
        id: state.approvals[0].id,
        approve: false,
        reason: "Không đủ điều kiện",
      },
      "manager",
    );
    expect(state.reservations[0].expiresAt).toBe(before);
  });
  it("stale extension approval cannot revive expired unit", () => {
    const id = hold("expired");
    run({ type: "reservation", id, action: "extend" });
    expect(() =>
      run(
        {
          type: "approve",
          id: state.approvals[0].id,
          approve: true,
          reason: "Test",
        },
        "manager",
        now + 6000,
      ),
    ).toThrow("hết hạn");
  });
  it("payment confirmation updates unit exactly once", () => {
    const id = hold();
    const c: Command = {
      type: "pay",
      id,
      accepted: true,
      key: "pay-same",
      method: "Thẻ mô phỏng",
      result: "success",
    };
    run(c);
    run(c);
    expect(state.payments).toHaveLength(1);
    expect(state.reservations[0].status).toBe("DEPOSIT_CONFIRMED");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "RESERVED",
    );
  });
  it("failed payment can retry while hold remains valid", () => {
    const id = hold();
    pay(id, "failed");
    expect(state.reservations[0].status).toBe("PAYMENT_FAILED");
    pay(id);
    expect(state.reservations[0].status).toBe("DEPOSIT_CONFIRMED");
  });
  it("unknown result stays reserved for reconciliation after expiry", () => {
    const id = hold("expired");
    const p = pay(id, "pending");
    expireHolds(state, now + 6000);
    expect(state.reservations[0].status).toBe("PAYMENT_VERIFICATION");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "HELD",
    );
    expect(() => pay(id)).toThrow();
    run({ type: "reconcile", id: p, confirmed: true }, "finance", now + 7000);
    expect(state.reservations[0].status).toBe("DEPOSIT_CONFIRMED");
  });
  it("sales cannot reconcile", () => {
    const id = hold();
    const p = pay(id, "pending");
    expect(() =>
      run({ type: "reconcile", id: p, confirmed: true }, "sales"),
    ).toThrow("Chỉ tài chính");
  });
  it("refund request requires approval and releases only when approved", () => {
    const id = hold();
    const p = pay(id);
    run({ type: "refund", id: p, reason: "Đổi lựa chọn" });
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "RESERVED",
    );
    run(
      {
        type: "approve",
        id: state.approvals[0].id,
        approve: true,
        reason: "Đã kiểm tra",
      },
      "finance",
    );
    expect(state.payments[0].status).toBe("REFUNDED");
    expect(state.reservations[0].status).toBe("HOLD_CANCELLED");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "AVAILABLE",
    );
  });
});
describe("Linked business workflows", () => {
  it("lead duplicate blocked, conversion creates linked opportunity", () => {
    expect(() =>
      run(
        {
          type: "save",
          entity: "leads",
          values: { name: "Trùng", email: "minhanh@example.test" },
        },
        "sales",
      ),
    ).toThrow("trùng");
    run({ type: "convert", id: "lead-1" }, "sales");
    expect(state.leads[0].status).toBe("Đã chuyển");
    expect(state.opportunities[0].customerId).toBe("buyer-demo");
    expect(() => run({ type: "convert", id: "lead-1" }, "sales")).toThrow(
      "đã được chuyển",
    );
  });
  it("public inquiry updates same-email record rather than duplicate", () => {
    run({
      type: "inquiry",
      name: "Minh Anh",
      email: "minhanh@example.test",
      message: "Quan tâm mới",
      propertyId: "A0302",
    });
    expect(state.leads).toHaveLength(2);
    expect(state.leads[0].notes).toContain("Quan tâm mới");
  });
  it("won stage needs confirmed deposit", () => {
    expect(() =>
      run(
        { type: "stage", id: "opp-1", stage: "Thành công", reason: "" },
        "sales",
      ),
    ).toThrow("Cần đặt cọc");
    const id = hold();
    pay(id);
    run(
      { type: "stage", id: "opp-1", stage: "Thành công", reason: "" },
      "sales",
    );
    expect(state.opportunities[0].stage).toBe("Thành công");
  });
  it("lost stage needs a reason", () =>
    expect(() =>
      run(
        { type: "stage", id: "opp-1", stage: "Không thành công", reason: "" },
        "sales",
      ),
    ).toThrow("lý do"));
  it("appointment collision has actionable error", () => {
    const a = state.appointments[0];
    expect(() =>
      run({
        type: "save",
        entity: "appointments",
        values: {
          customerId: "buyer-demo",
          propertyId: "A0302",
          date: a.date,
          staff: a.staff,
        },
      }),
    ).toThrow("Trùng lịch");
  });
  it("contract approval and signing update same reservation", () => {
    const id = hold();
    pay(id);
    const ct = run({ type: "contract", id, action: "draft" }, "legal");
    expect(() =>
      run({ type: "contract", id: ct, action: "review" }, "legal"),
    ).toThrow("2 mục");
    run(
      {
        type: "save",
        entity: "contracts",
        values: { id: ct, checklist: "Hồ sơ khách hàng,Điều khoản dự án" },
      },
      "legal",
    );
    run({ type: "contract", id: ct, action: "review" }, "legal");
    expect(() =>
      run({ type: "contract", id: ct, action: "sign" }, "legal"),
    ).toThrow("chưa được phê duyệt");
    run(
      {
        type: "approve",
        id: state.approvals[0].id,
        approve: true,
        reason: "Đã rà soát",
      },
      "manager",
    );
    run({ type: "contract", id: ct, action: "sign" }, "legal");
    expect(state.reservations[0].status).toBe("CONTRACT_COMPLETED");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "SOLD",
    );
  });
  it("price change applies only after approval", () => {
    const before = state.properties[0].price;
    const id = run(
      {
        type: "request",
        kind: "price",
        id: state.properties[0].id,
        value: "12300000000",
        reason: "Giá mới",
      },
      "sales",
    );
    expect(state.properties[0].price).toBe(before);
    run(
      { type: "approve", id, approve: true, reason: "Đã kiểm tra" },
      "manager",
    );
    expect(state.properties[0].price).toBe(123e8);
  });
  it("privacy opt-out clears viewed list", () => {
    run({ type: "preferences", values: { recent: true } });
    run({ type: "view", id: "A0302" });
    expect(state.recentlyViewed).toHaveLength(1);
    run({ type: "preferences", values: { recent: false } });
    expect(state.recentlyViewed).toHaveLength(0);
  });
  it("ticket messages persist and stay linked to buyer", () => {
    run({ type: "ticket-message", id: "ticket-1", text: "Cảm ơn" });
    expect(state.tickets[0].messages.at(-1)!.text).toBe("Cảm ơn");
  });
  it("reset returns deterministic fixture and sound off", () => {
    hold();
    run({ type: "preferences", values: { sound: true } });
    run({ type: "reset" });
    expect(state.reservations).toHaveLength(0);
    expect(state.preferences.sound).toBe(false);
  });
});

describe("Integrity of governance and linked records", () => {
  it("waitlist does not lock stock and rejects duplicate enrollment", () => {
    const command: Command = {
      type: "waitlist",
      propertyId: "A0302",
      customerId: "buyer-demo",
    };
    run(command);
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "AVAILABLE",
    );
    expect(() => run(command)).toThrow("đã có");
    expect(() => run({ ...command, contacted: true })).toThrow("Chỉ nhân viên");
    run({ ...command, contacted: true }, "sales");
    expect(state.waitlist[0].status).toBe("CONTACTED");
  });
  it("project floor extension preserves occupied inventory and exact 3D cardinality", () => {
    hold();
    const occupied = { ...state.properties.find((p) => p.id === "A0302")! };
    run(
      { type: "project", id: "stillwater", values: { floors: "7" } },
      "admin",
    );
    expect(
      state.properties.filter((p) => p.projectId === "stillwater"),
    ).toHaveLength(56);
    expect(state.properties.find((p) => p.id === "A0302")).toEqual(occupied);
    expect(() =>
      run(
        { type: "project", id: "stillwater", values: { floors: "6" } },
        "admin",
      ),
    ).toThrow("Chỉ bổ sung");
    expect(() =>
      run(
        { type: "project", id: "stillwater", values: { floors: "8" } },
        "sales",
      ),
    ).toThrow("Chỉ quản lý");
  });
  it("merging retains source record and combines history", () => {
    const count = state.leads.length;
    run({ type: "merge", sourceId: "lead-2", targetId: "lead-1" }, "admin");
    expect(state.leads).toHaveLength(count);
    expect(state.leads.find((l) => l.id === "lead-2")!.status).toBe(
      "Đã hợp nhất",
    );
    expect(state.leads[0].history.some((e) => e.text.includes("lead-2"))).toBe(
      true,
    );
  });
  it("refund approval cancels pending contract and dependent approval", () => {
    const reservationId = hold();
    const paymentId = pay(reservationId);
    const contractId = run(
      { type: "contract", id: reservationId, action: "draft" },
      "legal",
    );
    run(
      {
        type: "save",
        entity: "contracts",
        values: {
          id: contractId,
          checklist: "Hồ sơ,Điều khoản",
          comment: "Bản rà soát",
        },
      },
      "legal",
    );
    expect(state.contracts[0].versions![0].version).toBe(1);
    run({ type: "contract", id: contractId, action: "review" }, "legal");
    expect(() =>
      run(
        {
          type: "save",
          entity: "contracts",
          values: { id: contractId, checklist: "Khác" },
        },
        "legal",
      ),
    ).toThrow("phiên bản đang duyệt");
    const approvalId = state.approvals.find((a) => a.kind === "contract")!.id;
    run({ type: "refund", id: paymentId, reason: "Đổi nhu cầu" });
    run(
      {
        type: "approve",
        id: state.approvals.find((a) => a.kind === "refund")!.id,
        approve: true,
        reason: "Đã kiểm tra",
      },
      "finance",
    );
    expect(state.contracts[0].status).toBe("Đã hủy sau hoàn cọc");
    expect(state.approvals.find((a) => a.id === approvalId)!.status).toBe(
      "REJECTED",
    );
    expect(() =>
      run({ type: "contract", id: contractId, action: "sign" }, "legal"),
    ).toThrow("không còn");
  });
  it("rejected refund preserves confirmed payment and inventory", () => {
    const id = pay(hold());
    run({ type: "refund", id, reason: "Xem xét" });
    run(
      {
        type: "approve",
        id: state.approvals[0].id,
        approve: false,
        reason: "Cần thêm thông tin",
      },
      "finance",
    );
    expect(state.payments[0].status).toBe("CONFIRMED");
    expect(state.reservations[0].status).toBe("DEPOSIT_CONFIRMED");
    expect(state.properties.find((p) => p.id === "A0302")!.availability).toBe(
      "RESERVED",
    );
  });
});

describe("Financial adjustment approval", () => {
  it("changes payment and reservation amount only after finance approval", () => {
    const paymentId = pay(hold());
    const original = state.payments[0].amount;
    run(
      {
        type: "adjustment",
        id: paymentId,
        amount: 150000000,
        reason: "Sửa số liệu nhập demo",
      },
      "finance",
    );
    expect(state.payments[0].amount).toBe(original);
    expect(() =>
      run(
        {
          type: "approve",
          id: state.approvals[0].id,
          approve: true,
          reason: "Duyệt",
        },
        "sales",
      ),
    ).toThrow("không có quyền");
    run(
      {
        type: "approve",
        id: state.approvals[0].id,
        approve: true,
        reason: "Đã rà soát",
      },
      "finance",
    );
    expect(state.payments[0].amount).toBe(150000000);
    expect(state.reservations[0].amount).toBe(150000000);
    expect(state.payments[0].history.at(-1)!.text).toContain(String(original));
  });
  it("rejects stale adjustment after contract started", () => {
    const reservationId = hold();
    const paymentId = pay(reservationId);
    run(
      {
        type: "adjustment",
        id: paymentId,
        amount: 150000000,
        reason: "Kiểm tra",
      },
      "finance",
    );
    const id = state.approvals[0].id;
    run({ type: "contract", id: reservationId, action: "draft" }, "legal");
    expect(() =>
      run(
        { type: "approve", id, approve: true, reason: "Duyệt trễ" },
        "finance",
      ),
    ).toThrow("Đã bắt đầu hợp đồng");
  });
});
