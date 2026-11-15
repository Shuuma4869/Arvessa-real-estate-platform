"use client";
import { useState } from "react";
import { useDemo } from "@/services/store";
import { Field, Action } from "@/components/ui";
export function ProjectGovernance() {
  const { data, run } = useDemo();
  const [id, setId] = useState("stillwater"),
    [values, setValues] = useState<Record<string, string>>({});
  const p = data.projects.find((p) => p.id === id)!;
  const fields: [string, string, string, string][] = [
    ["name", "Tên dự án", p.name, "text"],
    ["location", "Địa điểm demo", p.location, "text"],
    ["floors", "Số tầng / tháp (chỉ thêm)", String(p.floors), "number"],
    ["amount", "Số tiền đặt cọc demo (VND)", String(p.policy.amount), "number"],
    [
      "holdMinutes",
      "Thời hạn giữ căn (phút)",
      String(p.policy.holdMinutes),
      "number",
    ],
  ];
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Cấu hình dự án & chính sách</h2>
      </div>
      <Field label="Dự án cấu hình">
        <select
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setValues({});
          }}
        >
          {data.projects.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </Field>
      <p className="fine-print">
        Tháp {p.towers.join(", ")} · {p.unitsPerFloor} căn/tầng. Bổ sung tầng sẽ
        tạo căn tương ứng trong giỏ hàng và 3D; giữ toàn bộ hồ sơ đang có.
      </p>
      <div className="form-grid">
        {fields.map(([key, label, value, type]) => (
          <Field key={key} label={label}>
            <input
              type={type}
              min={key === "floors" ? p.floors : 0}
              value={values[key] ?? value}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          </Field>
        ))}
        <Field label="Trạng thái công bố">
          <select
            value={values.published ?? String(p.published)}
            onChange={(e) =>
              setValues({ ...values, published: e.target.value })
            }
          >
            <option value="true">Công bố trong bộ sưu tập</option>
            <option value="false">Ẩn khỏi carousel</option>
          </select>
        </Field>
        <Field label="Mở đặt cọc demo">
          <select
            value={values.eligible ?? String(p.policy.eligible)}
            onChange={(e) => setValues({ ...values, eligible: e.target.value })}
          >
            <option value="true">Đủ điều kiện mô phỏng</option>
            <option value="false">Chưa mở demo</option>
          </select>
        </Field>
        <Field label="Ảnh đại diện đã đăng ký">
          <select
            value={values.image ?? p.image}
            onChange={(e) => setValues({ ...values, image: e.target.value })}
          >
            <option value="/images/residence-exterior.svg">
              Kiến trúc ngoại thất
            </option>
            <option value="/images/residence-courtyard.svg">Sân trong</option>
            <option value="/images/residence-interior.svg">
              Nghiên cứu nội thất
            </option>
          </select>
        </Field>
        <Field label="Điều khoản riêng dự án">
          <textarea
            value={values.terms ?? p.policy.terms}
            onChange={(e) => setValues({ ...values, terms: e.target.value })}
          />
        </Field>
      </div>
      <div className="form-actions">
        <Action
          label="Lưu cấu hình dự án demo"
          confirm
          className=""
          action={() => run({ type: "project", id, values })}
        />
      </div>
    </section>
  );
}
