"use client";
import { ArtImage } from "@/components/art-image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Grid2X2,
  List,
  SlidersHorizontal,
  Map,
  ArrowRight,
} from "lucide-react";
import { useDemo } from "@/services/store";
import { Property } from "@/domain/types";
import { filterProperties } from "@/domain/discovery";
import { money } from "@/domain/format";
import { PropertyCard } from "./property-card";
import {
  Button,
  Empty,
  Field,
  Modal,
  LinkButton,
  Action,
  Badge,
} from "@/components/ui";
export default function Discovery() {
  const { data, run } = useDemo(),
    router = useRouter(),
    params = useSearchParams();
  const [view, setView] = useState("grid"),
    [mobile, setMobile] = useState(false),
    [count, setCount] = useState(8),
    [quick, setQuick] = useState<Property | null>(null),
    [save, setSave] = useState(false),
    [name, setName] = useState(""),
    [error, setError] = useState(false);
  const q = new URLSearchParams(params.toString());
  const filtered = filterProperties(data.properties, q);
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/discover?${next}`, { scroll: false });
    setCount(8);
  };
  const select = (
    label: string,
    key: string,
    options: string[] | { value: string; label: string }[],
  ) => (
    <Field label={label}>
      <select
        value={params.get(key) || ""}
        onChange={(e) => change(key, e.target.value)}
      >
        <option value="">Tất cả</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </Field>
  );
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">CURATED RESIDENCES / BỘ SƯU TẬP</p>
        <h1>
          Không gian phù hợp.
          <br />
          Lựa chọn có cơ sở.
        </h1>
        <p>
          Tìm theo cách bạn muốn sống. Mọi giá và tình trạng bên dưới là dữ liệu
          trình diễn.
        </p>
      </div>
      <div className="discovery-layout">
        <aside
          className={`filter-panel ${mobile ? "open" : ""}`}
          aria-label="Bộ lọc bất động sản"
        >
          <div className="actions">
            <h3>Bộ lọc tìm kiếm</h3>
            <button
              className="text-button"
              onClick={() => router.replace("/discover", { scroll: false })}
            >
              Đặt lại
            </button>
          </div>
          <Field label="Tên hoặc mã căn">
            <input
              value={params.get("q") || ""}
              onChange={(e) => change("q", e.target.value)}
              placeholder="Ví dụ A0302"
            />
          </Field>
          {select(
            "Dự án / Địa điểm",
            "projectId",
            data.projects.map((p) => ({
              value: p.id,
              label: `${p.name} · ${p.location.split(" · ")[1]}`,
            })),
          )}
          {select("Loại hình", "type", ["Căn hộ", "Penthouse"])}
          <div className="range-fields">
            <Field label="Giá từ (tỷ)">
              <input
                type="number"
                min="0"
                value={params.get("minPrice") || ""}
                onChange={(e) => change("minPrice", e.target.value)}
              />
            </Field>
            <Field label="Giá đến (tỷ)">
              <input
                type="number"
                min="0"
                value={params.get("maxPrice") || ""}
                onChange={(e) => change("maxPrice", e.target.value)}
              />
            </Field>
          </div>
          <div className="range-fields">
            <Field label="Diện tích từ (m²)">
              <input
                type="number"
                min="0"
                value={params.get("minArea") || ""}
                onChange={(e) => change("minArea", e.target.value)}
              />
            </Field>
            <Field label="Diện tích đến (m²)">
              <input
                type="number"
                min="0"
                value={params.get("maxArea") || ""}
                onChange={(e) => change("maxArea", e.target.value)}
              />
            </Field>
          </div>
          {select("Phòng ngủ", "beds", ["1", "2", "3"])}
          {select("Phòng tắm", "baths", ["1", "2"])}
          {select("Tầng", "floor", ["1", "2", "3", "4", "5", "6"])}
          {select("Hướng", "direction", ["Đông Nam", "Tây Bắc"])}
          {select("Tầm nhìn", "view", ["Sông", "Vườn"])}
          {select("Tình trạng", "availability", [
            { value: "AVAILABLE", label: "Còn trống" },
            { value: "HELD", label: "Đang giữ" },
            { value: "RESERVED", label: "Đã đặt cọc" },
            { value: "SOLD", label: "Đã bán" },
          ])}
          <Button className="secondary" onClick={() => setSave(true)}>
            Lưu tìm kiếm
          </Button>
        </aside>
        <section className="discovery-results">
          <div className="results-toolbar">
            <p>
              <strong>{filtered.length}</strong> không gian được tìm thấy
            </p>
            <Button
              className="secondary filter-mobile-button"
              onClick={() => setMobile(!mobile)}
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
            </Button>
            <select
              aria-label="Sắp xếp bất động sản"
              value={params.get("sort") || "price-asc"}
              onChange={(e) => change("sort", e.target.value)}
            >
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="area">Diện tích lớn nhất</option>
            </select>
            <div className="actions">
              {[
                [Grid2X2, "grid", "Dạng lưới"],
                [List, "list", "Dạng danh sách"],
                [Map, "map", "Sơ đồ vị trí"],
              ].map(([Icon, value, label]) => {
                const I = Icon as typeof Grid2X2;
                return (
                  <button
                    key={String(value)}
                    className="icon-button"
                    aria-label={String(label)}
                    aria-pressed={view === value}
                    onClick={() => setView(String(value))}
                  >
                    <I size={17} />
                  </button>
                );
              })}
            </div>
          </div>
          {error ? (
            <Empty title="Chưa tải được danh sách">
              <Button onClick={() => setError(false)}>Thử lại</Button>
            </Empty>
          ) : !filtered.length ? (
            <Empty title="Chưa tìm thấy căn phù hợp">
              Mở rộng ngân sách hoặc bỏ bớt bộ lọc để xem thêm lựa chọn.
            </Empty>
          ) : view === "map" ? (
            <div className="panel">
              <p className="eyebrow">
                SƠ ĐỒ VỊ TRÍ MINH HỌA · KHÔNG PHẢI BẢN ĐỒ ĐỊA LÝ
              </p>
              <div className="inventory-grid">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    className="unit-tile"
                    data-status={p.availability}
                    onClick={() => setQuick(p)}
                  >
                    {p.id}
                    <span>
                      {p.area} m² · Tầng {p.floor}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={view === "grid" ? "property-grid" : "list-view"}>
                {filtered.slice(0, count).map((p) => (
                  <PropertyCard key={p.id} property={p} onQuick={setQuick} />
                ))}
              </div>
              {count < filtered.length && (
                <div className="form-actions">
                  <Button
                    className="secondary"
                    onClick={() => setCount(count + 8)}
                  >
                    Xem thêm 8 căn <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
          <details className="fine-print" style={{ marginTop: 35 }}>
            <summary>Công cụ kiểm tra demo</summary>
            <button className="text-button" onClick={() => setError(true)}>
              Mô phỏng lỗi tải danh sách
            </button>
          </details>
        </section>
      </div>
      {data.comparisons.length > 0 && (
        <div className="compare-bar">
          <span>{data.comparisons.length} căn đang so sánh</span>
          <Link className="button" href="/compare">
            Mở so sánh
          </Link>
        </div>
      )}
      {quick && (
        <Modal title={quick.name} onClose={() => setQuick(null)}>
          <ArtImage
            src={quick.image}
            projectId={quick.projectId}
            alt={`Minh họa ${quick.id}`}
            width="600"
            height="375"
          />
          <p style={{ marginTop: 20 }}>
            <Badge>{quick.availability}</Badge> · {quick.area} m² · {quick.beds}{" "}
            phòng ngủ
          </p>
          <h3>{money(quick.price)}</h3>
          <LinkButton href={`/properties/${quick.id}`}>
            Xem chi tiết căn
          </LinkButton>
        </Modal>
      )}
      {save && (
        <Modal title="Lưu bộ lọc tìm kiếm" onClose={() => setSave(false)}>
          <Field label="Tên bộ lọc">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Căn 2 phòng ngủ bên sông"
            />
          </Field>
          <div className="form-actions">
            <Action
              label="Lưu tìm kiếm"
              action={async () => {
                await run({ type: "search", name, query: q.toString() });
                setSave(false);
              }}
            />
          </div>
        </Modal>
      )}
    </main>
  );
}
