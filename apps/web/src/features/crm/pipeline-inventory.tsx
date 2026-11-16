"use client";
import { ArtImage } from "@/components/art-image";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/services/store";
import { Opportunity } from "@/domain/types";
import { canWrite } from "@/domain/permissions";
import { money, compactMoney } from "@/domain/format";
import {
  Button,
  Field,
  Modal,
  Action,
  Badge,
  DataTable,
} from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
const stages = [
  "Mới",
  "Tư vấn",
  "Tham quan",
  "Đàm phán",
  "Thành công",
  "Không thành công",
];
export function Pipeline() {
  const { data, session, run, notify } = useDemo();
  const [create, setCreate] = useState(false),
    [list, setList] = useState(false),
    [reason, setReason] = useState(""),
    [selected, setSelected] = useState<Opportunity | null>(null);
  const writable = !!session && canWrite(session.role, "opportunities");
  const rows = data.opportunities.filter(
    (o) => session?.role !== "sales" || o.assignee === session.id,
  );
  const move = async (id: string, stage: string) => {
    try {
      await run({ type: "stage", id, stage, reason });
    } catch (e) {
      notify(e instanceof Error ? e.message : "Không thể đổi giai đoạn.");
    }
  };
  return (
    <>
      <div className="results-toolbar">
        <div className="actions">
          <Button className="secondary" onClick={() => setList(!list)}>
            {list ? "Xem Kanban" : "Xem danh sách"}
          </Button>
          <Field label="Lý do nếu chuyển Không thành công">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Khách thay đổi kế hoạch"
            />
          </Field>
        </div>
        {writable && (
          <Button onClick={() => setCreate(true)}>Tạo cơ hội</Button>
        )}
      </div>
      {list ? (
        <DataTable
          rows={rows}
          searchText={(o) => o.name}
          onSelect={setSelected}
          columns={[
            { key: "name", label: "Cơ hội", render: (o) => o.name },
            { key: "value", label: "Giá trị", render: (o) => money(o.amount) },
            {
              key: "stage",
              label: "Giai đoạn",
              render: (o) => <Badge>{o.stage}</Badge>,
            },
            { key: "next", label: "Bước tiếp", render: (o) => o.nextAction },
          ]}
        />
      ) : (
        <div className="kanban">
          {stages.map((stage) => (
            <section
              className="kanban-column"
              key={stage}
              onDragOver={(e) => {
                if (writable) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                void move(e.dataTransfer.getData("text/plain"), stage);
              }}
            >
              <h3>
                {stage}
                <span>{rows.filter((o) => o.stage === stage).length}</span>
              </h3>
              {rows
                .filter((o) => o.stage === stage)
                .map((o) => (
                  <article
                    className="deal-card"
                    key={o.id}
                    draggable={writable}
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", o.id)
                    }
                  >
                    <button
                      className="text-button"
                      onClick={() => setSelected(o)}
                    >
                      {o.name}
                    </button>
                    <p>
                      {o.propertyId} ·{" "}
                      {data.employees.find((e) => e.id === o.assignee)?.name}
                    </p>
                    <strong>{compactMoney(o.amount)}</strong>
                    <p>{o.nextAction}</p>
                    <select
                      aria-label={`Giai đoạn ${o.name}`}
                      value={o.stage}
                      disabled={!writable}
                      onChange={(e) => void move(o.id, e.target.value)}
                    >
                      {stages.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </article>
                ))}
            </section>
          ))}
        </div>
      )}
      <p className="fine-print">
        Kéo thẻ giữa các cột hoặc dùng danh sách giai đoạn bằng bàn phím. Chốt
        thành công cần cọc đã xác nhận.
      </p>
      {create && (
        <EntityForm
          entity="opportunities"
          title="Tạo cơ hội kinh doanh"
          onClose={() => setCreate(false)}
        />
      )}{" "}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <p>
            Khách hàng:{" "}
            {data.customers.find((c) => c.id === selected.customerId)?.name}
          </p>
          <p>
            Căn {selected.propertyId} · {money(selected.amount)}
          </p>
          <p>
            Dự kiến chốt: {selected.expectedDate || "Chưa xác định"}
            <br />
            Bước tiếp: {selected.nextAction}
            <br />
            Lý do mất cơ hội: {selected.lostReason || "Không có"}
          </p>
          <Link className="button" href={`/reserve/${selected.propertyId}`}>
            Yêu cầu giữ căn
          </Link>
        </Modal>
      )}
    </>
  );
}
export function Inventory() {
  const { data, session, run } = useDemo();
  const [project, setProject] = useState("stillwater"),
    [tower, setTower] = useState(""),
    [floor, setFloor] = useState(""),
    [matrix, setMatrix] = useState(true),
    [selected, setSelected] = useState(""),
    [price, setPrice] = useState(""),
    [reason, setReason] = useState(""),
    [state, setState] = useState("AVAILABLE");
  const rows = data.properties.filter(
    (p) =>
      p.projectId === project &&
      (!tower || p.tower === tower) &&
      (!floor || p.floor === Number(floor)),
  );
  const p = data.properties.find((x) => x.id === selected),
    pr = data.projects.find((p) => p.id === project)!;
  return (
    <>
      <div className="results-toolbar">
        <div className="actions">
          <select
            aria-label="Dự án giỏ hàng"
            value={project}
            onChange={(e) => {
              setProject(e.target.value);
              setTower("");
              setFloor("");
            }}
          >
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Tháp giỏ hàng"
            value={tower}
            onChange={(e) => setTower(e.target.value)}
          >
            <option value="">Mọi tháp</option>
            {pr.towers.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            aria-label="Tầng giỏ hàng"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            <option value="">Mọi tầng</option>
            {Array.from({ length: pr.floors }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>
        </div>
        <Button className="secondary" onClick={() => setMatrix(!matrix)}>
          {matrix ? "Dạng bảng" : "Ma trận căn"}
        </Button>
      </div>
      {matrix ? (
        <div className="panel">
          <div className="panel-header">
            <h2>
              {pr.name} · {rows.length} căn
            </h2>
            <Link href={`/explorer?project=${pr.id}`}>Xem 3D ↗</Link>
          </div>
          <div className="inventory-grid">
            {rows.map((p) => (
              <button
                className="unit-tile"
                data-status={p.availability}
                key={p.id}
                onClick={() => {
                  setSelected(p.id);
                  setPrice(String(p.price));
                }}
              >
                {p.id}
                <span>{compactMoney(p.price)}</span>
                <Badge>{p.availability}</Badge>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <DataTable
          rows={rows}
          searchText={(p) => `${p.id} ${p.name}`}
          onSelect={(p) => {
            setSelected(p.id);
            setPrice(String(p.price));
          }}
          columns={[
            { key: "id", label: "Căn", render: (p) => p.id },
            { key: "area", label: "Diện tích", render: (p) => `${p.area} m²` },
            { key: "price", label: "Giá", render: (p) => money(p.price) },
            {
              key: "status",
              label: "Tình trạng",
              render: (p) => <Badge>{p.availability}</Badge>,
            },
          ]}
        />
      )}{" "}
      {p && (
        <Modal title={`Hồ sơ căn ${p.id}`} onClose={() => setSelected("")}>
          <ArtImage
            src={p.image}
            projectId={p.projectId}
            alt={`Minh họa căn ${p.id}`}
            width="600"
            height="375"
          />
          <div className="spec-grid">
            <div>
              <small>Diện tích</small>
              {p.area} m²
            </div>
            <div>
              <small>Giá hiện tại</small>
              {money(p.price)}
            </div>
            <div>
              <small>Tình trạng</small>
              <Badge>{p.availability}</Badge>
            </div>
          </div>
          <div className="actions">
            <Link href={`/properties/${p.id}`} className="button secondary">
              Xem chi tiết
            </Link>
            <Link href={`/reserve/${p.id}`} className="button">
              Yêu cầu giữ căn
            </Link>
            <Action
              label="So sánh căn"
              action={() => run({ type: "compare", id: p.id })}
            />
          </div>
          {["sales", "leader", "manager", "admin", "platform"].includes(
            session?.role || "",
          ) && (
            <>
              <hr />
              <h3>Đề nghị thay đổi</h3>
              <div className="form-stack">
                <Field label="Giá đề nghị (VND)">
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Field>
                <Field label="Lý do thay đổi">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Field>
                <Action
                  label="Gửi yêu cầu đổi giá"
                  action={() =>
                    run({
                      type: "request",
                      kind: "price",
                      id: p.id,
                      reason,
                      value: price,
                    })
                  }
                />
                <Field label="Tình trạng đề nghị">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="AVAILABLE">Còn trống</option>
                    <option value="SOLD">Đã bán</option>
                  </select>
                </Field>
                <Action
                  label="Gửi yêu cầu đổi trạng thái"
                  action={() =>
                    run({
                      type: "request",
                      kind: "status",
                      id: p.id,
                      reason,
                      value: state,
                    })
                  }
                />
              </div>
            </>
          )}
          <hr />
          <h3>Lịch sử yêu cầu</h3>
          {data.approvals
            .filter((a) => a.recordId === p.id)
            .map((a) => (
              <p key={a.id}>
                {a.kind} · {a.reason} · <Badge>{a.status}</Badge>
              </p>
            ))}
        </Modal>
      )}
    </>
  );
}
