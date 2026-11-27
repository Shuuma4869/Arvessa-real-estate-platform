"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Property } from "@/domain/types";
import { useDemo } from "@/services/store";
import { residenceLayout } from "./residence-layout";
import "./flagship-review.css";
import { ResidencePlan } from "./residence-plan";
const ApartmentModel = dynamic(() => import("./flagship-canvas"), {
  ssr: false,
});
const Dollhouse = dynamic(() => import("./residence-canvas"), {
  ssr: false,
  loading: () => <p className="loading">Đang mở mô hình nội thất…</p>,
});
const Panorama = dynamic(() => import("./panorama-canvas"), {
  ssr: false,
  loading: () => <p className="loading">Đang mở tour 360°…</p>,
});
const archetypeRooms = ["living", "kitchen", "bedroom-1", "balcony"];
// A continuous walk. Returning from a bedroom or wet room goes through its door.
const apartmentWalk = [
  "living",
  "kitchen",
  "living",
  "hall",
  "bedroom-1",
  "hall",
  "bedroom-2",
  "bath-1",
  "bedroom-2",
  "hall",
  "bath-2",
  "hall",
  "living",
  "balcony",
];
export function ResidenceExperience({ property: p }: { property: Property }) {
  const layout = useMemo(
    () => residenceLayout(p.beds, p.area),
    [p.beds, p.area],
  );
  const apartmentTour = p.id === "A0302";
  const tourIds = apartmentTour ? apartmentWalk : archetypeRooms;
  const walkPosition = useRef(0);
  const [mode, setMode] = useState("plan"),
    [room, setRoom] = useState("living"),
    [reset, setReset] = useState(0),
    [error, setError] = useState(false);
  const shell = useRef<HTMLElement>(null);
  const reduced = useDemo((s) => s.data.preferences.reducedMotion);
  const fallback = useCallback(() => {
    setError(true);
    setMode("plan");
  }, []);
  const selected = layout.rooms.find((r) => r.id === room) || layout.rooms[0];
  const choose = (id: string) => {
    if (tourIds[walkPosition.current] !== id)
      walkPosition.current = Math.max(0, tourIds.indexOf(id));
    setRoom(id);
    if (mode === "tour" && !tourIds.includes(id)) setMode("dollhouse");
  };
  const step = (offset: number) => {
    walkPosition.current =
      (walkPosition.current + offset + tourIds.length) % tourIds.length;
    choose(tourIds[walkPosition.current]);
  };
  return (
    <section
      className="residence-experience"
      ref={shell}
      aria-label={`Khám phá không gian căn ${p.id}`}
    >
      <div className="residence-heading">
        <div>
          <p className="eyebrow">THE ART OF LIVING / {p.id}</p>
          <h2>Không gian để thuộc về.</h2>
        </div>
        <div
          className="residence-tabs"
          role="group"
          aria-label="Chế độ khám phá căn hộ"
        >
          {[
            ["plan", "Mặt bằng 2D"],
            ["dollhouse", "Dollhouse 3D"],
            ["tour", "Tour 360°"],
          ].map(([id, name]) => (
            <button
              key={id}
              aria-pressed={mode === id}
              onClick={() => {
                if (id === "tour" && !tourIds.includes(room)) {
                  setRoom("living");
                  walkPosition.current = 0;
                }
                setMode(id);
                setError(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className={`residence-stage mode-${mode}`}>
        <aside className="residence-info">
          <p className="eyebrow">RESIDENCE</p>
          <strong className="residence-number">{p.id}</strong>
          <p>
            {p.area} m²
            <br />
            {p.beds} phòng ngủ · {p.baths} phòng tắm
            <br />
            Tháp {p.tower} · Tầng {p.floor}
          </p>
          <div className="residence-room-info" aria-live="polite">
            <small>ĐANG KHÁM PHÁ</small>
            <h3>{selected.name}</h3>
            <p>{selected.area} m² / phân bổ minh họa</p>
          </div>
          <div className="room-navigation" aria-label="Danh sách phòng">
            {layout.rooms.map((r) => (
              <button
                key={r.id}
                aria-pressed={room === r.id}
                onClick={() => choose(r.id)}
              >
                {r.name}
                <span>↗</span>
              </button>
            ))}
          </div>
        </aside>
        <div className="residence-view">
          {mode === "plan" ? (
            <ResidencePlan layout={layout} selected={room} onSelect={choose} />
          ) : mode === "dollhouse" && apartmentTour ? (
            <ApartmentModel
              sceneName="A0302"
              selected={room}
              onSelect={choose}
              onFallback={fallback}
              reset={reset}
              view="perspective"
            />
          ) : mode === "dollhouse" ? (
            <Dollhouse
              layout={layout}
              selected={room}
              onSelect={choose}
              onFallback={fallback}
              reset={reset}
              reducedMotion={reduced}
            />
          ) : (
            <Panorama
              key={`${layout.beds}-${room}-${reset}`}
              layout={layout}
              room={room}
              apartmentTour={apartmentTour}
              onRoom={choose}
              onFallback={fallback}
              reset={reset}
            />
          )}
          {mode !== "plan" && (
            <div className="residence-controls">
              <button onClick={() => setReset((n) => n + 1)}>
                Đặt lại góc nhìn
              </button>
              <button
                onClick={() => {
                  if (document.fullscreenElement)
                    void document.exitFullscreen();
                  else void shell.current?.requestFullscreen().catch(() => {});
                }}
              >
                Toàn màn hình
              </button>
              {mode === "tour" && (
                <>
                  <button aria-label="Phòng trước" onClick={() => step(-1)}>
                    ←
                  </button>
                  <button aria-label="Phòng tiếp theo" onClick={() => step(1)}>
                    →
                  </button>
                </>
              )}
            </div>
          )}
          {mode !== "plan" && (
            <div className="residence-minimap">
              <ResidencePlan
                layout={layout}
                selected={room}
                onSelect={choose}
                mini
              />
            </div>
          )}
        </div>
      </div>
      {error && (
        <p role="status" className="info-box">
          Không tải được không gian 3D trên thiết bị này. Mặt bằng 2D vẫn hỗ trợ
          chọn và xem từng phòng.
        </p>
      )}
      <p className="fine-print">
        {apartmentTour && mode === "tour"
          ? "Tour được render từ cảnh Blender của căn A0302."
          : `Nghiên cứu nội thất theo loại căn ${layout.beds} phòng ngủ.`}{" "}
        Đây là nghiên cứu bố trí, không phải bản vẽ thi công hay cam kết bàn
        giao.{" "}
        {mode === "tour"
          ? "Kéo / vuốt để nhìn quanh · Cuộn / chụm để zoom · Chọn điểm chuyển phòng."
          : mode === "dollhouse"
            ? "Kéo để xoay · Cuộn để zoom · Chọn phòng để đổi góc nhìn."
            : ""}
      </p>
    </section>
  );
}
