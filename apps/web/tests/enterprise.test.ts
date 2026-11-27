import { beforeEach, describe, expect, it } from "vitest";
import { createSeed } from "@/services/mocks/seed";
import { executeCommand } from "@/services/mocks/engine";
import { Actor, Command } from "@/services/contracts/commands";
import { DemoState, roles } from "@/domain/types";
import {
  canEnter,
  canModule,
  crmModules,
  managementModules,
} from "@/domain/permissions";
import { workspaceActivity } from "@/domain/workspace-activity";

const now = new Date("2026-11-25T09:00:00").getTime();
const buyer: Actor = { id: "buyer-demo", role: "buyer" };
const sales: Actor = { id: "staff-sales", role: "sales" };
const leader: Actor = { id: "staff-leader", role: "leader" };
let state: DemoState;
beforeEach(() => {
  state = createSeed(now);
});
function run(command: Command, actor: Actor) {
  const result = executeCommand(state, command, actor, now);
  state = result.state;
  return result.result.id;
}
function visit(values: Record<string, string>, actor: Actor) {
  return run(
    {
      type: "save",
      entity: "appointments",
      values: { ...state.appointments[0], ...values },
    },
    actor,
  );
}

describe("Lịch tham quan và chuyển giao", () => {
  it("yêu cầu xác nhận lại khi khách dời lịch đã duyệt và giữ nhân viên đang phụ trách", () => {
    visit({ date: "2026-12-02T10:00", staff: "staff-legal" }, buyer);
    expect(state.appointments[0]).toMatchObject({
      status: "Chờ xác nhận",
      staff: sales.id,
    });
    expect(() => visit({ status: "Đã xác nhận" }, buyer)).toThrow("trạng thái");
    visit({ status: "Đã xác nhận" }, sales);
    visit({ status: "Đã check-in" }, sales);
    visit({ status: "Đã hoàn thành" }, sales);
    visit({ feedback: "Cần thêm thông tin bếp" }, buyer);
    expect(() => visit({ date: "2026-12-02T10:30" }, buyer)).toThrow(
      "Lịch đã đóng",
    );
  });
  it("chặn sửa lịch không thuộc nhân viên và giờ trùng dù khác cách biểu diễn", () => {
    expect(() => visit({}, { role: "sales", id: "staff-other" })).toThrow(
      "người phụ trách khác",
    );
    expect(() =>
      visit(
        {
          id: "visit-other",
          date: new Date(state.appointments[0].date).toISOString(),
          status: "Chờ xác nhận",
        },
        buyer,
      ),
    ).toThrow("Trùng lịch");
  });
  it("tất cả hồ sơ giữ nguyên nếu người nhận bận, giữ lịch sử khi chuyển giao thành công", () => {
    const past = {
      ...state.appointments[0],
      id: "past",
      status: "Đã hoàn thành",
    };
    state.appointments.push(past, {
      ...state.appointments[0],
      id: "conflict",
      staff: leader.id,
    });
    const snapshot = structuredClone(state);
    const transfer: Command = {
      type: "transfer",
      from: sales.id,
      to: leader.id,
    };
    expect(() => run(transfer, leader)).toThrow("đã có lịch");
    expect(state).toEqual(snapshot);
    state.appointments[2].status = "Đã hủy";
    run(transfer, leader);
    expect(state.appointments[0].staff).toBe(leader.id);
    expect(state.appointments[1].staff).toBe(sales.id);
    expect(state.tasks[0].assignee).toBe(leader.id);
  });
});

describe("Hồ sơ và phạm vi hoạt động", () => {
  it("chỉnh sửa hồ sơ buyer bảo toàn ghi chú CRM và người phụ trách", () => {
    const c = state.customers.find((c) => c.id === buyer.id)!;
    c.assignee = leader.id;
    c.notes = "Đã thảo luận về thời gian bàn giao";
    run(
      {
        type: "save",
        entity: "customers",
        values: {
          id: c.id,
          name: c.name,
          email: c.email,
          notes: "Ghi đè",
          assignee: sales.id,
          consent: "false",
        },
      },
      buyer,
    );
    expect(state.customers.find((r) => r.id === buyer.id)).toMatchObject({
      notes: c.notes,
      assignee: c.assignee,
      consent: false,
    });
  });
  it("sửa giá trị cơ hội không làm mất giai đoạn, lý do và chủ hồ sơ", () => {
    const o = state.opportunities[0];
    o.stage = "Không thành công";
    o.lostReason = "Đổi khu vực";
    run(
      {
        type: "save",
        entity: "opportunities",
        values: {
          id: o.id,
          name: o.name,
          customerId: o.customerId,
          amount: "12000000",
        },
      },
      leader,
    );
    expect(state.opportunities[0]).toMatchObject({
      stage: o.stage,
      lostReason: o.lostReason,
      assignee: o.assignee,
      amount: 12000000,
    });
  });
  it("thông báo theo hồ sơ kể cả khi CRM cập nhật, không lẫn hai khách cùng vai trò", () => {
    visit({ feedback: "Đã liên hệ" }, sales);
    run(
      { type: "favorite", id: "A0302" },
      { role: "buyer", id: "another-buyer" },
    );
    expect(workspaceActivity(state, buyer).map((a) => a.text)).toEqual([
      "Cập nhật · Lịch tham quan A0302",
    ]);
    expect(
      workspaceActivity(state, { role: "buyer", id: "another-buyer" }).map(
        (a) => a.text,
      ),
    ).toEqual(["Cập nhật yêu thích · A0302"]);
    delete state.audit[1].actorId;
    expect(workspaceActivity(state, buyer)).toHaveLength(1);
  });
  it("duy trì 84 căn và đủ 14/8 module với phạm vi chín vai trò", () => {
    expect(state.properties).toHaveLength(84);
    expect(new Set(state.properties.map((p) => p.id)).size).toBe(84);
    expect(roles).toHaveLength(9);
    expect(crmModules).toHaveLength(14);
    expect(managementModules).toHaveLength(8);
    for (const role of roles) {
      expect(canEnter(role, "buyer")).toBe(role === "buyer");
      expect(canModule(role, "crm", "personal")).toBe(role !== "buyer");
      expect(canModule(role, "management", "security")).toBe(
        ["admin", "platform", "manager"].includes(role),
      );
    }
  });
});
it("khóa nội dung chiến dịch đang duyệt và mở lại khi bị trả về", () => {
  const admin: Actor = { role: "admin", id: "staff-admin" };
  const id = state.campaigns[0].id;
  const request: Command = {
    type: "request",
    kind: "campaign",
    id,
    reason: "Kiểm tra nội dung",
    value: "",
  };
  expect(() => run(request, sales)).toThrow("Không có quyền");
  const approval = run(request, admin);
  const save: Command = {
    type: "save",
    entity: "campaigns",
    values: { id, title: "Thông báo sự kiện", content: "Ngày mở cửa" },
  };
  expect(state.campaigns[0].status).toBe("Chờ duyệt");
  expect(() => run(save, admin)).toThrow("chờ duyệt");
  expect(() => run({ type: "delete", entity: "campaigns", id }, admin)).toThrow(
    "bản nháp",
  );
  run(
    {
      type: "approve",
      id: approval,
      approve: false,
      reason: "Kiểm tra lại giờ đón khách",
    },
    admin,
  );
  run(save, admin);
  expect(state.campaigns[0].status).toBe("Bản nháp");
});
