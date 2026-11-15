"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useDemo } from "@/services/store";
import { Lead, Customer } from "@/domain/types";
import { canWrite } from "@/domain/permissions";
import { money } from "@/domain/format";
import {
  DataTable,
  Button,
  Badge,
  Modal,
  Timeline,
  Action,
} from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
import { ReservationCard } from "../reservation/reservation";
export function Leads() {
  const { data, session, run } = useDemo();
  const [edit, setEdit] = useState<Lead | null | undefined>(),
    [selected, setSelected] = useState(""),
    [status, setStatus] = useState(""),
    [mergeTarget, setMergeTarget] = useState("");
  const writable = !!session && canWrite(session.role, "leads");
  const rows = data.leads.filter(
    (l) =>
      (session?.role !== "sales" || l.assignee === session.id) &&
      (!status || l.status === status),
  );
  const current = data.leads.find((l) => l.id === selected);
  return (
    <>
      <div className="results-toolbar">
        <div className="actions">
          <select
            aria-label="Lọc trạng thái lead"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {[
              "Mới",
              "Đã liên hệ",
              "Đã tư vấn",
              "Đủ điều kiện",
              "Đã chuyển",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Action
            label="Lưu bộ lọc"
            action={() =>
              run({
                type: "search",
                name: `CRM Lead: ${status || "Tất cả"}`,
                query: `crm-status=${encodeURIComponent(status)}`,
              })
            }
          />
        </div>
        {writable && (
          <Button onClick={() => setEdit(null)}>
            <Plus size={16} />
            Tạo khách hàng tiềm năng
          </Button>
        )}
      </div>
      <DataTable
        rows={rows}
        searchText={(l) => `${l.name} ${l.email} ${l.phone}`}
        onSelect={(l) => setSelected(l.id)}
        columns={[
          {
            key: "name",
            label: "Khách hàng",
            render: (l) => (
              <>
                <strong>{l.name}</strong>
                <small>{l.email}</small>
              </>
            ),
          },
          { key: "source", label: "Nguồn", render: (l) => l.source },
          {
            key: "status",
            label: "Trạng thái",
            render: (l) => <Badge>{l.status}</Badge>,
          },
          {
            key: "priority",
            label: "Ưu tiên",
            render: (l) => <Badge>{l.priority}</Badge>,
          },
          {
            key: "owner",
            label: "Phụ trách",
            render: (l) =>
              data.employees.find((e) => e.id === l.assignee)?.name,
          },
          { key: "budget", label: "Ngân sách", render: (l) => money(l.budget) },
        ]}
      />
      {edit !== undefined && (
        <EntityForm
          entity="leads"
          record={edit || undefined}
          title={
            edit ? "Chỉnh sửa khách hàng tiềm năng" : "Tạo khách hàng tiềm năng"
          }
          onClose={() => setEdit(undefined)}
        />
      )}{" "}
      {current && (
        <Modal title={current.name} onClose={() => setSelected("")}>
          <dl className="stat-list">
            <div>
              <dt>Email</dt>
              <dd>{current.email}</dd>
            </div>
            <div>
              <dt>Điện thoại demo</dt>
              <dd>{current.phone || "Chưa cung cấp"}</dd>
            </div>
            <div>
              <dt>Ngân sách</dt>
              <dd>{money(current.budget)}</dd>
            </div>
            <div>
              <dt>Căn quan tâm</dt>
              <dd>
                <Link href={`/properties/${current.propertyId}`}>
                  {current.propertyId}
                </Link>
              </dd>
            </div>
          </dl>
          <p>{current.notes}</p>
          <Badge>{current.status}</Badge>
          <hr />
          <div className="actions">
            {writable && (
              <>
                <Button
                  className="secondary"
                  onClick={() => {
                    setEdit(current);
                    setSelected("");
                  }}
                >
                  Chỉnh sửa / bổ sung thông tin
                </Button>
                <Action
                  label="Chuyển thành cơ hội"
                  disabled={current.status === "Đã chuyển"}
                  action={() => run({ type: "convert", id: current.id })}
                />
                <Action
                  label="Xóa lead"
                  confirm
                  action={async () => {
                    await run({
                      type: "delete",
                      entity: "leads",
                      id: current.id,
                    });
                    setSelected("");
                  }}
                />
              </>
            )}
          </div>
          <div className="info-box">
            Kiểm tra trùng bằng email khi tạo/sửa. Nếu trùng, giữ hồ sơ hiện có
            và bổ sung thông tin vào ghi chú; không tự xóa lịch sử.
          </div>
          {writable && (
            <details>
              <summary className="fine-print">Xem xét hợp nhất hồ sơ</summary>
              <label className="field">
                <span>Hồ sơ đích</span>
                <select
                  value={mergeTarget}
                  onChange={(e) => setMergeTarget(e.target.value)}
                >
                  <option value="">Chọn hồ sơ giữ thông tin</option>
                  {rows
                    .filter((l) => l.id !== current.id)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} · {l.email}
                      </option>
                    ))}
                </select>
              </label>
              <p className="fine-print">
                Ghi chú và lịch sử sẽ được bổ sung sang hồ sơ đích. Hồ sơ nguồn
                giữ lại với trạng thái Đã hợp nhất.
              </p>
              <Action
                label="Hợp nhất sau khi xem xét"
                confirm
                disabled={!mergeTarget}
                action={() =>
                  run({
                    type: "merge",
                    sourceId: current.id,
                    targetId: mergeTarget,
                  })
                }
              />
            </details>
          )}
          <Timeline events={current.history} />
        </Modal>
      )}
    </>
  );
}
export function Customers() {
  const { data, session } = useDemo();
  const [selected, setSelected] = useState(""),
    [edit, setEdit] = useState<Customer | undefined>();
  const rows = data.customers.filter(
    (c) => session?.role !== "sales" || c.assignee === session.id,
  );
  const c = rows.find((c) => c.id === selected);
  const restricted = ["legal", "finance"].includes(session?.role || "");
  return (
    <>
      <DataTable
        rows={rows}
        searchText={(c) => `${c.name} ${c.email}`}
        onSelect={(c) => setSelected(c.id)}
        columns={[
          {
            key: "name",
            label: "Khách hàng",
            render: (c) => <strong>{c.name}</strong>,
          },
          {
            key: "email",
            label: "Liên hệ",
            render: (c) => (restricted ? "••••@example.test" : c.email),
          },
          { key: "budget", label: "Ngân sách", render: (c) => money(c.budget) },
          { key: "needs", label: "Nhu cầu", render: (c) => c.preferences },
          {
            key: "owner",
            label: "Phụ trách",
            render: (c) =>
              data.employees.find((e) => e.id === c.assignee)?.name,
          },
        ]}
      />
      {c && (
        <Modal
          wide
          title={`${c.name} · Customer 360°`}
          onClose={() => setSelected("")}
        >
          <div className="detail-grid">
            <section>
              <h3>Thông tin & nhu cầu</h3>
              <p>
                {restricted
                  ? "Thông tin liên hệ được che theo vai trò demo."
                  : `${c.email} · ${c.phone}`}
              </p>
              <p>{c.preferences}</p>
              <p>{c.notes}</p>
              <p>Ngân sách: {money(c.budget)}</p>
              {session && canWrite(session.role, "customers") && (
                <Button
                  className="secondary"
                  onClick={() => {
                    setEdit(c);
                    setSelected("");
                  }}
                >
                  Cập nhật hồ sơ
                </Button>
              )}
              <hr />
              <h3>Lịch sử tham quan</h3>
              {data.appointments
                .filter((a) => a.customerId === c.id)
                .map((a) => (
                  <p key={a.id}>
                    {a.propertyId} · {a.date.replace("T", " ")} · {a.status}
                    <br />
                    {a.feedback}
                  </p>
                ))}
              <h3>Trao đổi & ghi chú</h3>
              <Timeline
                events={data.leads
                  .filter((l) => l.customerId === c.id)
                  .flatMap((l) => l.history)}
              />
              <h3>Công việc liên quan</h3>
              {data.tasks
                .filter((t) => t.customerId === c.id)
                .map((t) => (
                  <p key={t.id}>
                    {t.title} — {t.status}
                  </p>
                ))}
              <h3>Căn quan tâm</h3>
              {c.consent && c.id === "buyer-demo" ? (
                <div className="actions">
                  {data.favorites.map((id) => (
                    <Link
                      key={id}
                      className="button secondary"
                      href={`/properties/${id}`}
                    >
                      {id}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="info-box">
                  Chưa có quyền chia sẻ sở thích của khách hàng này.
                </p>
              )}
            </section>
            <section>
              <h3>Giữ căn & giao dịch</h3>
              {data.reservations
                .filter((r) => r.buyerId === c.id)
                .map((r) => (
                  <ReservationCard key={r.id} reservation={r} />
                ))}
              {!data.reservations.some((r) => r.buyerId === c.id) && (
                <p>Chưa phát sinh giữ căn.</p>
              )}
              <h3>Thanh toán</h3>
              {data.payments
                .filter(
                  (p) =>
                    data.reservations.find((r) => r.id === p.reservationId)
                      ?.buyerId === c.id,
                )
                .map((p) => (
                  <p key={p.id}>
                    {money(p.amount)} · <Badge>{p.status}</Badge>
                  </p>
                ))}
              <h3>Hợp đồng</h3>
              {data.contracts
                .filter((ct) => ct.customerId === c.id)
                .map((ct) => (
                  <p key={ct.id}>
                    {ct.id} · {ct.status}
                  </p>
                ))}
            </section>
          </div>
        </Modal>
      )}
      {edit && (
        <EntityForm
          entity="customers"
          title="Cập nhật khách hàng"
          record={edit}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
