import { canModule } from "./permissions";
import { DemoState, roleNames, Session, TimelineEvent } from "./types";

const activityVerbs: Record<string, string> = {
  save: "Cập nhật",
  delete: "Xóa",
  hold: "Gửi yêu cầu giữ căn",
  reservation: "Cập nhật giữ căn",
  pay: "Ghi nhận thanh toán",
  reconcile: "Đối soát",
  refund: "Đề nghị hoàn tiền",
  approve: "Xử lý phê duyệt",
  adjustment: "Đề nghị điều chỉnh",
  request: "Gửi đề nghị",
  contract: "Cập nhật hợp đồng",
  "ticket-message": "Tin nhắn hỗ trợ",
  transfer: "Chuyển giao",
  stage: "Chuyển giai đoạn",
  convert: "Chuyển đổi cơ hội",
  waitlist: "Cập nhật danh sách chờ",
  favorite: "Cập nhật yêu thích",
  compare: "Cập nhật so sánh",
  merge: "Hợp nhất",
  project: "Cập nhật dự án",
  inquiry: "Gửi yêu cầu tư vấn",
};

export function workspaceActivity(
  data: DemoState,
  viewer: Pick<Session, "id" | "role">,
): TimelineEvent[] {
  const records = new Map<string, string>();
  const buyer = viewer.role === "buyer";
  const reservations = data.reservations.filter((r) => r.buyerId === viewer.id);
  if (buyer) {
    const holds = new Map(reservations.map((r) => [r.id, r.propertyId]));
    for (const r of reservations) records.set(r.id, r.propertyId);
    for (const payment of data.payments) {
      const unit = holds.get(payment.reservationId);
      if (unit) records.set(payment.id, unit);
    }
    for (const c of data.contracts)
      if (c.customerId === viewer.id)
        records.set(c.id, holds.get(c.reservationId) || c.id);
    for (const w of data.waitlist)
      if (w.customerId === viewer.id) records.set(w.id, w.propertyId);
    for (const approval of data.approvals) {
      const target = records.get(approval.recordId);
      if (target) records.set(approval.id, target);
    }
  } else {
    for (const t of data.tasks)
      if (t.assignee === viewer.id && canModule(viewer.role, "crm", "tasks"))
        records.set(t.id, t.title);
    for (const o of data.opportunities)
      if (o.assignee === viewer.id && canModule(viewer.role, "crm", "pipeline"))
        records.set(o.id, o.name);
    for (const l of data.leads)
      if (l.assignee === viewer.id && canModule(viewer.role, "crm", "leads"))
        records.set(l.id, l.name);
  }
  for (const a of data.appointments)
    if (
      buyer
        ? a.customerId === viewer.id
        : a.staff === viewer.id && canModule(viewer.role, "crm", "appointments")
    )
      records.set(a.id, "Lịch tham quan " + a.propertyId);
  for (const t of data.tickets)
    if (
      buyer
        ? t.customerId === viewer.id
        : t.assignee === viewer.id && canModule(viewer.role, "crm", "support")
    )
      records.set(t.id, t.title);
  return data.audit.flatMap((a) => {
    const label = activityVerbs[a.action];
    if (!label) return [];
    const target =
      records.get(a.recordId) ||
      (a.actorId === viewer.id ? a.recordId : undefined);
    return target
      ? [{ at: a.at, actor: roleNames[a.actor], text: label + " · " + target }]
      : [];
  });
}
