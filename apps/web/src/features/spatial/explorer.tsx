"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Rotate3D, Sun, Moon, Grid2X2 } from "lucide-react";
import { useDemo } from "@/services/store";
import { Button, Field, Badge, LinkButton } from "@/components/ui";
import { compactMoney } from "@/domain/format";
import { sound } from "@/lib/sound";
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
    [floor, setFloor] = useState(0),
    [tower, setTower] = useState(params.get("tower") || ""),
    [cameraView, setCameraView] = useState("perspective"),
    [mode, setMode] = useState("3d"),
    [night, setNight] = useState(false),
    [available, setAvailable] = useState(false),
    [progress, setProgress] = useState(0),
    [fallback, setFallback] = useState(false);
  const project =
    data.projects.find((p) => p.id === projectId) || data.projects[0];
  const properties = useMemo(
    () => data.properties.filter((p) => p.projectId === project.id),
    [data.properties, project.id],
  );
  const p = properties.find((p) => p.id === selected);
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
        <p className="eyebrow">
          SPATIAL EXPLORER / ORIGINAL PROCEDURAL ARCHITECTURE
        </p>
        <h1>
          Thay đổi góc nhìn.
          <br />
          Hiểu rõ không gian.
        </h1>
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
              night={night}
              cameraView={cameraView}
              reducedMotion={data.preferences.reducedMotion}
              onPick={(id) => {
                setSelected(id);
                sound("selection");
              }}
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
                    onClick={() => setSelected(u.id)}
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
              onClick={() => setMode(mode === "3d" ? "2d" : "3d")}
            >
              {mode === "3d" ? <Grid2X2 size={15} /> : <Rotate3D size={15} />}
              Chế độ {mode === "3d" ? "2D" : "3D"}
            </Button>
            <Button className="secondary" onClick={() => setNight(!night)}>
              {night ? <Sun size={15} /> : <Moon size={15} />}{" "}
              {night ? "Ban ngày" : "Ban đêm"}
            </Button>
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
          <Field label="Dự án">
            <select
              value={project.id}
              onChange={(e) => {
                setProject(e.target.value);
                setFloor(0);
                setTower("");
                setSelected("");
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
            <select value={tower} onChange={(e) => setTower(e.target.value)}>
              <option value="">Tất cả tháp</option>
              {project.towers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Tầng">
            <select
              value={floor}
              onChange={(e) => setFloor(Number(e.target.value))}
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
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Chỉ căn còn trống
          </label>
          <Field label="Chọn căn bằng bàn phím">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Chọn căn…</option>
              {shown.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.area} m²
                </option>
              ))}
            </select>
          </Field>
          {p ? (
            <>
              <hr />
              <p className="eyebrow">YOUR PERSPECTIVE</p>
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
