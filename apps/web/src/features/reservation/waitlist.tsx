"use client";
import { useState } from "react";
import { useDemo } from "@/services/store";
import { Action, DataTable, Field } from "@/components/ui";
export function WaitlistPanel() {
  const { data, session, run } = useDemo();
  const [property, setProperty] = useState("A0302"),
    [customer, setCustomer] = useState("buyer-demo");
  const rows = data.waitlist.filter(
    (w) => session?.role !== "buyer" || w.customerId === session.id,
  );
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Danh sách chờ & liên hệ lại</h2>
      </div>
      <div className="form-grid">
        <Field label="Căn muốn theo dõi">
          <select
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          >
            {data.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>
        </Field>
        {session?.role !== "buyer" && (
          <Field label="Khách hàng chờ">
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <div className="form-actions">
        <Action
          label="Thêm vào danh sách chờ"
          action={() =>
            run({
              type: "waitlist",
              propertyId: property,
              customerId: session?.role === "buyer" ? session.id : customer,
            })
          }
        />
      </div>
      <p className="fine-print">
        Danh sách chờ không khóa căn và không tự động gửi thông báo ngoài hệ
        thống.
      </p>
      <DataTable
        rows={rows}
        searchText={(w) => `${w.propertyId} ${w.status}`}
        columns={[
          { key: "unit", label: "Căn", render: (w) => w.propertyId },
          {
            key: "customer",
            label: "Khách hàng",
            render: (w) =>
              data.customers.find((c) => c.id === w.customerId)?.name,
          },
          {
            key: "status",
            label: "Theo dõi",
            render: (w) =>
              w.status === "WAITING" ? "Đang chờ" : "Đã liên hệ demo",
          },
          {
            key: "action",
            label: "Thao tác",
            render: (w) =>
              session?.role !== "buyer" && w.status === "WAITING" ? (
                <Action
                  label="Đánh dấu đã liên hệ"
                  action={() =>
                    run({
                      type: "waitlist",
                      propertyId: w.propertyId,
                      customerId: w.customerId,
                      contacted: true,
                    })
                  }
                />
              ) : (
                <span>Đã ghi nhận</span>
              ),
          },
        ]}
      />
    </section>
  );
}
