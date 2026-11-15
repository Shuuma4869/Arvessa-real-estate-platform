"use client";
import { useNow } from "@/lib/use-now";
import { useState } from "react";
import { useDemo } from "@/services/store";
import { csvCell, money } from "@/domain/format";
import { Button, DataTable, Badge } from "@/components/ui";
export function Reports() {
  const now = useNow();
  const { data, notify } = useDemo();
  const [project, setProject] = useState(""),
    [period, setPeriod] = useState("all");
  const units = data.properties.filter(
    (p) => !project || p.projectId === project,
  );
  const reservations = data.reservations.filter(
    (r) =>
      units.some((p) => p.id === r.propertyId) &&
      (period === "all" ||
        (r.history[0]?.at || 0) > now - Number(period) * 86400000),
  );
  const payments = data.payments.filter((p) =>
    reservations.some((r) => r.id === p.reservationId),
  );
  const cancelled = reservations.filter((r) =>
    ["HOLD_CANCELLED", "HOLD_EXPIRED"].includes(r.status),
  ).length;
  const indicators = [
    ["Giỏ hàng", units.length],
    ["Yêu cầu giữ căn", reservations.length],
    [
      "Tỷ lệ hủy / hết hạn",
      `${reservations.length ? Math.round((cancelled / reservations.length) * 100) : 0}%`,
    ],
    [
      "Cọc đã xác nhận demo",
      money(
        payments
          .filter((p) => p.status === "CONFIRMED")
          .reduce((n, p) => n + p.amount, 0),
      ),
    ],
  ];
  const exportCsv = () => {
    const rows = [
      ["Mã căn", "Dự án", "Tình trạng", "Giá demo"],
      ...units.map((p) => [p.id, p.projectId, p.availability, p.price]),
    ];
    const blob = new Blob(
      ["\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "arvessa-inventory-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <div className="results-toolbar">
        <div className="actions">
          <select
            aria-label="Dự án báo cáo"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">Tất cả dự án</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Kỳ báo cáo giao dịch"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all">Toàn bộ kỳ demo</option>
            <option value="7">7 ngày gần nhất</option>
            <option value="30">30 ngày gần nhất</option>
          </select>
        </div>
        <Button onClick={exportCsv}>Xuất giỏ hàng CSV</Button>
      </div>
      <div className="metric-grid">
        {indicators.map(([label, n]) => (
          <div key={label} className="metric">
            <small>{label}</small>
            <strong style={{ fontSize: String(n).length > 10 ? 20 : 29 }}>
              {n}
            </strong>
            <span>Tính từ hồ sơ mô phỏng</span>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Tình trạng giỏ hàng</h2>
          </div>
          <div className="chart-bars">
            {[
              ["AVAILABLE", "Còn trống"],
              ["HELD", "Đang giữ"],
              ["RESERVED", "Đã cọc"],
              ["SOLD", "Đã bán"],
            ].map(([status, label]) => {
              const n = units.filter((p) => p.availability === status).length;
              return (
                <button
                  key={status}
                  style={{
                    height: `${Math.max(10, (n / Math.max(1, units.length)) * 100)}%`,
                  }}
                  onClick={() => notify(`${label}: ${n} căn trong bộ lọc.`)}
                  aria-label={`${label}: ${n} căn`}
                >
                  <span>{n}</span>
                  <small>{label}</small>
                </button>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>Chuyển đổi & hoạt động</h2>
          </div>
          <p>
            Lead → cơ hội:{" "}
            {data.leads.length
              ? Math.round(
                  (data.leads.filter((l) => l.status === "Đã chuyển").length /
                    data.leads.length) *
                    100,
                )
              : 0}
            %
          </p>
          <p>
            Lịch hẹn hoàn thành:{" "}
            {
              data.appointments.filter((a) => a.status === "Đã hoàn thành")
                .length
            }{" "}
            / {data.appointments.length}
          </p>
          <p>
            Cơ hội thành công:{" "}
            {data.opportunities.filter((o) => o.stage === "Thành công").length}{" "}
            / {data.opportunities.length}
          </p>
          <p className="fine-print">
            Chỉ số lead và lịch hẹn là toàn workspace; bộ lọc dự án/kỳ ở trên áp
            dụng giỏ hàng và giao dịch.
          </p>
        </section>
      </div>
      <DataTable
        rows={data.employees.filter((e) =>
          ["sales", "leader"].includes(e.role),
        )}
        searchText={(e) => `${e.name} ${e.team}`}
        columns={[
          { key: "name", label: "Nhân viên", render: (e) => e.name },
          { key: "team", label: "Nhóm", render: (e) => e.team },
          {
            key: "leads",
            label: "Leads phụ trách",
            render: (e) => data.leads.filter((l) => l.assignee === e.id).length,
          },
          {
            key: "opp",
            label: "Cơ hội",
            render: (e) =>
              data.opportunities.filter((o) => o.assignee === e.id).length,
          },
          {
            key: "won",
            label: "Thành công",
            render: (e) => (
              <Badge>
                {String(
                  data.opportunities.filter(
                    (o) => o.assignee === e.id && o.stage === "Thành công",
                  ).length,
                )}
              </Badge>
            ),
          },
        ]}
      />
    </>
  );
}
