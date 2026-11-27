"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Rotate3D, Sun, Moon, Grid2X2 } from "lucide-react";
import { useDemo } from "@/services/store";
import { Button, Field, Badge, LinkButton } from "@/components/ui";
import { compactMoney } from "@/domain/format";
import { sound } from "@/lib/sound";
import { Columns2, Heart } from "lucide-react";
import "../marketing/public-spatial.css";
const BuildingCanvas = dynamic(() => import("./building-canvas"), {
  ssr: false,
  loading: () => <div className="loading">Đang chuẩn bị mô hình 3D…</div>,
});
export default function Explorer() {
  const params = useSearchParams(),
    data = useDemo((s) => s.data);
  const [projectId, setProject] = useState(
      params.get("project") || "stillwater",
    ),
    [selected, setSelected] = useState(
      params.get("unit") || (params.get("tower") ? "" : "A0302"),
    ),
    [floor, setFloor] = useState(Number(params.get("floor")) || 0),
    [tower, setTower] = useState(params.get("tower") || ""),
    [cameraView, setCameraView] = useState("perspective"),
    [mode, setMode] = useState(params.get("mode") === "2d" ? "2d" : "3d"),
    [night, setNight] = useState(false),
    [available, setAvailable] = useState(params.get("available") === "1"),
    [detail, setDetail] = useState("auto"),
    [progress, setProgress] = useState(0),
    [fallback, setFallback] = useState(false);
  const project =
    data.projects.find((p) => p.id === projectId) || data.projects[0];
  const properties = useMemo(
    () => data.properties.filter((p) => p.projectId === project.id),
    [data.properties, project.id],
  );
  const p = properties.find((p) => p.id === selected);
  const updateLocation = (
    unit: string,
    nextTower = tower,
    nextFloor = floor,
    nextProject = project.id,
    onlyAvailable = available,
    nextMode = mode,
  ) => {
    const query = new URLSearchParams({ project: nextProject });
    if (nextTower) query.set("tower", nextTower);
    if (nextFloor) query.set("floor", String(nextFloor));
    if (unit) query.set("unit", unit);
    if (onlyAvailable) query.set("available", "1");
    if (nextMode === "2d") query.set("mode", "2d");
    window.history.replaceState(null, "", `/explorer?${query}`);
  };
  const selectUnit = (id: string) => {
    setSelected(id);
    updateLocation(id);
    sound("selection");
  };
  const selectTower = (value: string) => {
    setTower(value);
    const unit = p && (!value || p.tower === value) ? selected : "";
    setSelected(unit);
    updateLocation(unit, value);
  };
  const fall = useCallback(() => {
    setFallback(true);
    setMode("2d");
  }, []);
  const onProgress = useCallback((n: number) => setProgress(n), []);
  const shown = properties.filter(
    (p) =>
      (!floor || p.floor === floor) &&
      (!tower || p.tower === tower) &&
      (!available || p.availability === "AVAILABLE"),
  );
  return (
    <main id="main" className="explorer-page">
      <div className="container page-heading">
        <p className="eyebrow">ARVESSA / ARCHITECTURAL ATELIER</p>
        <h1>Kiến trúc, ở mọi góc nhìn.</h1>
        <p>
          Chọn một căn trực tiếp trên mô hình hoặc dùng bảng lựa chọn 2D. Hình
          học khớp số tháp, tầng và căn trong dữ liệu demo.
        </p>
      </div>
      <div className="explorer-layout">
        <div
          className="canvas-wrap"
          style={night ? { background: "#1a2c2c" } : undefined}
        >
          {mode === "3d" ? (
            <BuildingCanvas
              project={project}
              properties={properties}
              selected={selected}
              floor={floor}
              tower={tower}
              availableOnly={available}
              compact={detail === "auto" ? undefined : detail === "compact"}
              night={night}
              cameraView={cameraView}
              reducedMotion={data.preferences.reducedMotion}
              onTowerPick={selectTower}
              onPick={selectUnit}
              onFallback={fall}
              onProgress={onProgress}
            />
          ) : (
            <div
              style={{
                padding: "90px 25px 65px",
                height: "100%",
                overflow: "auto",
              }}
            >
              <p className="eyebrow">SƠ ĐỒ 2D · {shown.length} CĂN</p>
              <div className="inventory-grid">
                {shown.map((u) => (
                  <button
                    key={u.id}
                    className={`unit-tile ${selected === u.id ? "selected" : ""}`}
                    data-status={u.availability}
                    onClick={() => selectUnit(u.id)}
                  >
                    {u.id}
                    <span>
                      Tầng {u.floor} · {u.area} m²
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="canvas-toolbar">
            <Button
              className="secondary"
              onClick={() => {
                const next = mode === "3d" ? "2d" : "3d";
                setMode(next);
                setFallback(false);
                updateLocation(
                  selected,
                  tower,
                  floor,
                  project.id,
                  available,
                  next,
                );
              }}
            >
              {mode === "3d" ? <Grid2X2 size={15} /> : <Rotate3D size={15} />}
              Chế độ {mode === "3d" ? "2D" : "3D"}
            </Button>
            {mode === "3d" && (
              <Button className="secondary" onClick={() => setNight(!night)}>
                {night ? <Sun size={15} /> : <Moon size={15} />}{" "}
                {night ? "Ban ngày" : "Ban đêm"}
              </Button>
            )}
            {mode === "3d" && progress < 100 && (
              <span role="status" style={{ padding: 10 }}>
                Tải mô hình {progress}%
              </span>
            )}
            {mode === "3d" && (
              <div className="camera-presets" aria-label="Góc nhìn mô hình">
                {[
                  ["perspective", "Phối cảnh"],
                  ["front", "Mặt đứng"],
                  ["aerial", "Từ trên cao"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    aria-pressed={cameraView === value}
                    onClick={() => setCameraView(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="canvas-help">
            <span>
              {mode === "3d"
                ? "Kéo để xoay · Cuộn để zoom · Chuột phải để pan · Chạm để chọn"
                : "Bảng 2D · Điều khiển bằng Tab và Enter"}
            </span>
            <span>MÔ HÌNH DEMO</span>
          </div>
        </div>
        <aside className="explorer-panel">
          <div className="explorer-inventory-heading">
            <h2>{project.name}</h2>
            <p>
              {properties.length} căn · {project.towers.length} tháp
            </p>
          </div>
          <Field label="Dự án">
            <select
              aria-label="Dự án"
              value={project.id}
              onChange={(e) => {
                setProject(e.target.value);
                setFloor(0);
                setTower("");
                setSelected("");
                updateLocation("", "", 0, e.target.value);
              }}
            >
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tháp">
            <select
              aria-label="Tháp"
              value={tower}
              onChange={(e) => selectTower(e.target.value)}
            >
              <option value="">Tất cả tháp</option>
              {project.towers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Tầng">
            <select
              aria-label="Tầng"
              value={floor}
              onChange={(e) => {
                const value = Number(e.target.value);
                setFloor(value);
                const unit = p && (!value || p.floor === value) ? selected : "";
                setSelected(unit);
                updateLocation(unit, tower, value);
              }}
            >
              <option value="0">Tất cả tầng</option>
              {Array.from({ length: project.floors }, (_, i) => (
                <option value={i + 1} key={i}>
                  Tầng {i + 1}
                </option>
              ))}
            </select>
          </Field>
          <label className="fine-print">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => {
                const enabled = e.target.checked;
                const unit =
                  enabled && p?.availability !== "AVAILABLE" ? "" : selected;
                setSelected(unit);
                setAvailable(enabled);
                updateLocation(unit, tower, floor, project.id, enabled);
              }}
            />
            Chỉ căn còn trống
          </label>
          <Field label="Chọn căn bằng bàn phím">
            <select
              aria-label="Chọn căn bằng bàn phím"
              value={selected}
              onChange={(e) => selectUnit(e.target.value)}
            >
              <option value="">Chọn căn…</option>
              {shown.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.area} m²
                </option>
              ))}
            </select>
          </Field>
          {mode === "3d" && (
            <Field label="Chi tiết mô hình">
              <select
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              >
                <option value="auto">Tự động theo thiết bị</option>
                <option value="compact">Nhẹ · giảm chi tiết cảnh quan</option>
                <option value="standard">Đầy đủ</option>
              </select>
            </Field>
          )}
          {p ? (
            <>
              <hr />
              <p className="eyebrow">KHÔNG GIAN CỦA BẠN</p>
              <h2>{p.id}</h2>
              <Badge>{p.availability}</Badge>
              <p>
                {p.area} m² · {p.beds} phòng ngủ
                <br />
                Tầng {p.floor} · {p.direction}
                <br />
                Tầm nhìn {p.view.toLowerCase()}
              </p>
              <h3>{compactMoney(p.price)}</h3>
              <LinkButton href={`/properties/${p.id}`}>
                Khám phá căn {p.id}
              </LinkButton>
              <div className="explorer-unit-actions">
                <button
                  aria-pressed={data.favorites.includes(p.id)}
                  onClick={() =>
                    void useDemo.getState().run({ type: "favorite", id: p.id })
                  }
                >
                  <Heart size={15} /> Yêu thích
                </button>
                <button
                  aria-pressed={data.comparisons.includes(p.id)}
                  onClick={() =>
                    void useDemo
                      .getState()
                      .run({ type: "compare", id: p.id })
                      .catch((error) =>
                        useDemo.getState().notify(error.message),
                      )
                  }
                >
                  <Columns2 size={15} /> So sánh
                </button>
              </div>
            </>
          ) : (
            <p>Chọn một căn để xem thông tin.</p>
          )}
          {fallback && (
            <p role="status" className="info-box">
              Thiết bị không khởi tạo được WebGL. Bảng 2D vẫn hỗ trợ đầy đủ lựa
              chọn căn.
            </p>
          )}
          <p className="fine-print">
            Màu trạng thái: xanh — còn trống; vàng — đang giữ; xám — đã đặt
            cọc/bán. Mọi trạng thái đều có nhãn chữ.
          </p>
        </aside>
      </div>
    </main>
  );
}
