"use client";
import { useState } from "react";
import { Entity, EntityRecord } from "@/domain/types";
import { useDemo } from "@/services/store";
import { Field, Button, Modal } from "./ui";
type FormField = {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  required?: boolean;
};
const shared: Record<string, FormField> = {
  name: { key: "name", label: "Họ tên", required: true },
  email: { key: "email", label: "Email demo", type: "email", required: true },
  phone: { key: "phone", label: "Điện thoại demo" },
  budget: { key: "budget", label: "Ngân sách (VND)", type: "number" },
  assignee: { key: "assignee", label: "Người phụ trách", type: "staff" },
  customerId: { key: "customerId", label: "Khách hàng", type: "customer" },
  propertyId: { key: "propertyId", label: "Căn quan tâm", type: "property" },
  priority: {
    key: "priority",
    label: "Ưu tiên",
    options: ["Thấp", "Vừa", "Cao"],
  },
  title: { key: "title", label: "Tiêu đề", required: true },
};
const fields: Record<Entity, FormField[]> = {
  leads: [
    shared.name,
    shared.email,
    shared.phone,
    {
      key: "source",
      label: "Nguồn",
      options: ["Website", "Sự kiện", "Giới thiệu", "Chiến dịch"],
    },
    {
      key: "status",
      label: "Trạng thái",
      options: ["Mới", "Đã liên hệ", "Đã tư vấn", "Đủ điều kiện"],
    },
    shared.priority,
    shared.assignee,
    shared.budget,
    shared.propertyId,
    { key: "notes", label: "Ghi chú / yêu cầu", type: "textarea" },
  ],
  customers: [
    shared.name,
    shared.email,
    shared.phone,
    shared.budget,
    { key: "preferences", label: "Nhu cầu", type: "textarea" },
    shared.assignee,
    { key: "notes", label: "Ghi chú", type: "textarea" },
    {
      key: "consent",
      label: "Cho phép chia sẻ sở thích demo",
      options: ["true", "false"],
    },
  ],
  appointments: [
    shared.customerId,
    shared.propertyId,
    {
      key: "date",
      label: "Ngày giờ tham quan",
      type: "datetime-local",
      required: true,
    },
    { key: "staff", label: "Nhân viên phụ trách", type: "staff" },
    {
      key: "status",
      label: "Trạng thái",
      options: [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đã check-in",
        "Đã hoàn thành",
        "Đã hủy",
      ],
    },
    { key: "feedback", label: "Kết quả / phản hồi", type: "textarea" },
  ],
  tasks: [
    shared.title,
    shared.assignee,
    shared.customerId,
    shared.propertyId,
    { key: "opportunityId", label: "Mã cơ hội liên quan" },
    shared.priority,
    { key: "dueDate", label: "Hạn hoàn thành", type: "date", required: true },
    {
      key: "status",
      label: "Trạng thái",
      options: ["Chưa làm", "Đang làm", "Hoàn thành"],
    },
  ],
  tickets: [
    shared.title,
    shared.customerId,
    shared.priority,
    shared.assignee,
    {
      key: "status",
      label: "Trạng thái",
      options: ["Mới", "Đang xử lý", "Chuyển cấp", "Đã giải quyết", "Mở lại"],
    },
    { key: "message", label: "Nội dung yêu cầu", type: "textarea" },
    { key: "attachment", label: "Tệp đính kèm demo", type: "file" },
    {
      key: "rating",
      label: "Đánh giá (1–5)",
      options: ["0", "1", "2", "3", "4", "5"],
    },
  ],
  campaigns: [
    shared.title,
    { key: "audience", label: "Nhóm khách hàng" },
    {
      key: "source",
      label: "Kênh",
      options: ["Website", "Sự kiện", "Giới thiệu", "Chiến dịch"],
    },
    shared.budget,
    { key: "startDate", label: "Ngày bắt đầu", type: "date" },
    { key: "content", label: "Mẫu nội dung", type: "textarea", required: true },
  ],
  employees: [
    shared.name,
    {
      key: "role",
      label: "Vai trò",
      options: [
        "sales",
        "leader",
        "support",
        "legal",
        "finance",
        "manager",
        "admin",
        "platform",
      ],
    },
    { key: "team", label: "Phòng ban" },
    { key: "active", label: "Đang hoạt động", options: ["true", "false"] },
  ],
  opportunities: [
    shared.name,
    shared.customerId,
    shared.propertyId,
    { key: "amount", label: "Giá trị (VND)", type: "number" },
    { key: "expectedDate", label: "Ngày dự kiến chốt", type: "date" },
    { key: "nextAction", label: "Bước tiếp theo" },
  ],
  contracts: [
    { key: "comment", label: "Nhận xét", type: "textarea" },
    { key: "attachment", label: "Tệp phiên bản demo", type: "file" },
    { key: "dueDate", label: "Hạn xử lý", type: "date" },
    {
      key: "checklist",
      label: "Mục đã kiểm tra, phân cách bằng dấu phẩy",
      required: true,
    },
  ],
};
export function EntityForm({
  entity,
  record,
  title,
  onClose,
  onSaved,
  defaults = {},
}: {
  entity: Entity;
  record?: EntityRecord;
  title: string;
  onClose: () => void;
  onSaved?: (id: string) => void;
  defaults?: Record<string, string>;
}) {
  const { data, session, run } = useDemo();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...defaults,
    ...Object.fromEntries(
      Object.entries(record || {}).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.join(",") : String(v),
      ]),
    ),
  }));
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await run({ type: "save", entity, values });
      onSaved?.(result.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa lưu được.");
    } finally {
      setBusy(false);
    }
  };
  const displayed = fields[entity].filter(
    (f) =>
      !(
        session?.role === "buyer" &&
        ["customerId", "assignee", "staff", "notes", "consent"].includes(f.key)
      ),
  );
  return (
    <Modal title={title} onClose={onClose}>
      <p className="fine-print">
        Chỉ nhập dữ liệu giả lập. Không gửi thông tin ra ngoài trình duyệt.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid">
          {displayed.map((f) => {
            const options =
              f.type === "staff"
                ? data.employees
                    .filter((e) => e.active)
                    .map((e) => ({ value: e.id, label: e.name }))
                : f.type === "customer"
                  ? data.customers.map((e) => ({ value: e.id, label: e.name }))
                  : f.type === "property"
                    ? data.properties.map((e) => ({
                        value: e.id,
                        label: `${e.id} · ${e.area} m²`,
                      }))
                    : f.options?.map((x) => ({ value: x, label: x }));
            return (
              <Field
                key={f.key}
                label={f.label}
                hint={
                  f.type === "file"
                    ? "Chỉ lưu tên tệp; không tải lên hoặc lưu nội dung."
                    : undefined
                }
              >
                {options ? (
                  <select
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                  >
                    <option value="">Chọn…</option>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    value={values[f.key] || ""}
                    required={f.required}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                  />
                ) : f.type === "file" ? (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (
                          file &&
                          !/\.(pdf|png|jpe?g|txt)$/i.test(file.name)
                        ) {
                          setError(
                            "Chỉ nhận tệp PDF, PNG, JPG hoặc TXT cho demo.",
                          );
                          return;
                        }
                        if (file && file.size > 5 * 1024 * 1024) {
                          setError("Tệp demo tối đa 5 MB.");
                          return;
                        }
                        setValues({ ...values, [f.key]: file?.name || "" });
                      }}
                    />
                    <small>{values[f.key]}</small>
                  </>
                ) : (
                  <input
                    type={f.type || "text"}
                    min={f.type === "number" ? 0 : undefined}
                    value={values[f.key] || ""}
                    required={f.required}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                  />
                )}
              </Field>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button type="button" className="secondary" onClick={onClose}>
            Quay lại
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu hồ sơ demo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
