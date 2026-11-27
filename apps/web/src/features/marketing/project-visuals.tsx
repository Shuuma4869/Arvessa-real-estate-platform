"use client";
import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDemo } from "@/services/store";
import Link from "next/link";
import { Project } from "@/domain/types";
import { ArtImage } from "@/components/art-image";
import { Modal, SectionTitle } from "@/components/ui";
import { projectGallery } from "@/lib/visual-assets";
import { compactMoney } from "@/domain/format";
import "./public-spatial.css";
const BuildingCanvas = dynamic(() => import("../spatial/building-canvas"), {
  ssr: false,
});
export function ProjectVisuals({ project }: { project: Project }) {
  const data = useDemo((s) => s.data);
  const properties = useMemo(
    () => data.properties.filter((p) => p.projectId === project.id),
    [data.properties, project.id],
  );
  const [started, setStarted] = useState(false),
    [selected, setSelected] = useState("");
  const fall = useCallback(() => setStarted(false), []);
  const progress = useCallback(() => {}, []);
  const [spot, setSpot] = useState(project.towers[0]);
  const [photo, setPhoto] = useState<number | null>(null);
  const [floor, setFloor] = useState(0);
  const [available, setAvailable] = useState(false);
  const [camera, setCamera] = useState("aerial");
  const [labels, setLabels] = useState(true);
  const [failed, setFailed] = useState(false);
  const active =
    spot === "garden" || project.towers.includes(spot)
      ? spot
      : project.towers[0];
  const images = projectGallery(project.id, project.image);
  const candidates = properties.filter(
    (unit) =>
      (active === "garden" || unit.tower === active) &&
      (!floor || unit.floor === floor) &&
      (!available || unit.availability === "AVAILABLE"),
  );
  const picked = candidates.find((unit) => unit.id === selected);
  const chooseSpot = (spot: string) => {
    setSpot(spot);
    setSelected("");
  };
  const handleFallback = useCallback(() => {
    fall();
    setFailed(true);
  }, [fall]);
  return (
    <section className="project-visuals" id="masterplan">
      <SectionTitle
        eyebrow="THE SITE / INTERACTIVE STUDY"
        title="Mỗi vị trí, một góc nhìn."
      />
      <div className="masterplan-layout">
        <div
          className={`masterplan district-stage ${!started && project.id === "stillwater" ? "district-still" : ""}`}
          aria-label="Sơ đồ tổng mặt bằng concept"
        >
          {started && (
            <BuildingCanvas
              project={project}
              properties={properties}
              selected={picked?.id || ""}
              floor={floor}
              tower={active === "garden" ? "" : active}
              availableOnly={available}
              night={false}
              district
              showLabels={labels}
              cameraView={camera}
              reducedMotion={data.preferences.reducedMotion}
              onPick={setSelected}
              onTowerPick={chooseSpot}
              onFallback={handleFallback}
              onProgress={progress}
            />
          )}
          {!started && (
            <button
              className="masterplan-start button"
              onClick={() => {
                setFailed(false);
                setStarted(true);
              }}
            >
              Khám phá tổng thể 3D
            </button>
          )}
          <span className="north-marker">N ↑</span>
          <div className="masterplan-water">MẶT NƯỚC / CẢNH QUAN</div>
          <div
            className={`masterplan-towers ${started ? "model-started" : ""}`}
          >
            {project.towers.map((tower) => (
              <button
                key={tower}
                className={`masterplan-tower ${active === tower ? "selected" : ""}`}
                onClick={() => chooseSpot(tower)}
                aria-pressed={active === tower}
                aria-label={`${started ? "Chọn" : "Khám phá"} tháp ${tower}`}
              >
                <span>{tower}</span>
                <small>{project.floors} tầng</small>
              </button>
            ))}
          </div>
          <button
            className="garden-hotspot"
            onClick={() => chooseSpot("garden")}
            aria-pressed={active === "garden"}
          >
            ＋ Sân vườn
          </button>
          <span className="site-entry">LỐI TIẾP CẬN ↑</span>
          {started && (
            <div className="district-camera">
              <select
                aria-label="Góc nhìn khu đất"
                value={camera}
                onChange={(event) => setCamera(event.target.value)}
              >
                <option value="aerial">Phối cảnh tổng thể</option>
                <option value="north">Hướng Bắc · nhìn từ trên</option>
                <option value="waterfront">Dọc bờ nước</option>
              </select>
              <button aria-pressed={labels} onClick={() => setLabels(!labels)}>
                Nhãn tháp
              </button>
              <button onClick={() => setStarted(false)}>Đóng 3D</button>
            </div>
          )}
        </div>
        <div className="masterplan-copy">
          <p className="eyebrow">{project.name}</p>
          <h3>
            {active === "garden"
              ? "Khoảng xanh kết nối."
              : `Tháp ${active}. Một góc nhìn riêng.`}
          </h3>
          <p>
            {active === "garden"
              ? "Khoảng sân chung kết nối các lối tiếp cận và mặt nước. Sơ đồ này là nghiên cứu tổ chức không gian."
              : `${project.floors} tầng · ${project.unitsPerFloor} căn mỗi tầng. Mở mô hình 3D để chọn tầng, xem vị trí và trạng thái từng căn.`}
          </p>
          <div className="district-filter">
            <label>
              Tầng
              <select
                value={floor}
                onChange={(e) => {
                  setFloor(Number(e.target.value));
                  setSelected("");
                }}
              >
                <option value={0}>Mọi tầng</option>
                {Array.from({ length: project.floors }, (_, n) => (
                  <option value={n + 1} key={n}>
                    Tầng {n + 1}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => {
                  setAvailable(e.target.checked);
                  setSelected("");
                }}
              />{" "}
              Chỉ căn còn trống
            </label>
          </div>
          <label className="district-unit">
            {candidates.length} căn phù hợp
            <select
              value={picked?.id || ""}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Xem một căn trên khu đất</option>
              {candidates.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.id} · {unit.area} m²
                </option>
              ))}
            </select>
          </label>
          {picked && (
            <div className="district-selected" aria-live="polite">
              <strong>{picked.id}</strong>
              <span>
                {picked.area} m² · {picked.beds} phòng ngủ ·{" "}
                {compactMoney(picked.price)}
              </span>
              <Link href={`/properties/${picked.id}`}>
                Xem căn {picked.id} ↗
              </Link>
            </div>
          )}
          {failed && (
            <p role="status">
              Thiết bị chưa mở được cảnh 3D. Bạn vẫn có thể chọn tháp, tầng và
              căn tại đây.
            </p>
          )}
          <Link
            className="underlined-link"
            href={`/explorer?project=${project.id}${active !== "garden" ? `&tower=${active}` : ""}${floor ? `&floor=${floor}` : ""}${picked ? `&unit=${picked.id}` : ""}${available ? "&available=1" : ""}`}
          >
            Mở mô hình tương tác ↗
          </Link>
          <p className="fine-print">
            Sơ đồ concept, không theo tỷ lệ địa chính. Vị trí và tiện ích chưa
            phải hồ sơ quy hoạch.
          </p>
        </div>
      </div>
      <div className={`project-gallery gallery-count-${images.length}`}>
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setPhoto(i)}
            aria-label={`Mở phối cảnh ${i + 1} của ${project.name}`}
          >
            <ArtImage
              src={src}
              alt={`Nghiên cứu kiến trúc ${project.name} — ảnh AI ${i + 1}`}
              width={1600}
              height={1000}
              loading="lazy"
            />
            <span>
              {
                [
                  "01 / ARCHITECTURE",
                  "02 / INTERIOR STUDY",
                  "03 / LIFE BY THE WATER",
                ][i]
              }{" "}
              ↗
            </span>
          </button>
        ))}
      </div>
      <p className="fine-print">
        Phối cảnh AI phục vụ nghiên cứu kiến trúc. Không mô tả hiện trạng hoặc
        tiêu chuẩn bàn giao của từng căn.
      </p>
      {photo !== null && (
        <Modal
          title={`Phối cảnh ${project.name}`}
          onClose={() => setPhoto(null)}
        >
          <ArtImage
            src={images[photo]}
            alt={`Phối cảnh AI ${project.name}`}
            width={1600}
            height={1000}
            sizes="90vw"
          />
          <p className="fine-print">Concept AI · Không phải ảnh hiện trạng</p>
        </Modal>
      )}
    </section>
  );
}
