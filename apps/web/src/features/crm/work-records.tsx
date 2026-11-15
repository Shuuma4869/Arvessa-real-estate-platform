"use client";
import { useNow } from "@/lib/use-now";
import { useState } from "react";
import { useDemo } from "@/services/store";
import { Appointment, Task, Ticket, Campaign, Contract } from "@/domain/types";
import { canWrite } from "@/domain/permissions";
import { money, dateTime } from "@/domain/format";
import {
  Button,
  DataTable,
  Badge,
  Modal,
  Action,
  Field,
  Timeline,
} from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
export function Appointments() {
  const now = useNow();
  const { data, session } = useDemo();
  const [edit, setEdit] = useState<Appointment | null | undefined>(),
    [calendar, setCalendar] = useState(false);
  const rows = data.appointments.filter((a) =>
    session?.role === "buyer"
      ? a.customerId === session.id
      : session?.role === "sales"
        ? a.staff === session.id
        : true,
  );
  const writable = !!session && canWrite(session.role, "appointments");
  return (
    <>
      <div className="results-toolbar">
        <Button className="secondary" onClick={() => setCalendar(!calendar)}>
          {calendar ? "Danh sách lịch hẹn" : "Xem theo lịch"}
        </Button>
        {writable && (
          <Button onClick={() => setEdit(null)}>Đặt lịch tham quan</Button>
        )}
      </div>
      {calendar && (
        <div className="calendar-strip">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now + i * 86400000).toISOString().slice(0, 10);
            return (
              <div className="calendar-day" key={d}>
                <strong>{d.slice(5)}</strong>
                {rows
                  .filter((a) => a.date.startsWith(d))
                  .map((a) => (
                    <button
                      key={a.id}
                      className="text-button"
                      onClick={() => setEdit(a)}
                    >
                      <p>
                        {a.date.slice(11)} · {a.propertyId}
                        <br />
                        {a.status}
                      </p>
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}
      <DataTable
        rows={rows}
        searchText={(a) =>
          `${a.propertyId} ${data.customers.find((c) => c.id === a.customerId)?.name} ${a.status}`
        }
        onSelect={writable ? setEdit : undefined}
        columns={[
          {
            key: "customer",
            label: "Khách hàng",
            render: (a) =>
              data.customers.find((c) => c.id === a.customerId)?.name,
          },
          {
            key: "property",
            label: "Căn tham quan",
            render: (a) => a.propertyId,
          },
          { key: "date", label: "Lịch hẹn", render: (a) => dateTime(a.date) },
          {
            key: "staff",
            label: "Phụ trách",
            render: (a) => data.employees.find((e) => e.id === a.staff)?.name,
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (a) => <Badge>{a.status}</Badge>,
          },
          {
            key: "feedback",
            label: "Phản hồi",
            render: (a) => a.feedback || "Chưa có",
          },
        ]}
      />
      <p className="fine-print">
        Mở hồ sơ để xác nhận, đổi lịch, hủy, check-in demo và ghi phản hồi. Hệ
        thống kiểm tra trùng giờ với khách hàng hoặc nhân viên.
      </p>
      {edit !== undefined && (
        <EntityForm
          entity="appointments"
          title={edit ? "Cập nhật lịch hẹn" : "Đặt lịch tham quan"}
          record={edit || undefined}
          defaults={{
            staff: "staff-sales",
            propertyId: "A0302",
            customerId: "buyer-demo",
          }}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
export function Tasks() {
  const now = useNow();
  const { data, session, run } = useDemo();
  const [edit, setEdit] = useState<Task | null | undefined>(),
    [team, setTeam] = useState(false),
    [calendar, setCalendar] = useState(false);
  const rows = data.tasks.filter((t) =>
    team && session?.role !== "sales" ? true : t.assignee === session?.id,
  );
  return (
    <>
      <div className="results-toolbar">
        <div className="actions">
          <Button className="secondary" onClick={() => setTeam(!team)}>
            {team ? "Công việc của tôi" : "Công việc nhóm"}
          </Button>
          <Button className="secondary" onClick={() => setCalendar(!calendar)}>
            {calendar ? "Danh sách" : "Lịch hạn xử lý"}
          </Button>
        </div>
        {session && canWrite(session.role, "tasks") && (
          <Button onClick={() => setEdit(null)}>Tạo công việc</Button>
        )}
      </div>
      {calendar && (
        <div className="calendar-strip">
          {Array.from({ length: 7 }, (_, i) => {
            const day = new Date(now + i * 86400000).toISOString().slice(0, 10);
            return (
              <div className="calendar-day" key={day}>
                <strong>{day}</strong>
                {rows
                  .filter((t) => t.dueDate === day)
                  .map((t) => (
                    <p key={t.id}>{t.title}</p>
                  ))}
              </div>
            );
          })}
        </div>
      )}
      <DataTable
        rows={rows}
        searchText={(t) => `${t.title} ${t.status}`}
        onSelect={(t) => setEdit(t)}
        columns={[
          {
            key: "title",
            label: "Công việc",
            render: (t) => (
              <>
                <strong>{t.title}</strong>
                <small>
                  {t.customerId} · {t.propertyId}
                </small>
              </>
            ),
          },
          {
            key: "owner",
            label: "Phụ trách",
            render: (t) =>
              data.employees.find((e) => e.id === t.assignee)?.name,
          },
          {
            key: "due",
            label: "Hạn xử lý",
            render: (t) => (
              <>
                {t.dueDate}
                {new Date(t.dueDate).getTime() < now &&
                  t.status !== "Hoàn thành" && (
                    <small className="error-text">Quá hạn</small>
                  )}
              </>
            ),
          },
          {
            key: "priority",
            label: "Ưu tiên",
            render: (t) => <Badge>{t.priority}</Badge>,
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (t) => <Badge>{t.status}</Badge>,
          },
          {
            key: "delete",
            label: "Thao tác",
            render: (t) =>
              session && canWrite(session.role, "tasks") ? (
                <Action
                  label="Xóa"
                  confirm
                  action={() =>
                    run({ type: "delete", entity: "tasks", id: t.id })
                  }
                />
              ) : (
                <small>Chỉ đọc</small>
              ),
          },
        ]}
      />
      {edit !== undefined && (
        <EntityForm
          entity="tasks"
          title={edit ? "Chỉnh sửa công việc" : "Tạo công việc"}
          record={edit || undefined}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
export function Support() {
  const now = useNow();
  const { data, session, run } = useDemo();
  const [edit, setEdit] = useState<Ticket | null | undefined>(),
    [selected, setSelected] = useState(""),
    [reply, setReply] = useState("");
  const rows = data.tickets.filter(
    (t) => session?.role !== "buyer" || t.customerId === session.id,
  );
  const t = rows.find((t) => t.id === selected);
  return (
    <>
      <div className="form-actions" style={{ marginTop: 0, marginBottom: 24 }}>
        <Button onClick={() => setEdit(null)}>Tạo yêu cầu hỗ trợ</Button>
      </div>
      <DataTable
        rows={rows}
        searchText={(t) => `${t.title} ${t.status}`}
        onSelect={(t) => setSelected(t.id)}
        columns={[
          {
            key: "title",
            label: "Yêu cầu",
            render: (t) => <strong>{t.title}</strong>,
          },
          {
            key: "customer",
            label: "Khách hàng",
            render: (t) =>
              data.customers.find((c) => c.id === t.customerId)?.name,
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (t) => <Badge>{t.status}</Badge>,
          },
          {
            key: "priority",
            label: "Ưu tiên",
            render: (t) => <Badge>{t.priority}</Badge>,
          },
          {
            key: "sla",
            label: "SLA demo",
            render: (t) => (
              <span>
                {t.status === "Đã giải quyết"
                  ? "Đã xử lý"
                  : now - t.createdAt > 86400000
                    ? "Cần chú ý"
                    : "Trong 24 giờ"}
              </span>
            ),
          },
        ]}
      />
      {t && (
        <Modal title={t.title} onClose={() => setSelected("")}>
          <Badge>{t.status}</Badge>
          <p className="fine-print">
            Phụ trách: {data.employees.find((e) => e.id === t.assignee)?.name} ·
            Tệp demo: {t.attachment || "Chưa có"}
          </p>
          {t.messages.map((m, i) => (
            <div className="chat-bubble" key={i}>
              {m.text}
              <small>
                {m.actor} · {dateTime(m.at)}
              </small>
            </div>
          ))}
          <Field label="Nội dung trả lời">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
          </Field>
          <div className="form-actions">
            <Button
              className="secondary"
              onClick={() => {
                setEdit(t);
                setSelected("");
              }}
            >
              Cập nhật / chuyển cấp / đánh giá
            </Button>
            <Action
              label="Gửi vào hội thoại demo"
              className=""
              action={async () => {
                await run({ type: "ticket-message", id: t.id, text: reply });
                setReply("");
              }}
            />
          </div>
        </Modal>
      )}
      {edit !== undefined && (
        <EntityForm
          entity="tickets"
          title={edit ? "Cập nhật yêu cầu hỗ trợ" : "Tạo yêu cầu hỗ trợ"}
          record={edit || undefined}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
export function Marketing() {
  const { data, session, run } = useDemo();
  const [edit, setEdit] = useState<Campaign | null | undefined>(),
    [selected, setSelected] = useState("");
  const c = data.campaigns.find((c) => c.id === selected);
  return (
    <>
      <div className="form-actions" style={{ marginTop: 0, marginBottom: 24 }}>
        {session && canWrite(session.role, "campaigns") && (
          <Button onClick={() => setEdit(null)}>Tạo chiến dịch</Button>
        )}
      </div>
      <DataTable
        rows={data.campaigns}
        searchText={(c) => `${c.title} ${c.source}`}
        onSelect={(c) => setSelected(c.id)}
        columns={[
          {
            key: "title",
            label: "Chiến dịch",
            render: (c) => <strong>{c.title}</strong>,
          },
          { key: "audience", label: "Phân khúc", render: (c) => c.audience },
          { key: "source", label: "Nguồn", render: (c) => c.source },
          {
            key: "budget",
            label: "Ngân sách demo",
            render: (c) => money(c.budget),
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (c) => <Badge>{c.status}</Badge>,
          },
        ]}
      />
      {c && (
        <Modal title={c.title} onClose={() => setSelected("")}>
          <p>
            {c.audience} · Ngày bắt đầu: {c.startDate}
          </p>
          <div className="document-preview">
            <h2>Mẫu nội dung</h2>
            <p>{c.content}</p>
          </div>
          <p>
            Leads cùng nguồn {c.source}:{" "}
            {data.leads.filter((l) => l.source === c.source).length}. Chỉ số
            nguồn không khẳng định tất cả leads đến từ chiến dịch này.
          </p>
          <div className="actions">
            {session && canWrite(session.role, "campaigns") && (
              <>
                <Button
                  className="secondary"
                  onClick={() => {
                    setEdit(c);
                    setSelected("");
                  }}
                >
                  Chỉnh nội dung
                </Button>
                <Action
                  label="Gửi duyệt nội dung"
                  action={() =>
                    run({
                      type: "request",
                      kind: "campaign",
                      id: c.id,
                      reason:
                        "Duyệt nội dung chiến dịch trước khi phát hành demo.",
                      value: "",
                    })
                  }
                />
                <Action
                  label="Xóa bản nháp"
                  confirm
                  action={async () => {
                    await run({
                      type: "delete",
                      entity: "campaigns",
                      id: c.id,
                    });
                    setSelected("");
                  }}
                />
              </>
            )}
          </div>
          <Timeline
            events={data.approvals
              .filter((a) => a.recordId === c.id)
              .flatMap((a) => a.history)}
          />
        </Modal>
      )}
      {edit !== undefined && (
        <EntityForm
          entity="campaigns"
          title={edit ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch"}
          record={edit || undefined}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
export function Contracts() {
  const { data, session, run } = useDemo();
  const [selected, setSelected] = useState(""),
    [edit, setEdit] = useState<Contract | undefined>();
  const rows = data.contracts.filter(
    (c) => session?.role !== "buyer" || c.customerId === session.id,
  );
  const c = rows.find((c) => c.id === selected);
  const writable = ["legal", "manager", "admin", "platform"].includes(
    session?.role || "",
  );
  const eligible = data.reservations.filter(
    (r) => r.status === "DEPOSIT_CONFIRMED",
  );
  return (
    <>
      {writable && eligible.length > 0 && (
        <section className="panel">
          <h3>Hồ sơ đủ điều kiện tạo hợp đồng</h3>
          {eligible.map((r) => (
            <div className="activity-row" key={r.id}>
              <p>
                Căn {r.propertyId} ·{" "}
                {data.customers.find((c) => c.id === r.buyerId)?.name}
              </p>
              <Action
                label="Tạo dự thảo"
                action={() =>
                  run({ type: "contract", id: r.id, action: "draft" })
                }
              />
            </div>
          ))}
        </section>
      )}
      <DataTable
        rows={rows}
        searchText={(c) => `${c.id} ${c.status}`}
        onSelect={(c) => setSelected(c.id)}
        columns={[
          { key: "id", label: "Hợp đồng demo", render: (c) => c.id },
          {
            key: "customer",
            label: "Khách hàng",
            render: (c) =>
              data.customers.find((x) => x.id === c.customerId)?.name,
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (c) => <Badge>{c.status}</Badge>,
          },
          {
            key: "version",
            label: "Phiên bản",
            render: (c) => `v${c.version}`,
          },
          { key: "due", label: "Hạn xử lý", render: (c) => c.dueDate },
        ]}
      />
      {!rows.length && (
        <p className="fine-print">
          Hợp đồng được tạo từ đặt cọc đã xác nhận, không tạo hồ sơ độc lập mất
          liên kết.
        </p>
      )}
      {c && (
        <Modal wide title={`Hợp đồng ${c.id}`} onClose={() => setSelected("")}>
          <div className="detail-grid">
            <div className="document-preview">
              <img
                src="/brand/arvessa-primary.svg"
                alt="ARVESSA"
                width="210"
                height="42"
              />
              <h2>Hồ sơ giao dịch mô phỏng</h2>
              <p>Phiên bản {c.version} · Không có giá trị pháp lý</p>
              <p>
                Khách hàng:{" "}
                {data.customers.find((x) => x.id === c.customerId)?.name}
              </p>
              <p>
                Căn:{" "}
                {
                  data.reservations.find((r) => r.id === c.reservationId)
                    ?.propertyId
                }
              </p>
              <p>Trạng thái: {c.status}</p>
              <p>
                Đây là bản xem trước để thử quy trình soạn thảo, rà soát, phê
                duyệt và ký mô phỏng. Không phải hợp đồng mua bán.
              </p>
              <p>Nhận xét: {c.comment || "Chưa có nhận xét."}</p>
              <p>Tệp demo: {c.attachment || "Chưa đính kèm"}</p>
            </div>
            <section>
              <h3>Lịch sử phiên bản</h3>
              {(c.versions || []).map((v) => (
                <details key={v.version}>
                  <summary>
                    Phiên bản {v.version} · {dateTime(v.at)}
                  </summary>
                  <p>
                    {v.comment || "Chưa có nhận xét"}
                    <br />
                    {v.attachment || "Không có tệp"}
                    <br />
                    {v.checklist.join(", ")}
                  </p>
                </details>
              ))}
              <p>Phiên bản hiện tại: {c.version}</p>
              <h3>Checklist hồ sơ</h3>
              {c.checklist.length ? (
                c.checklist.map((s) => <p key={s}>✓ {s}</p>)
              ) : (
                <p>Chưa xác nhận mục kiểm tra.</p>
              )}
              <h3>Hành động cần thực hiện</h3>
              <p>
                Kiểm tra hồ sơ khách hàng và điều khoản dự án trước khi gửi
                duyệt. Phê duyệt thực hiện tại Management Console.
              </p>
              {writable &&
                !["Đã ký demo", "Đã hủy sau hoàn cọc"].includes(c.status) && (
                  <div className="form-stack">
                    <Button
                      className="secondary"
                      onClick={() => {
                        setEdit(c);
                        setSelected("");
                      }}
                    >
                      Cập nhật checklist / phiên bản
                    </Button>
                    <Action
                      label="Gửi rà soát và phê duyệt"
                      action={() =>
                        run({ type: "contract", id: c.id, action: "review" })
                      }
                    />
                    <Action
                      label="Ký hợp đồng mô phỏng"
                      confirm
                      disabled={c.status !== "Chờ ký"}
                      action={() =>
                        run({ type: "contract", id: c.id, action: "sign" })
                      }
                    />
                  </div>
                )}
              <h3 style={{ marginTop: 25 }}>Lịch sử phê duyệt</h3>
              <Timeline
                events={data.approvals
                  .filter((a) => a.recordId === c.id)
                  .flatMap((a) => a.history)}
              />
            </section>
          </div>
        </Modal>
      )}
      {edit && (
        <EntityForm
          entity="contracts"
          title="Cập nhật hồ sơ hợp đồng"
          record={edit}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
