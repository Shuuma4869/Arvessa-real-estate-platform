import {
  DemoState,
  Reservation,
  TimelineEvent,
  Entity,
  EntityRecord,
  Approval,
} from "@/domain/types";
import { Command, Actor, CommandResult } from "../contracts/commands";
import {
  activeStatuses,
  expirableStatuses,
  transition,
} from "@/domain/reservation";
import { canApprove, canWrite, isPrivileged } from "@/domain/permissions";
import { createSeed } from "./seed";
import { z } from "zod";

const email = z.email("Email không hợp lệ.");
const required = (s: string | undefined, label: string) => {
  if (!s?.trim()) throw new Error(`Vui lòng nhập ${label}.`);
  return s.trim();
};
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
export function expireHolds(state: DemoState, now: number) {
  for (const r of state.reservations)
    if (expirableStatuses.includes(r.status) && r.expiresAt <= now) {
      r.status = transition(r.status, "HOLD_EXPIRED");
      r.history.push({
        at: now,
        text: "Hết thời gian giữ căn demo",
        actor: "Hệ thống demo",
      });
      const p = state.properties.find((p) => p.id === r.propertyId);
      if (p) p.availability = "AVAILABLE";
    }
}
export function executeCommand(
  input: DemoState,
  c: Command,
  actor: Actor,
  now = Date.now(),
): { state: DemoState; result: CommandResult } {
  let state = structuredClone(input);
  expireHolds(state, now);
  const newId = (prefix: string) => `${prefix}-${now}-${state.audit.length}`;
  let id = "";
  let message = "Đã lưu thay đổi demo.";
  const event = (text: string): TimelineEvent => ({
    at: now,
    text,
    actor: actor.role,
  });
  const owned = (r: Reservation) =>
    assert(
      actor.role !== "buyer" || r.buyerId === actor.id,
      "Bạn không có quyền xem hồ sơ này.",
    );
  const reservation = (rid: string) => {
    const r = state.reservations.find((x) => x.id === rid);
    assert(r, "Không tìm thấy yêu cầu giữ căn.");
    owned(r!);
    return r!;
  };
  const approval = (
    kind: Approval["kind"],
    recordId: string,
    reason: string,
    value = "",
  ) => {
    assert(
      !state.approvals.some(
        (a) =>
          a.kind === kind && a.recordId === recordId && a.status === "PENDING",
      ),
      "Yêu cầu này đang chờ duyệt.",
    );
    const a: Approval = {
      id: newId("approval"),
      kind,
      recordId,
      reason: required(reason, "lý do"),
      value,
      status: "PENDING",
      requestedBy: actor.role,
      history: [event("Đã gửi yêu cầu")],
    };
    state.approvals.unshift(a);
    return a.id;
  };
  if ("key" in c && state.processed[`${actor.id}:${c.key}`])
    return {
      state,
      result: {
        id: state.processed[`${actor.id}:${c.key}`],
        message: "Yêu cầu đã được xử lý, không tạo bản trùng.",
      },
    };
  switch (c.type) {
    case "waitlist": {
      assert(
        ["buyer", "sales", "leader", "manager", "admin", "platform"].includes(
          actor.role,
        ),
        "Không có quyền cập nhật danh sách chờ.",
      );
      assert(
        actor.role !== "buyer" || c.customerId === actor.id,
        "Chỉ đăng ký cho chính bạn.",
      );
      assert(
        state.properties.some((p) => p.id === c.propertyId),
        "Không tìm thấy căn.",
      );
      const existing = state.waitlist.find(
        (w) => w.propertyId === c.propertyId && w.customerId === c.customerId,
      );
      if (c.contacted) {
        assert(actor.role !== "buyer", "Chỉ nhân viên được xác nhận liên hệ.");
        assert(existing, "Không tìm thấy đăng ký chờ.");
        existing!.status = "CONTACTED";
        id = existing!.id;
      } else {
        assert(!existing, "Bạn đã có trong danh sách chờ căn này.");
        id = newId("wait");
        state.waitlist.push({
          id,
          propertyId: c.propertyId,
          customerId: c.customerId,
          status: "WAITING",
          createdAt: now,
        });
      }
      message = "Đã cập nhật danh sách chờ demo. Không tự động giữ căn.";
      break;
    }
    case "merge": {
      assert(canWrite(actor.role, "leads"), "Không có quyền hợp nhất.");
      const source = state.leads.find((l) => l.id === c.sourceId),
        target = state.leads.find((l) => l.id === c.targetId);
      assert(
        source && target && source.id !== target.id,
        "Chọn hai hồ sơ khác nhau.",
      );
      if (actor.role === "sales")
        assert(
          source!.assignee === actor.id && target!.assignee === actor.id,
          "Hồ sơ ngoài phạm vi.",
        );
      assert(
        source!.status !== "Đã chuyển" && source!.status !== "Đã hợp nhất",
        "Không hợp nhất hồ sơ đã chuyển hoặc đã hợp nhất.",
      );
      target!.notes += "\n" + source!.notes;
      target!.history.push(
        ...source!.history,
        event(`Hợp nhất thông tin từ ${source!.id} (${source!.email})`),
      );
      source!.status = "Đã hợp nhất";
      source!.history.push(
        event(`Đã liên kết thông tin sang ${target!.id}; giữ lại hồ sơ nguồn`),
      );
      id = target!.id;
      break;
    }
    case "project": {
      assert(
        isPrivileged(actor.role),
        "Chỉ quản lý hoặc quản trị cấu hình dự án.",
      );
      const p = state.projects.find((p) => p.id === c.id);
      assert(p, "Không tìm thấy dự án.");
      const v = c.values,
        floors = Number(v.floors || p!.floors);
      assert(
        Number.isInteger(floors) && floors >= p!.floors && floors <= 12,
        "Chỉ bổ sung tầng, tối đa 12; không xóa tầng đang có dữ liệu.",
      );
      const amount = Number(v.amount ?? p!.policy.amount),
        minutes = Number(v.holdMinutes ?? p!.policy.holdMinutes);
      assert(
        amount >= 0 && minutes >= 1 && minutes <= 60,
        "Số tiền không âm, thời hạn 1–60 phút.",
      );
      if (v.name !== undefined) p!.name = required(v.name, "tên dự án");
      if (v.location !== undefined)
        p!.location = required(v.location, "địa điểm");
      p!.published =
        v.published !== undefined ? v.published === "true" : p!.published;
      if (!p!.published)
        assert(
          state.projects.some((x) => x.id !== p!.id && x.published),
          "Cần giữ ít nhất một dự án được công bố.",
        );
      if (v.image) {
        assert(
          [
            "/images/residence-exterior.svg",
            "/images/residence-courtyard.svg",
            "/images/residence-interior.svg",
          ].includes(v.image),
          "Chỉ dùng tài nguyên đã đăng ký.",
        );
        p!.image = v.image;
        state.properties
          .filter((u) => u.projectId === p!.id)
          .forEach((u) => {
            u.image = v.image;
          });
      }
      for (const tower of p!.towers)
        for (let f = p!.floors + 1; f <= floors; f++)
          for (let n = 1; n <= 4; n++) {
            const unitId = `${tower}${String(f).padStart(2, "0")}0${n}`;
            state.properties.push({
              id: unitId,
              projectId: p!.id,
              tower,
              floor: f,
              number: n,
              name: `Garden residence ${unitId}`,
              type: n === 4 ? "Penthouse" : "Căn hộ",
              beds: n === 1 ? 1 : n === 4 ? 3 : 2,
              baths: n === 1 ? 1 : 2,
              area: 65 + n * 18 + f * 2,
              price: (5.5 + n * 1.1 + f * 0.18) * 1e9,
              direction: n % 2 ? "Đông Nam" : "Tây Bắc",
              view: n % 2 ? "Sông" : "Vườn",
              availability: "AVAILABLE",
              image: p!.image,
            });
          }
      p!.floors = floors;
      p!.policy = {
        ...p!.policy,
        amount,
        holdMinutes: minutes,
        eligible:
          v.eligible !== undefined ? v.eligible === "true" : p!.policy.eligible,
        terms: v.terms || p!.policy.terms,
      };
      id = p!.id;
      break;
    }
    case "inquiry": {
      email.parse(c.email);
      required(c.name, "họ tên");
      required(c.message, "nội dung");
      const existing = state.leads.find((l) => l.email === c.email);
      if (existing) {
        existing.notes += "\n" + c.message;
        existing.history.push(event("Nhận thêm yêu cầu tư vấn từ website"));
        id = existing.id;
      } else {
        id = newId("lead");
        state.leads.unshift({
          id,
          name: c.name,
          email: c.email,
          phone: "",
          source: "Website",
          status: "Mới",
          priority: "Vừa",
          assignee: "staff-sales",
          budget: 0,
          notes: c.message,
          propertyId: c.propertyId || "A0302",
          history: [event("Yêu cầu tư vấn từ website demo")],
        });
      }
      message =
        "Đã lưu yêu cầu vào CRM demo. Không gửi thông tin ra bên ngoài.";
      break;
    }
    case "hold": {
      assert(
        ["buyer", "sales", "leader", "manager", "admin", "platform"].includes(
          actor.role,
        ),
        "Vai trò này không được giữ căn.",
      );
      assert(
        actor.role !== "buyer" || c.buyerId === actor.id,
        "Không thể giữ căn cho khách hàng khác.",
      );
      assert(
        state.customers.some((x) => x.id === c.buyerId),
        "Không tìm thấy khách hàng.",
      );
      assert(c.accepted, "Cần xác nhận điều khoản demo.");
      const p = state.properties.find((p) => p.id === c.propertyId);
      assert(p, "Không tìm thấy căn.");
      const project = state.projects.find((x) => x.id === p!.projectId)!;
      assert(
        project.policy.eligible,
        "Dự án chưa mở đặt cọc demo. Vui lòng đặt lịch tư vấn.",
      );
      assert(
        c.scenario !== "offline",
        "Mất kết nối mô phỏng. Chưa tạo yêu cầu; bạn có thể thử lại.",
      );
      assert(
        c.scenario !== "price-change" && c.price === p!.price,
        "Giá đã thay đổi trong kịch bản demo. Quay lại kiểm tra giá trước khi xác nhận.",
      );
      const conflict =
        p!.availability !== "AVAILABLE" ||
        state.reservations.some(
          (r) => r.propertyId === p!.id && activeStatuses.includes(r.status),
        ) ||
        c.scenario === "conflict";
      id = newId("hold");
      const r: Reservation = {
        id,
        propertyId: p!.id,
        buyerId: c.buyerId,
        price: p!.price,
        amount: project.policy.amount,
        status: "HOLD_REQUESTED",
        expiresAt:
          now +
          (c.scenario === "expired"
            ? 5000
            : project.policy.holdMinutes * 60000),
        history: [event("Đã nhận yêu cầu giữ căn demo")],
      };
      r.status = transition(
        r.status,
        conflict ? "HOLD_CONFLICT" : "TEMPORARILY_HELD",
      );
      r.history.push(
        event(
          conflict
            ? "Căn không còn sẵn sàng trong kịch bản này"
            : "Đã xác nhận giữ căn demo",
        ),
      );
      state.reservations.unshift(r);
      if (!conflict) p!.availability = "HELD";
      message = conflict
        ? "Xung đột giữ căn. Hãy chọn căn khác."
        : "Đã giữ căn trong môi trường demo.";
      break;
    }
    case "reservation": {
      const r = reservation(c.id);
      id = r.id;
      assert(
        ["buyer", "sales", "leader", "manager", "admin", "platform"].includes(
          actor.role,
        ),
        "Không có quyền điều chỉnh giữ căn.",
      );
      if (c.action === "extend") {
        assert(
          ["TEMPORARILY_HELD", "PAYMENT_FAILED"].includes(r.status),
          "Chưa thể yêu cầu gia hạn.",
        );
        r.status = transition(r.status, "EXTENSION_REQUESTED");
        approval(
          "extension",
          r.id,
          "Khách hàng cần thêm thời gian xác nhận hồ sơ.",
        );
        r.history.push(event("Yêu cầu gia hạn thêm 10 phút"));
      } else if (c.action === "expire") {
        assert(
          expirableStatuses.includes(r.status),
          "Trạng thái này không thể mô phỏng hết hạn.",
        );
        r.expiresAt = now;
        expireHolds(state, now);
      } else {
        assert(
          [
            "TEMPORARILY_HELD",
            "EXTENSION_REQUESTED",
            "PAYMENT_FAILED",
          ].includes(r.status),
          "Giao dịch đã gửi thanh toán cần quy trình hoàn/đối soát.",
        );
        r.status = transition(r.status, "HOLD_CANCELLED");
        r.history.push(event("Đã hủy giữ căn"));
        state.properties.find((p) => p.id === r.propertyId)!.availability =
          "AVAILABLE";
      }
      break;
    }
    case "pay": {
      const r = reservation(c.id);
      assert(actor.role === "buyer", "Chỉ khách hàng gửi thanh toán demo.");
      assert(c.accepted, "Cần xác nhận điều khoản thanh toán.");
      assert(
        ["TEMPORARILY_HELD", "PAYMENT_FAILED"].includes(r.status) &&
          r.expiresAt > now,
        "Giữ căn không còn đủ điều kiện thanh toán.",
      );
      assert(
        ["Chuyển khoản mô phỏng", "Thẻ mô phỏng"].includes(c.method),
        "Phương thức không hợp lệ.",
      );
      r.status = transition(r.status, "PAYMENT_PENDING");
      r.history.push(event("Payment Submitted — đã gửi yêu cầu demo"));
      id = newId("payment");
      const status =
        c.result === "success"
          ? "CONFIRMED"
          : c.result === "failed"
            ? "FAILED"
            : "VERIFICATION";
      state.payments.unshift({
        id,
        reservationId: r.id,
        amount: r.amount,
        status,
        method: c.method,
        createdAt: now,
        history: [
          event("Đã gửi yêu cầu, chưa xác nhận thanh toán"),
          event(
            status === "CONFIRMED"
              ? "Payment Confirmed — xác nhận trong demo"
              : status === "FAILED"
                ? "Xử lý mô phỏng thất bại"
                : "Chưa biết kết quả, chờ đối soát",
          ),
        ],
      });
      r.status = transition(
        r.status,
        c.result === "success"
          ? "DEPOSIT_CONFIRMED"
          : c.result === "failed"
            ? "PAYMENT_FAILED"
            : "PAYMENT_VERIFICATION",
      );
      r.history.push(event(r.status));
      if (c.result === "success")
        state.properties.find((p) => p.id === r.propertyId)!.availability =
          "RESERVED";
      message =
        c.result === "success"
          ? "Đã xác nhận thanh toán DEMO. Không có tiền thật được chuyển."
          : c.result === "failed"
            ? "Thanh toán demo thất bại. Bạn có thể thử lại khi giữ căn còn hạn."
            : "Đã gửi yêu cầu. Chờ nhân sự tài chính đối soát demo.";
      break;
    }
    case "reconcile": {
      assert(
        ["finance", "manager", "admin", "platform"].includes(actor.role),
        "Chỉ tài chính hoặc quản lý được đối soát.",
      );
      const p = state.payments.find((x) => x.id === c.id);
      assert(
        p?.status === "VERIFICATION",
        "Giao dịch không ở trạng thái chờ đối soát.",
      );
      const r = reservation(p!.reservationId);
      p!.status = c.confirmed ? "CONFIRMED" : "FAILED";
      p!.history.push(
        event(c.confirmed ? "Đã đối soát demo" : "Đối soát không thành công"),
      );
      r.status = transition(
        r.status,
        c.confirmed ? "DEPOSIT_CONFIRMED" : "PAYMENT_FAILED",
      );
      r.history.push(event(r.status));
      if (c.confirmed)
        state.properties.find((x) => x.id === r.propertyId)!.availability =
          "RESERVED";
      else expireHolds(state, now);
      id = p!.id;
      break;
    }
    case "adjustment": {
      assert(
        ["finance", "manager", "admin", "platform"].includes(actor.role),
        "Chỉ tài chính hoặc quản lý được đề nghị điều chỉnh.",
      );
      const p = state.payments.find((p) => p.id === c.id);
      assert(
        p?.status === "CONFIRMED",
        "Chỉ điều chỉnh khoản cọc đã xác nhận.",
      );
      const r = reservation(p!.reservationId);
      assert(
        r.status === "DEPOSIT_CONFIRMED",
        "Chỉ điều chỉnh trước khi bắt đầu hợp đồng.",
      );
      assert(
        Number.isFinite(c.amount) && c.amount > 0 && c.amount <= r.price,
        "Số tiền điều chỉnh phải lớn hơn 0 và không vượt giá căn.",
      );
      id = approval("adjustment", p!.id, c.reason, String(c.amount));
      break;
    }
    case "refund": {
      const p = state.payments.find((x) => x.id === c.id);
      assert(
        p?.status === "CONFIRMED",
        "Chỉ yêu cầu hoàn giao dịch demo đã xác nhận.",
      );
      const r = reservation(p!.reservationId);
      assert(
        r.status !== "CONTRACT_COMPLETED",
        "Hợp đồng đã hoàn tất cần quy trình xử lý riêng.",
      );
      assert(
        ["buyer", "finance", "manager", "admin", "platform"].includes(
          actor.role,
        ),
        "Không có quyền yêu cầu hoàn.",
      );
      p!.status = "REFUND_REQUESTED";
      p!.history.push(event("Gửi yêu cầu hoàn mô phỏng"));
      id = approval("refund", p!.id, c.reason);
      break;
    }
    case "request": {
      const allowed =
        c.kind === "contract"
          ? ["legal", "manager", "admin", "platform"]
          : ["sales", "leader", "manager", "admin", "platform"];
      assert(allowed.includes(actor.role), "Không có quyền gửi yêu cầu này.");
      if (c.kind === "price")
        assert(Number(c.value) > 0, "Giá đề nghị phải lớn hơn 0.");
      id = approval(c.kind, c.id, c.reason, c.value);
      break;
    }
    case "approve": {
      const a = state.approvals.find((x) => x.id === c.id);
      assert(a?.status === "PENDING", "Yêu cầu đã được xử lý.");
      assert(
        canApprove(actor.role, a!.kind),
        "Vai trò này không có quyền phê duyệt.",
      );
      required(c.reason, "ý kiến duyệt");
      if (a!.kind === "extension") {
        const r = reservation(a!.recordId);
        assert(
          r.status === "EXTENSION_REQUESTED" && r.expiresAt > now,
          "Giữ căn đã hết hạn hoặc bị hủy.",
        );
        r.status = transition(r.status, "TEMPORARILY_HELD");
        if (c.approve) r.expiresAt += 600000;
        r.history.push(
          event(c.approve ? "Đã gia hạn 10 phút" : "Từ chối gia hạn"),
        );
      }
      if (a!.kind === "refund") {
        const p = state.payments.find((x) => x.id === a!.recordId)!;
        const r = reservation(p.reservationId);
        p.status = c.approve ? "REFUNDED" : "CONFIRMED";
        p.history.push(
          event(c.approve ? "Đã hoàn tiền mô phỏng" : "Từ chối yêu cầu hoàn"),
        );
        if (c.approve) {
          r.status = transition(r.status, "HOLD_CANCELLED");
          r.history.push(event("Hủy sau hoàn cọc demo"));
          for (const contract of state.contracts.filter(
            (ct) => ct.reservationId === r.id,
          )) {
            contract.status = "Đã hủy sau hoàn cọc";
            for (const pending of state.approvals.filter(
              (a) =>
                a.kind === "contract" &&
                a.recordId === contract.id &&
                a.status === "PENDING",
            )) {
              pending.status = "REJECTED";
              pending.history.push(
                event("Dừng phê duyệt: giao dịch đã hoàn cọc demo."),
              );
            }
          }
          state.properties.find((p) => p.id === r.propertyId)!.availability =
            "AVAILABLE";
        }
      }
      if (a!.kind === "adjustment" && c.approve) {
        const p = state.payments.find((p) => p.id === a!.recordId);
        assert(
          p?.status === "CONFIRMED",
          "Giao dịch không còn đủ điều kiện điều chỉnh.",
        );
        const r = reservation(p!.reservationId);
        assert(
          r.status === "DEPOSIT_CONFIRMED",
          "Đã bắt đầu hợp đồng, không thể điều chỉnh cọc.",
        );
        const amount = Number(a!.value);
        assert(
          Number.isFinite(amount) && amount > 0 && amount <= r.price,
          "Số tiền điều chỉnh không hợp lệ.",
        );
        const text = `Điều chỉnh cọc demo: ${p!.amount} → ${amount} VND. ${c.reason}`;
        p!.history.push(event(text));
        r.history.push(event(text));
        p!.amount = amount;
        r.amount = amount;
      }
      if (a!.kind === "price" && c.approve) {
        const p = state.properties.find((x) => x.id === a!.recordId);
        assert(p?.availability === "AVAILABLE", "Chỉ đổi giá căn còn trống.");
        p!.price = Number(a!.value);
      }
      if (a!.kind === "status" && c.approve) {
        const p = state.properties.find((x) => x.id === a!.recordId);
        assert(
          p?.availability === "AVAILABLE" || p?.availability === "SOLD",
          "Không đổi tình trạng căn đang có giao dịch.",
        );
        assert(
          ["AVAILABLE", "SOLD"].includes(a!.value),
          "Tình trạng không hợp lệ.",
        );
        p!.availability = a!.value as "AVAILABLE" | "SOLD";
      }
      if (a!.kind === "contract") {
        const ct = state.contracts.find((x) => x.id === a!.recordId);
        assert(ct?.status === "Chờ duyệt", "Hợp đồng không còn chờ duyệt.");
        ct!.status = c.approve ? "Chờ ký" : "Cần chỉnh sửa";
      }
      if (a!.kind === "campaign") {
        const cp = state.campaigns.find((x) => x.id === a!.recordId);
        assert(cp, "Chiến dịch không tồn tại.");
        cp!.status = c.approve ? "Đã duyệt" : "Cần chỉnh sửa";
      }
      a!.status = c.approve ? "APPROVED" : "REJECTED";
      a!.history.push(event(c.reason));
      id = a!.id;
      break;
    }
    case "save": {
      assert(canWrite(actor.role, c.entity), "Vai trò này chỉ có quyền đọc.");
      const v = c.values;
      id = v.id || newId(c.entity);
      const old = (state[c.entity] as EntityRecord[]).find((x) => x.id === id);
      if (actor.role === "buyer") {
        assert(
          c.entity !== "customers" || id === actor.id,
          "Chỉ được sửa hồ sơ của bạn.",
        );
        if (old && "customerId" in old)
          assert(old.customerId === actor.id, "Hồ sơ ngoài phạm vi.");
      }
      if (actor.role === "sales" && old && "assignee" in old)
        assert(old.assignee === actor.id, "Hồ sơ thuộc người phụ trách khác.");
      const customerId =
        actor.role === "buyer" ? actor.id : v.customerId || "buyer-demo";
      let record: EntityRecord;
      switch (c.entity) {
        case "leads": {
          email.parse(v.email);
          assert(
            !state.leads.some(
              (l) =>
                l.email.toLowerCase() === v.email.toLowerCase() && l.id !== id,
            ),
            "Email bị trùng. Mở hồ sơ hiện có để xem và hợp nhất thông tin.",
          );
          record = {
            id,
            name: required(v.name, "họ tên"),
            email: v.email,
            phone: v.phone || "",
            source: v.source || "Website",
            status: v.status || "Mới",
            priority: v.priority || "Vừa",
            assignee:
              actor.role === "sales" ? actor.id : v.assignee || "staff-sales",
            budget: Number(v.budget) || 0,
            notes: v.notes || "",
            propertyId: v.propertyId || "A0302",
            history: [
              ...(old && "history" in old ? old.history : []),
              event("Cập nhật hồ sơ"),
            ],
          };
          break;
        }
        case "customers": {
          email.parse(v.email);
          record = {
            id,
            name: required(v.name, "họ tên"),
            email: v.email,
            phone: v.phone || "",
            budget: Number(v.budget) || 0,
            preferences: v.preferences || "",
            assignee: v.assignee || "staff-sales",
            notes: v.notes || "",
            consent: v.consent !== "false",
          };
          break;
        }
        case "appointments": {
          required(v.date, "lịch hẹn");
          assert(
            Number.isFinite(new Date(v.date).getTime()) &&
              (new Date(v.date).getTime() > now ||
                (old && "date" in old && old.date === v.date)),
            "Lịch hẹn phải ở tương lai.",
          );
          assert(
            state.properties.some((p) => p.id === v.propertyId),
            "Căn không hợp lệ.",
          );
          const staff = v.staff || "staff-sales";
          assert(
            !state.appointments.some(
              (a) =>
                a.id !== id &&
                a.status !== "Đã hủy" &&
                a.date === v.date &&
                (a.staff === staff || a.customerId === customerId),
            ),
            "Trùng lịch hẹn của khách hàng hoặc nhân viên. Chọn giờ khác.",
          );
          record = {
            id,
            customerId,
            propertyId: v.propertyId,
            date: v.date,
            staff,
            status: v.status || "Chờ xác nhận",
            feedback: v.feedback || "",
          };
          break;
        }
        case "opportunities":
          record = {
            id,
            name: required(v.name, "tên cơ hội"),
            customerId,
            propertyId: v.propertyId || "A0302",
            stage: "Mới",
            amount: Number(v.amount) || 0,
            assignee: actor.id,
            expectedDate: v.expectedDate || "",
            nextAction: v.nextAction || "",
            lostReason: "",
          };
          break;
        case "tasks":
          record = {
            id,
            title: required(v.title, "công việc"),
            assignee: v.assignee || actor.id,
            customerId,
            propertyId: v.propertyId || "",
            opportunityId: v.opportunityId || "",
            priority: v.priority || "Vừa",
            dueDate: required(v.dueDate, "hạn hoàn thành"),
            status: v.status || "Chưa làm",
          };
          break;
        case "tickets":
          record = {
            id,
            customerId,
            title: required(v.title, "tiêu đề"),
            priority: v.priority || "Vừa",
            assignee: v.assignee || "staff-support",
            status: v.status || "Mới",
            messages:
              old && "messages" in old
                ? old.messages
                : [event(v.message || "Đã tạo yêu cầu hỗ trợ")],
            attachment: v.attachment || "",
            rating: Number(v.rating) || 0,
            createdAt: old && "createdAt" in old ? old.createdAt : now,
          };
          break;
        case "campaigns":
          record = {
            id,
            title: required(v.title, "tên chiến dịch"),
            audience: v.audience || "",
            source: v.source || "Website",
            status: "Bản nháp",
            budget: Number(v.budget) || 0,
            content: required(v.content, "nội dung"),
            startDate: v.startDate || "",
          };
          break;
        case "employees": {
          assert(
            [
              "sales",
              "leader",
              "support",
              "legal",
              "finance",
              "manager",
              "admin",
              "platform",
            ].includes(v.role),
            "Vai trò không hợp lệ.",
          );
          record = {
            id,
            name: required(v.name, "tên nhân viên"),
            role: v.role as DemoState["employees"][number]["role"],
            team: v.team || "Kinh doanh",
            active: v.active !== "false",
          };
          break;
        }
        case "contracts": {
          assert(
            old && "version" in old,
            "Hợp đồng phải được tạo từ đặt cọc đã xác nhận.",
          );
          assert(
            (old as DemoState["contracts"][number]).status !== "Đã ký demo",
            "Không sửa phiên bản hợp đồng đã ký.",
          );
          const previous = old as DemoState["contracts"][number];
          assert(
            ["Bản nháp", "Cần chỉnh sửa"].includes(previous.status),
            "Chỉ sửa bản nháp hoặc hồ sơ cần chỉnh sửa; phiên bản đang duyệt đã được khóa.",
          );
          record = {
            ...(old as DemoState["contracts"][number]),
            comment: v.comment || "",
            attachment: v.attachment || "",
            dueDate: v.dueDate || "",
            checklist: (v.checklist || "").split(",").filter(Boolean),
            version: previous.version + 1,
            versions: [
              ...(previous.versions || []),
              {
                version: previous.version,
                at: now,
                comment: previous.comment,
                attachment: previous.attachment,
                checklist: previous.checklist,
              },
            ],
          };
          break;
        }
      }
      const list = state[c.entity] as EntityRecord[];
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list[i] = record;
      else list.unshift(record);
      break;
    }
    case "delete": {
      assert(
        canWrite(actor.role, c.entity) && actor.role !== "buyer",
        "Không có quyền xóa hồ sơ này.",
      );
      assert(
        ["tasks", "leads", "campaigns"].includes(c.entity),
        "Hồ sơ có liên kết cần được lưu lịch sử, không được xóa.",
      );
      const list = state[c.entity] as EntityRecord[];
      const i = list.findIndex((x) => x.id === c.id);
      assert(i >= 0, "Hồ sơ không tồn tại.");
      if (actor.role === "sales" && "assignee" in list[i])
        assert(list[i].assignee === actor.id, "Hồ sơ ngoài phạm vi.");
      list.splice(i, 1);
      id = c.id;
      break;
    }
    case "convert": {
      assert(
        canWrite(actor.role, "opportunities"),
        "Không có quyền chuyển cơ hội.",
      );
      const l = state.leads.find((x) => x.id === c.id);
      assert(l, "Lead không tồn tại.");
      if (actor.role === "sales")
        assert(l!.assignee === actor.id, "Hồ sơ ngoài phạm vi.");
      assert(l!.status !== "Đã chuyển", "Lead đã được chuyển.");
      let customer = state.customers.find((x) => x.email === l!.email);
      if (!customer) {
        customer = {
          id: newId("customer"),
          name: l!.name,
          email: l!.email,
          phone: l!.phone,
          budget: l!.budget,
          preferences: l!.notes,
          assignee: l!.assignee,
          notes: "Từ hồ sơ tiềm năng",
          consent: false,
        };
        state.customers.unshift(customer);
      }
      l!.customerId = customer.id;
      l!.status = "Đã chuyển";
      l!.history.push(event("Đã chuyển thành cơ hội"));
      id = newId("opp");
      state.opportunities.unshift({
        id,
        name: `${l!.name} · ${l!.propertyId}`,
        customerId: customer.id,
        propertyId: l!.propertyId,
        stage: "Mới",
        amount:
          state.properties.find((p) => p.id === l!.propertyId)?.price ||
          l!.budget,
        assignee: l!.assignee,
        expectedDate: "",
        nextAction: "Xác nhận nhu cầu",
        lostReason: "",
      });
      break;
    }
    case "stage": {
      assert(
        canWrite(actor.role, "opportunities"),
        "Không có quyền thay đổi cơ hội.",
      );
      const o = state.opportunities.find((x) => x.id === c.id);
      assert(o, "Không tìm thấy cơ hội.");
      if (actor.role === "sales")
        assert(o!.assignee === actor.id, "Cơ hội ngoài phạm vi.");
      assert(
        [
          "Mới",
          "Tư vấn",
          "Tham quan",
          "Đàm phán",
          "Thành công",
          "Không thành công",
        ].includes(c.stage),
        "Giai đoạn không hợp lệ.",
      );
      if (c.stage === "Thành công")
        assert(
          state.reservations.some(
            (r) =>
              r.buyerId === o!.customerId &&
              r.propertyId === o!.propertyId &&
              [
                "DEPOSIT_CONFIRMED",
                "CONTRACT_PENDING",
                "CONTRACT_COMPLETED",
              ].includes(r.status),
          ),
          "Cần đặt cọc đã xác nhận trước khi chốt thành công.",
        );
      if (c.stage === "Không thành công")
        required(c.reason, "lý do mất cơ hội");
      o!.stage = c.stage;
      o!.lostReason = c.reason;
      id = o!.id;
      break;
    }
    case "contract": {
      assert(
        ["legal", "manager", "admin", "platform"].includes(actor.role),
        "Chỉ pháp chế hoặc quản lý được xử lý hợp đồng.",
      );
      if (c.action === "draft") {
        const r = reservation(c.id);
        assert(r.status === "DEPOSIT_CONFIRMED", "Cần đặt cọc đã xác nhận.");
        r.status = transition(r.status, "CONTRACT_PENDING");
        r.history.push(event("Bắt đầu hợp đồng demo"));
        id = newId("contract");
        state.contracts.unshift({
          id,
          reservationId: r.id,
          customerId: r.buyerId,
          status: "Bản nháp",
          version: 1,
          checklist: [],
          comment: "",
          attachment: "",
          dueDate: new Date(now + 7 * 86400000).toISOString().slice(0, 10),
        });
      } else {
        const ct = state.contracts.find((x) => x.id === c.id);
        assert(ct, "Hợp đồng không tồn tại.");
        assert(
          reservation(ct!.reservationId).status === "CONTRACT_PENDING",
          "Giao dịch không còn trong quy trình hợp đồng.",
        );
        id = ct!.id;
        if (c.action === "review") {
          assert(
            ["Bản nháp", "Cần chỉnh sửa"].includes(ct!.status),
            "Hợp đồng đã được gửi duyệt.",
          );
          assert(
            ct!.checklist.length >= 2,
            "Hoàn thành ít nhất 2 mục kiểm tra hồ sơ.",
          );
          ct!.status = "Chờ duyệt";
          approval(
            "contract",
            id,
            "Đề nghị kiểm tra hồ sơ và duyệt hợp đồng demo.",
          );
        }
        if (c.action === "sign") {
          assert(ct!.status === "Chờ ký", "Hợp đồng chưa được phê duyệt.");
          ct!.status = "Đã ký demo";
          const r = reservation(ct!.reservationId);
          r.status = transition(r.status, "CONTRACT_COMPLETED");
          r.history.push(event("Đã ký hợp đồng mô phỏng"));
          state.properties.find((p) => p.id === r.propertyId)!.availability =
            "SOLD";
        }
        if (c.action === "comment") {
          ct!.comment = required(c.text, "nhận xét");
          ct!.version++;
        }
      }
      break;
    }
    case "ticket-message": {
      const t = state.tickets.find((x) => x.id === c.id);
      assert(t, "Yêu cầu không tồn tại.");
      assert(
        actor.role === "buyer"
          ? t!.customerId === actor.id
          : ["support", "manager", "admin", "platform"].includes(actor.role),
        "Không có quyền trả lời.",
      );
      t!.messages.push(event(required(c.text, "nội dung")));
      id = t!.id;
      break;
    }
    case "favorite":
    case "compare":
    case "view": {
      assert(
        state.properties.some((p) => p.id === c.id),
        "Không tìm thấy căn.",
      );
      const list =
        c.type === "favorite"
          ? state.favorites
          : c.type === "compare"
            ? state.comparisons
            : state.recentlyViewed;
      const index = list.indexOf(c.id);
      if (c.type === "view") {
        if (state.preferences.recent) {
          if (index >= 0) list.splice(index, 1);
          list.unshift(c.id);
          list.splice(10);
        }
      } else if (index >= 0) list.splice(index, 1);
      else {
        assert(
          c.type !== "compare" || list.length < 4,
          "So sánh tối đa 4 căn.",
        );
        list.push(c.id);
      }
      id = c.id;
      break;
    }
    case "search":
      assert(c.name.trim(), "Nhập tên bộ lọc.");
      state.savedSearches.push({ name: c.name, query: c.query });
      break;
    case "preferences":
      state.preferences = { ...state.preferences, ...c.values };
      if (c.values.recent === false) state.recentlyViewed = [];
      break;
    case "cms":
      assert(
        isPrivileged(actor.role),
        "Chỉ quản trị hoặc quản lý được thay đổi nội dung.",
      );
      state.cms = {
        ...state.cms,
        ...c.values,
        features: c.values.features
          ? c.values.features.split(",")
          : state.cms.features,
      };
      break;
    case "transfer":
      assert(
        isPrivileged(actor.role) || actor.role === "leader",
        "Không có quyền chuyển giao.",
      );
      assert(
        c.from !== c.to &&
          state.employees.some((e) => e.id === c.to && e.active),
        "Người nhận không hợp lệ.",
      );
      for (const entity of [
        "leads",
        "customers",
        "opportunities",
        "tasks",
      ] as Entity[])
        for (const r of state[entity])
          if ("assignee" in r && r.assignee === c.from) r.assignee = c.to;
      for (const a of state.appointments)
        if (a.staff === c.from) a.staff = c.to;
      break;
    case "reset":
      state = createSeed(now);
      message = "Đã khôi phục dữ liệu demo ban đầu.";
      break;
  }
  if ("key" in c) state.processed[`${actor.id}:${c.key}`] = id;
  state.audit.unshift({
    id: newId("audit"),
    at: now,
    actor: actor.role,
    action: c.type,
    recordId: id,
  });
  state.audit = state.audit.slice(0, 500);
  return { state, result: { id, message } };
}
