"use client";
import { useNow } from "@/lib/use-now";
import Link from "next/link";
import { useState } from "react";
import {
  Users,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  Clock,
  Building2,
  Bookmark,
  Wallet,
} from "lucide-react";
import { useDemo } from "@/services/store";
import { compactMoney, dateTime } from "@/domain/format";
import { Badge, Empty } from "@/components/ui";
import { Scope } from "@/domain/types";
import { canModule } from "@/domain/permissions";
export default function Dashboard({ scope }: { scope: Scope }) {
  const now = useNow();
  const { data, session } = useDemo();
  const [days, setDays] = useState(30);
  const buyer = scope === "buyer";
  const role = session?.role || "buyer";
  const can = (area: Scope, page: string) => canModule(role, area, page);
  const customerName = buyer
    ? data.customers.find((c) => c.id === session?.id)?.name
    : session?.name;
  const own = (id: string) => !buyer || id === session?.id;
  const reservations = data.reservations.filter((r) => own(r.buyerId)),
    appointments = data.appointments.filter(
      (a) => own(a.customerId) && a.status !== "Đã hủy",
    );
  const leads = data.leads.filter(
    (l) => session?.role !== "sales" || l.assignee === session.id,
  );
  const opportunities = data.opportunities.filter(
    (o) => session?.role !== "sales" || o.assignee === session.id,
  );
  const payments = data.payments.filter(
    (p) =>
      reservations.some((r) => r.id === p.reservationId) &&
      p.status === "CONFIRMED",
  );
  const metrics = buyer
    ? [
        [
          "Căn yêu thích",
          data.favorites.length,
          "Theo dõi lựa chọn",
          Building2,
          "properties",
        ],
        [
          "Lịch hẹn",
          appointments.length,
          "Đang lên kế hoạch",
          CalendarDays,
          "appointments",
        ],
        [
          "Yêu cầu giữ căn",
          reservations.length,
          "Theo dõi tiến trình",
          Bookmark,
          "reservations",
        ],
        [
          "Đặt cọc demo",
          compactMoney(payments.reduce((n, p) => n + p.amount, 0)),
          "Chỉ gồm đã xác nhận",
          Wallet,
          "payments",
        ],
      ]
    : role === "finance"
      ? [
          [
            "Cọc đã xác nhận demo",
            compactMoney(payments.reduce((sum, p) => sum + p.amount, 0)),
            "Số liệu mô phỏng",
            Wallet,
            "payments",
          ],
          [
            "Chờ đối soát",
            data.payments.filter((p) => p.status === "VERIFICATION").length,
            "Cần kiểm tra giao dịch",
            Clock,
            "payments",
          ],
          [
            "Chờ hoàn",
            data.payments.filter((p) => p.status === "REFUND_REQUESTED").length,
            "Yêu cầu phê duyệt",
            Bookmark,
            "payments",
          ],
          [
            "Giao dịch demo",
            data.payments.length,
            "Lịch sử ghi nhận",
            TrendingUp,
            "reports",
          ],
        ]
      : role === "legal"
        ? [
            [
              "Hợp đồng",
              data.contracts.length,
              "Liên kết đặt cọc",
              Bookmark,
              "contracts",
            ],
            [
              "Đang rà soát",
              data.contracts.filter((c) =>
                ["Bản nháp", "Cần chỉnh sửa"].includes(c.status),
              ).length,
              "Kiểm tra checklist",
              Clock,
              "contracts",
            ],
            [
              "Chờ ký",
              data.contracts.filter((c) => c.status === "Chờ ký").length,
              "Đã qua phê duyệt",
              Users,
              "contracts",
            ],
            [
              "Đã ký demo",
              data.contracts.filter((c) => c.status === "Đã ký demo").length,
              "Không có giá trị pháp lý",
              TrendingUp,
              "contracts",
            ],
          ]
        : role === "support"
          ? [
              [
                "Tickets",
                data.tickets.length,
                "Hồ sơ hỗ trợ",
                Users,
                "support",
              ],
              [
                "Cần xử lý",
                data.tickets.filter((t) => t.status !== "Đã giải quyết").length,
                "Theo dõi hội thoại",
                Clock,
                "support",
              ],
              [
                "Lịch hẹn",
                appointments.length,
                "Điều phối trải nghiệm",
                CalendarDays,
                "appointments",
              ],
              [
                "Khách hàng",
                data.customers.length,
                "Góc nhìn 360°",
                Bookmark,
                "customers",
              ],
            ]
          : [
              [
                "Khách hàng tiềm năng",
                leads.length,
                "Trong phạm vi phụ trách",
                Users,
                "leads",
              ],
              [
                "Giá trị cơ hội",
                compactMoney(
                  opportunities
                    .filter((o) => o.stage !== "Không thành công")
                    .reduce((n, o) => n + o.amount, 0),
                ),
                "Tổng giá trị, chưa phải doanh thu",
                TrendingUp,
                "pipeline",
              ],
              [
                "Căn còn trống",
                data.properties.filter((p) => p.availability === "AVAILABLE")
                  .length,
                "Giỏ hàng toàn dự án demo",
                Building2,
                "inventory",
              ],
              [
                "Chờ phê duyệt",
                data.approvals.filter((a) => a.status === "PENDING").length,
                "Yêu cầu trong hệ thống demo",
                Clock,
                "reservations",
              ],
            ];
  const stages = ["Mới", "Tư vấn", "Tham quan", "Đàm phán", "Thành công"];
  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">YOUR PERSPECTIVE, TODAY</p>
          <h2>Chào {customerName?.split(" ").slice(-2).join(" ")}.</h2>
          <p>
            {buyer
              ? "Những lựa chọn và bước tiếp theo dành cho bạn."
              : "Một góc nhìn rõ hơn để bắt đầu ngày làm việc."}
          </p>
        </div>
        <select
          aria-label="Khoảng thời gian dashboard"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value="7">7 ngày tới</option>
          <option value="30">30 ngày tới</option>
          <option value="90">90 ngày tới</option>
        </select>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value, note, Icon, path]) => {
          const I = Icon as typeof Users;
          const targetScope: Scope =
            scope === "management"
              ? path === "inventory" || path === "reservations"
                ? "management"
                : "crm"
              : scope;
          const target =
            scope === "management" && path === "reservations"
              ? "approvals"
              : String(path);
          const href = `/${targetScope}/${target}`;
          const content = (
            <>
              <small>
                {String(label)}
                <I size={16} />
              </small>
              <strong>{String(value)}</strong>
              <span>{String(note)}</span>
            </>
          );
          if (!can(targetScope, target))
            return (
              <div className="metric" key={String(label)}>
                {content}
              </div>
            );
          return (
            <Link className="metric" key={String(label)} href={href}>
              <small>
                {String(label)}
                <I size={16} />
              </small>
              <strong>{String(value)}</strong>
              <span>{String(note)}</span>
            </Link>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <section
          className="panel"
          style={{
            display:
              data.preferences.widgets.includes("pipeline") &&
              (buyer || can("crm", "pipeline"))
                ? undefined
                : "none",
          }}
        >
          <div className="panel-header">
            <h2>
              {buyer ? "Hành trình lựa chọn" : "Tổng quan cơ hội kinh doanh"}
            </h2>
            <Link href={buyer ? "/buyer/reservations" : "/crm/pipeline"}>
              Xem chi tiết ↗
            </Link>
          </div>
          <div className="chart-bars">
            {stages.map((s) => {
              const n = buyer
                ? reservations.filter((r) =>
                    s === "Thành công"
                      ? [
                          "DEPOSIT_CONFIRMED",
                          "CONTRACT_PENDING",
                          "CONTRACT_COMPLETED",
                        ].includes(r.status)
                      : s === "Mới"
                        ? r.status === "TEMPORARILY_HELD"
                        : false,
                  ).length
                : opportunities.filter((o) => o.stage === s).length;
              return (
                <button
                  key={s}
                  style={{
                    height: `${Math.max(10, Math.min(95, n * 35 + 10))}%`,
                  }}
                  aria-label={`${s}: ${n} hồ sơ`}
                  onClick={() =>
                    useDemo
                      .getState()
                      .notify(
                        `${s}: ${n} ${buyer ? "yêu cầu giữ căn" : "cơ hội"}. Mở chi tiết để thao tác.`,
                      )
                  }
                >
                  <span>{n}</span>
                  <small>{s}</small>
                </button>
              );
            })}
          </div>
          <p className="chart-legend">
            Số liệu tính từ dữ liệu demo hiện tại · Không phải kết quả kinh
            doanh thật.
          </p>
        </section>
        <section
          className="panel"
          style={{
            display:
              data.preferences.widgets.includes("visits") &&
              (buyer || can("crm", "appointments"))
                ? undefined
                : "none",
          }}
        >
          <div className="panel-header">
            <h2>Lịch hẹn sắp tới</h2>
            <Link href={`/${buyer ? "buyer" : "crm"}/appointments`}>
              Xem lịch ↗
            </Link>
          </div>
          {appointments
            .filter(
              (a) =>
                new Date(a.date).getTime() >= now &&
                new Date(a.date).getTime() < now + days * 86400000,
            )
            .slice(0, 4)
            .map((a) => (
              <div className="activity-row" key={a.id}>
                <span className="activity-icon">
                  <CalendarDays />
                </span>
                <div>
                  <h3>Tham quan căn {a.propertyId}</h3>
                  <p>
                    {dateTime(a.date)}
                    <br />
                    {data.customers.find((c) => c.id === a.customerId)?.name}
                  </p>
                </div>
                <Badge>{a.status}</Badge>
              </div>
            ))}
          {!appointments.length && <Empty title="Chưa có lịch hẹn" />}
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>{buyer ? "Tiến trình giao dịch" : "Công việc cần chú ý"}</h2>
            {(buyer || can("crm", "tasks")) && (
              <Link href={`/${buyer ? "buyer/reservations" : "crm/tasks"}`}>
                Mở danh sách ↗
              </Link>
            )}
          </div>
          {buyer
            ? reservations.slice(0, 4).map((r) => (
                <div className="activity-row" key={r.id}>
                  <span className="activity-icon">
                    <Bookmark />
                  </span>
                  <div>
                    <h3>Căn {r.propertyId}</h3>
                    <p>{r.history.at(-1)?.text}</p>
                  </div>
                  <Badge>{r.status}</Badge>
                </div>
              ))
            : data.tasks
                .filter(
                  (t) =>
                    t.status !== "Hoàn thành" &&
                    (session?.role !== "sales" || t.assignee === session.id),
                )
                .map((t) => (
                  <div className="activity-row" key={t.id}>
                    <span className="activity-icon">
                      <Clock />
                    </span>
                    <div>
                      <h3>{t.title}</h3>
                      <p>Hạn: {t.dueDate}</p>
                    </div>
                    <Badge>{t.priority}</Badge>
                  </div>
                ))}
          {buyer && !reservations.length && (
            <Empty title="Hành trình đang mở">
              <Link href="/discover" className="underlined-link">
                Khám phá bộ sưu tập
              </Link>
            </Empty>
          )}
        </section>
        <section
          className="panel"
          style={{
            display: data.preferences.widgets.includes("inventory")
              ? undefined
              : "none",
          }}
        >
          <div className="panel-header">
            <h2>Giỏ hàng theo dự án</h2>
            <Link href="/discover">Khám phá ↗</Link>
          </div>
          {data.projects.map((p) => (
            <div className="activity-row" key={p.id}>
              <span className="activity-icon">
                <Building2 />
              </span>
              <div>
                <h3>{p.name}</h3>
                <p>
                  {
                    data.properties.filter(
                      (x) =>
                        x.projectId === p.id && x.availability === "AVAILABLE",
                    ).length
                  }{" "}
                  căn còn trống · {p.location.split(" · ")[1]}
                </p>
              </div>
              <Link
                href={`/projects/${p.id}`}
                aria-label={`Xem dự án ${p.name}`}
                style={{ marginLeft: "auto" }}
              >
                <ArrowUpRight size={17} />
              </Link>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
