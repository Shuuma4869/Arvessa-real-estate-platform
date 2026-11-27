"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Timeline } from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
import { dateTime } from "@/domain/format";
import { canModule } from "@/domain/permissions";
import { Appointment, Task } from "@/domain/types";
import { workspaceActivity } from "@/domain/workspace-activity";
import { useNow } from "@/lib/use-now";
import { useDemo } from "@/services/store";

export function EmployeeAgenda() {
  const { data, session } = useDemo();
  const now = useNow();
  const [edit, setEdit] = useState<Task | Appointment | null>(null);
  if (!session) return null;
  const allowed = (module: string) => canModule(session.role, "crm", module);
  const pending = data.tasks
    .filter((t) => t.assignee === session.id && t.status !== "Hoàn thành")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const visits = data.appointments
    .filter(
      (a) =>
        a.staff === session.id &&
        Date.parse(a.date) >= now &&
        ["Chờ xác nhận", "Đã xác nhận"].includes(a.status),
    )
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const activity = workspaceActivity(data, session).slice(0, 5);
  return (
    <section aria-label="Lịch làm việc của tôi" className="dashboard-grid">
      <div>
        {allowed("tasks") && (
          <section className="panel">
            <div className="panel-header">
              <h2>Việc cần xử lý</h2>
              <Link className="underlined-link" href="/crm/tasks">
                Xem công việc
              </Link>
            </div>
            {pending.length ? (
              pending.slice(0, 5).map((t) => (
                <div key={t.id} className="setting-row">
                  <div>
                    <h3>{t.title}</h3>
                    <p>
                      Hạn {t.dueDate} · {t.propertyId}
                    </p>
                    <Badge>{t.priority}</Badge>
                  </div>
                  <Button className="secondary" onClick={() => setEdit(t)}>
                    Xử lý
                  </Button>
                </div>
              ))
            ) : (
              <p>Bạn đã xử lý hết công việc được giao.</p>
            )}
          </section>
        )}
        {allowed("appointments") && (
          <section className="panel">
            <div className="panel-header">
              <h2>Lịch tham quan sắp tới</h2>
              <Link className="underlined-link" href="/crm/appointments">
                Xem lịch
              </Link>
            </div>
            {visits.length ? (
              visits.slice(0, 5).map((a) => (
                <div key={a.id} className="setting-row">
                  <div>
                    <h3>
                      {dateTime(a.date)} · {a.propertyId}
                    </h3>
                    <p>
                      {data.customers.find((c) => c.id === a.customerId)?.name}
                    </p>
                    <Badge>{a.status}</Badge>
                  </div>
                  <Button className="secondary" onClick={() => setEdit(a)}>
                    Mở lịch hẹn
                  </Button>
                </div>
              ))
            ) : (
              <p>Chưa có lịch tham quan sắp tới.</p>
            )}
          </section>
        )}
      </div>
      <section className="panel">
        <div className="panel-header">
          <h2>Hoạt động của tôi</h2>
        </div>
        {activity.length ? (
          <Timeline events={activity} />
        ) : (
          <p>Các cập nhật về hồ sơ bạn phụ trách sẽ xuất hiện tại đây.</p>
        )}
      </section>
      {edit && (
        <EntityForm
          entity={"date" in edit ? "appointments" : "tasks"}
          title={"date" in edit ? "Cập nhật lịch hẹn" : "Cập nhật công việc"}
          record={edit}
          onClose={() => setEdit(null)}
        />
      )}
    </section>
  );
}
