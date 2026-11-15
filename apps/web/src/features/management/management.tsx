"use client";
import { useState } from "react";
import { useDemo } from "@/services/store";
import { Employee, roles, roleNames } from "@/domain/types";
import {
  canApprove,
  canWrite,
  canModule,
  crmModules,
  moduleNames,
} from "@/domain/permissions";
import { dateTime } from "@/domain/format";
import {
  DataTable,
  Button,
  Badge,
  Modal,
  Field,
  Action,
  Timeline,
} from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
export function Approvals() {
  const { data, session, run } = useDemo();
  const [filter, setFilter] = useState("PENDING"),
    [selected, setSelected] = useState(""),
    [reason, setReason] = useState("");
  const rows = data.approvals.filter((a) => !filter || a.status === filter);
  const a = data.approvals.find((a) => a.id === selected);
  return (
    <>
      <div className="results-toolbar">
        <select
          aria-label="Lọc trạng thái phê duyệt"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="">Toàn bộ lịch sử</option>
        </select>
        <span className="fine-print">
          Phê duyệt tác động ngay đến hồ sơ liên quan trong demo.
        </span>
      </div>
      <DataTable
        rows={rows}
        searchText={(a) => `${a.kind} ${a.reason} ${a.recordId}`}
        onSelect={(a) => {
          setSelected(a.id);
          setReason("");
        }}
        columns={[
          {
            key: "kind",
            label: "Loại yêu cầu",
            render: (a) =>
              ({
                extension: "Gia hạn giữ căn",
                refund: "Hoàn tiền demo",
                adjustment: "Điều chỉnh cọc demo",
                price: "Thay đổi giá",
                status: "Thay đổi tình trạng",
                contract: "Duyệt hợp đồng",
                campaign: "Duyệt nội dung",
              })[a.kind],
          },
          {
            key: "record",
            label: "Hồ sơ liên quan",
            render: (a) => a.recordId,
          },
          { key: "reason", label: "Lý do", render: (a) => a.reason },
          {
            key: "by",
            label: "Người yêu cầu",
            render: (a) => roleNames[a.requestedBy],
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (a) => <Badge>{a.status}</Badge>,
          },
        ]}
      />
      {a && (
        <Modal title="Chi tiết phê duyệt" onClose={() => setSelected("")}>
          <Badge>{a.status}</Badge>
          <p style={{ marginTop: 20 }}>
            Hồ sơ: {a.recordId}
            <br />
            Lý do: {a.reason}
            <br />
            Giá trị đề nghị: {a.value || "Theo chính sách demo"}
          </p>
          <Timeline events={a.history} />
          {session &&
          canApprove(session.role, a.kind) &&
          a.status === "PENDING" ? (
            <>
              <Field label="Ý kiến phê duyệt / từ chối">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </Field>
              <div className="form-actions">
                <Action
                  label="Từ chối yêu cầu"
                  confirm
                  action={() =>
                    run({ type: "approve", id: a.id, approve: false, reason })
                  }
                />
                <Action
                  label="Phê duyệt yêu cầu"
                  className=""
                  confirm
                  action={() =>
                    run({ type: "approve", id: a.id, approve: true, reason })
                  }
                />
              </div>
            </>
          ) : (
            <p className="info-box">
              {a.status !== "PENDING"
                ? "Yêu cầu đã xử lý; xem lịch sử để theo dõi."
                : "Vai trò hiện tại chỉ được xem yêu cầu này, không được phê duyệt."}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
export function Teams() {
  const { data, session, run } = useDemo();
  const [edit, setEdit] = useState<Employee | null | undefined>(),
    [from, setFrom] = useState("staff-sales"),
    [to, setTo] = useState("staff-leader");
  return (
    <>
      <div className="form-actions" style={{ marginTop: 0, marginBottom: 24 }}>
        {session && canWrite(session.role, "employees") && (
          <Button onClick={() => setEdit(null)}>Thêm nhân sự demo</Button>
        )}
      </div>
      <DataTable
        rows={data.employees}
        searchText={(e) => `${e.name} ${e.team} ${roleNames[e.role]}`}
        onSelect={
          session && canWrite(session.role, "employees") ? setEdit : undefined
        }
        columns={[
          {
            key: "name",
            label: "Nhân sự",
            render: (e) => <strong>{e.name}</strong>,
          },
          { key: "team", label: "Phòng ban", render: (e) => e.team },
          { key: "role", label: "Vai trò", render: (e) => roleNames[e.role] },
          {
            key: "work",
            label: "Công việc đang mở",
            render: (e) =>
              data.tasks.filter(
                (t) => t.assignee === e.id && t.status !== "Hoàn thành",
              ).length,
          },
          {
            key: "active",
            label: "Trạng thái",
            render: (e) => <Badge>{e.active ? "Hoạt động" : "Tạm dừng"}</Badge>,
          },
        ]}
      />
      <section className="panel" style={{ marginTop: 25 }}>
        <h3>Chuyển giao trách nhiệm</h3>
        <p className="fine-print">
          Chuyển leads, khách hàng, cơ hội, công việc và lịch hẹn sang nhân sự
          nhận.
        </p>
        <div className="form-grid">
          <Field label="Từ nhân sự">
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {data.employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sang nhân sự">
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {data.employees
                .filter((e) => e.active)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <div className="form-actions">
          <Action
            label="Chuyển giao hồ sơ demo"
            confirm
            action={() => run({ type: "transfer", from, to })}
          />
        </div>
      </section>
      {edit !== undefined && (
        <EntityForm
          entity="employees"
          title={edit ? "Cập nhật nhân sự & vai trò" : "Thêm nhân sự"}
          record={edit || undefined}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
export function Security() {
  const { data, session, expireSession } = useDemo();
  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h2>Ma trận quyền trình bày</h2>
        </div>
        <div className="table-scroll">
          <table className="permission-table">
            <thead>
              <tr>
                <th>Module</th>
                {roles
                  .filter((r) => r !== "buyer")
                  .map((r) => (
                    <th key={r}>{roleNames[r]}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {crmModules.map((m) => (
                <tr key={m}>
                  <th>{moduleNames[m]}</th>
                  {roles
                    .filter((r) => r !== "buyer")
                    .map((r) => (
                      <td key={r}>
                        {canModule(r, "crm", m) ? "✓ Có" : "— Không"}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="info-box">
          Quyền UI được định nghĩa theo vai trò. Thay vai trò nhân sự ở Đội ngũ;
          thiết kế quyền này chưa bảo vệ dữ liệu thực ở server.
        </p>
      </section>
      <section className="panel">
        <h3>Phiên trình duyệt hiện tại</h3>
        <p>
          {session?.name} · {session ? roleNames[session.role] : ""}
        </p>
        <p className="fine-print">
          Hết hạn: {session ? dateTime(session.expiresAt) : ""}. Không quản lý
          thiết bị hay phiên thật bên ngoài trình duyệt.
        </p>
        <Button className="secondary" onClick={expireSession}>
          Thu hồi phiên demo hiện tại
        </Button>
      </section>
      <DataTable
        rows={data.audit}
        searchText={(a) => `${a.action} ${a.actor} ${a.recordId}`}
        columns={[
          { key: "at", label: "Thời gian", render: (a) => dateTime(a.at) },
          { key: "actor", label: "Vai trò", render: (a) => roleNames[a.actor] },
          { key: "action", label: "Hành động", render: (a) => a.action },
          {
            key: "record",
            label: "Hồ sơ",
            render: (a) => a.recordId || "Thiết lập",
          },
        ]}
      />
    </>
  );
}
export function Cms({ settings = false }: { settings?: boolean }) {
  const { data, run } = useDemo();
  const [headline, setHeadline] = useState(data.cms.headline),
    [subtitle, setSubtitle] = useState(data.cms.subtitle),
    [featured, setFeatured] = useState(data.cms.featuredProject),
    [company, setCompany] = useState(data.cms.company),
    [policy, setPolicy] = useState(data.cms.policy),
    [features, setFeatures] = useState(data.cms.features.join(","));
  return (
    <div className="dashboard-grid">
      <section className="panel">
        <div className="panel-header">
          <h2>{settings ? "Cấu hình workspace" : "Nội dung website"}</h2>
        </div>
        <div className="form-stack">
          {settings ? (
            <>
              <Field label="Tên tổ chức demo">
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </Field>
              <Field label="Nhóm tính năng được giới thiệu">
                <input
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                />
              </Field>
              <p className="fine-print">
                Cấu hình giới thiệu khả năng; không phải công cụ bật/tắt bảo mật
                hay tenant isolation.
              </p>
            </>
          ) : (
            <>
              <Field label="Tiêu đề landing">
                <textarea
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </Field>
              <Field label="Dòng mô tả">
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </Field>
              <Field label="Dự án được ưu tiên">
                <select
                  value={featured}
                  onChange={(e) => setFeatured(e.target.value)}
                >
                  {data.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          <Field label="Nội dung chính sách demo">
            <textarea
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
            />
          </Field>
          <Action
            label="Lưu cấu hình demo"
            className=""
            action={() =>
              run({
                type: "cms",
                values: {
                  headline,
                  subtitle,
                  featuredProject: featured,
                  company,
                  policy,
                  features,
                },
              })
            }
          />
        </div>
      </section>
      <section>
        <div className="panel">
          <h3>{settings ? "Gói trình diễn" : "Nhận diện được kế thừa"}</h3>
          {settings ? (
            <>
              <Badge>ENTERPRISE DEMO</Badge>
              <p>01 workspace · 09 vai trò · 03 dự án minh họa</p>
              <p>
                Không có hóa đơn, phí đăng ký hay thanh toán thuê bao. Màn hình
                đa công ty dưới đây chỉ trình bày cấu trúc dự kiến.
              </p>
            </>
          ) : (
            <>
              <img
                src="/brand/arvessa-primary.svg"
                alt="ARVESSA"
                width="300"
                height="60"
              />
              <p>Architecture · Vision · Experience</p>
              <p>
                Logo nguồn giữ nguyên. Bộ màu và typography thống nhất với
                public website.
              </p>
            </>
          )}
        </div>
        <div className="panel">
          <h3>{settings ? "Cấu trúc tổ chức dự kiến" : "Thư viện minh họa"}</h3>
          {settings ? (
            <>
              <p>{company} / Kinh doanh / Chăm sóc / Pháp chế / Tài chính</p>
              <p className="fine-print">
                Dữ liệu demo chỉ thuộc một workspace. Không mô phỏng cách ly
                tenant thật.
              </p>
            </>
          ) : (
            <>
              <img
                src="/images/residence-courtyard.svg"
                alt="Minh họa sân trong"
                width="600"
                height="375"
              />
              <p className="fine-print">
                Tài nguyên nguyên bản trong public/images. Không tải ảnh cá nhân
                lên server.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
