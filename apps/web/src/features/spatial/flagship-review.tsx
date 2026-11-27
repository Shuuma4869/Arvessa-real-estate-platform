"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDemo } from "@/services/store";
import { compactMoney } from "@/domain/format";
import { residenceLayout } from "./residence-layout";
import { ResidencePlan } from "./residence-plan";
import "./flagship-review.css";

const Model = dynamic(() => import("./flagship-canvas"), {
  ssr: false,
  loading: () => <p className="flagship-loading">Đang mở trình xem 3D…</p>,
});
const Panorama = dynamic(() => import("./panorama-canvas"), { ssr: false });
const photographs = {
  Stillwater: [
    ["Stillwater-day", "Ánh sáng ban ngày"],
    ["Stillwater-golden", "Giờ vàng"],
    ["Stillwater-aerial", "Toàn cảnh dự án"],
    ["Stillwater-night", "Ban đêm"],
    ["Stillwater-entrance", "Sảnh đón tháp A"],
    ["Stillwater-landscape", "Vườn nước"],
    ["Stillwater-facade", "Chi tiết mặt đứng"],
    ["Stillwater-showroom", "Sa bàn"],
  ],
  A0302: [
    ["A0302-dollhouse", "Dollhouse"],
    ["tour/A0302-living", "Phòng khách"],
    ["tour/A0302-kitchen", "Bếp"],
    ["tour/A0302-dining", "Bàn ăn"],
    ["tour/A0302-bedroom-1", "Phòng ngủ 1"],
    ["tour/A0302-bedroom-2", "Phòng ngủ 2"],
    ["tour/A0302-bath-1", "Phòng tắm 1"],
    ["tour/A0302-bath-2", "Phòng tắm 2"],
    ["tour/A0302-hall", "Sảnh"],
    ["tour/A0302-balcony", "Loggia"],
    ["tour/A0302-joinery", "Chi tiết vật liệu"],
  ],
};
export default function FlagshipReview() {
  const [scene, setScene] = useState<"Stillwater" | "A0302">("Stillwater");
  const [mode, setMode] = useState("photo"),
    [photo, setPhoto] = useState(0),
    [reset, setReset] = useState(0);
  const [unit, setUnit] = useState("A0302"),
    [room, setRoom] = useState("living");
  const [tower, setTower] = useState("A"),
    [floor, setFloor] = useState(3);
  const [view, setView] = useState<"perspective" | "aerial">("perspective");
  const [quality, setQuality] = useState<
    "auto" | "light" | "balanced" | "high"
  >("auto");
  const [error, setError] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const data = useDemo((s) => s.data);
  const property = data.properties.find((p) => p.id === unit)!;
  const layout = useMemo(() => residenceLayout(2, 107), []);
  const selectedRoom = layout.rooms.find((r) => r.id === room)!;
  const fallback = useCallback(() => {
    setError("Không mở được WebGL. Các ảnh render vẫn có thể xem bên dưới.");
    setMode("photo");
  }, []);
  const changeScene = (next: "Stillwater" | "A0302") => {
    setScene(next);
    setMode("photo");
    setPhoto(0);
    setError("");
  };
  const chooseUnit = (id: string) => {
    const p = data.properties.find((p) => p.id === id);
    if (!p) return;
    setUnit(id);
    setTower(p.tower);
    setFloor(p.floor);
  };
  const shots = photographs[scene];
  return (
    <main id="main" className="flagship-review">
      <header className="flagship-intro">
        <div>
          <p className="eyebrow">ARVESSA / SPATIAL ATELIER</p>
          <h1>Kiến trúc, gần hơn.</h1>
          <p>Architecture · Vision · Experience</p>
        </div>
        <p className="flagship-review-status">
          Bản thử nghiệm mỹ thuật <span>Chờ nghiệm thu hai cảnh flagship</span>
        </p>
      </header>
      <nav className="flagship-scene-tabs" aria-label="Chọn cảnh flagship">
        <button
          aria-pressed={scene === "Stillwater"}
          onClick={() => changeScene("Stillwater")}
        >
          <small>01 / EXTERIOR</small>The Stillwater
        </button>
        <button
          aria-pressed={scene === "A0302"}
          onClick={() => changeScene("A0302")}
        >
          <small>02 / INTERIOR</small>Residence A0302
        </button>
      </nav>
      <div className="flagship-workspace">
        <div className="flagship-stage" ref={panel}>
          <div
            className="flagship-toolbar"
            role="group"
            aria-label="Chế độ duyệt flagship"
          >
            {[
              ["photo", "Ảnh Cycles"],
              ["model", "Mô hình 3D"],
              ...(scene === "A0302"
                ? [
                    ["plan", "Mặt bằng"],
                    ["tour", "Tour căn hộ 360°"],
                  ]
                : []),
            ].map(([id, title]) => (
              <button
                key={id}
                aria-pressed={mode === id}
                onClick={() => {
                  setMode(id);
                  setError("");
                }}
              >
                {title}
              </button>
            ))}
            <button
              aria-label="Toàn màn hình"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else
                  void panel.current
                    ?.requestFullscreen()
                    .catch(() =>
                      setError(
                        "Trình duyệt không hỗ trợ toàn màn hình tại đây.",
                      ),
                    );
              }}
            >
              ⛶
            </button>
          </div>
          {mode === "photo" && (
            <div className="flagship-photograph">
              <Image
                key={shots[photo][0]}
                src={`/spatial-flagships/${shots[photo][0]}.webp`}
                alt={`${scene} — ${shots[photo][1]}, render từ cảnh Blender`}
                fill
                sizes="(max-width: 800px) 100vw, 75vw"
                priority={photo === 0}
                unoptimized
              />
              <span>OFFLINE / CYCLES · {shots[photo][1]}</span>
            </div>
          )}
          {mode === "model" && (
            <Model
              key={`${scene}-${quality}-${view}-${reset}`}
              sceneName={scene}
              selected={scene === "Stillwater" ? unit : room}
              onSelect={scene === "Stillwater" ? chooseUnit : setRoom}
              reset={reset}
              view={view}
              quality={quality === "auto" ? undefined : quality}
            />
          )}
          {mode === "plan" && (
            <div className="flagship-plan">
              <ResidencePlan
                layout={layout}
                selected={room}
                onSelect={setRoom}
              />
            </div>
          )}
          {mode === "tour" && (
            <div className="flagship-tour">
              <Panorama
                layout={layout}
                key={room}
                room={room}
                onRoom={setRoom}
                onFallback={fallback}
                reset={reset}
                apartmentTour
              />
              <span>360° / CYCLES · {selectedRoom.name} · A0302</span>
            </div>
          )}
          {error && <p role="alert">{error}</p>}
          <div className="flagship-view-controls">
            {mode === "model" && (
              <label>
                Vật liệu{" "}
                <select
                  aria-label="Chất lượng vật liệu"
                  value={quality}
                  onChange={(event) =>
                    setQuality(event.target.value as typeof quality)
                  }
                >
                  <option value="auto">Tự động theo thiết bị</option>
                  <option value="light">Nhẹ · 256 px</option>
                  <option value="balanced">Cân bằng · 512 px</option>
                  <option value="high">Chi tiết · 1024 px</option>
                </select>
              </label>
            )}
            {mode === "photo" ? (
              shots.map(([id, title], index) => (
                <button
                  key={id}
                  aria-label={`Xem ảnh ${title}`}
                  aria-pressed={photo === index}
                  onClick={() => setPhoto(index)}
                >
                  {title}
                </button>
              ))
            ) : (
              <>
                <button onClick={() => setReset((n) => n + 1)}>
                  Đặt lại góc nhìn
                </button>
                {mode === "model" && scene === "Stillwater" && (
                  <button
                    aria-pressed={view === "aerial"}
                    onClick={() =>
                      setView(view === "aerial" ? "perspective" : "aerial")
                    }
                  >
                    Góc nhìn aerial
                  </button>
                )}
                <span>
                  {mode === "tour"
                    ? "Kéo / chạm để nhìn quanh · +/− để zoom"
                    : "Chọn trực tiếp hoặc dùng danh sách bên cạnh"}
                </span>
              </>
            )}
          </div>
        </div>
        <aside className="flagship-detail">
          <p className="eyebrow">
            {scene === "Stillwater"
              ? "THẢO ĐIỀN / 48 RESIDENCES"
              : "THE STILLWATER / TOWER A"}
          </p>
          <h2>
            {scene === "Stillwater"
              ? "Một khoảng lặng bên dòng chảy."
              : "Không gian để thuộc về."}
          </h2>
          <p>
            {scene === "Stillwater"
              ? "Hai tháp, sáu tầng. Hiên sâu, đá tự nhiên và mặt nước tạo nên nhịp sống riêng."
              : "107 m² · Hai phòng ngủ · Hai phòng tắm. Gỗ sồi, đá sáng và lớp vải ấm trong một mặt bằng thống nhất."}
          </p>
          {scene === "Stillwater" ? (
            <>
              <div className="flagship-filters">
                <label>
                  Tháp
                  <select
                    aria-label="Tháp"
                    value={tower}
                    onChange={(e) => {
                      setTower(e.target.value);
                      const p = data.properties.find(
                        (p) =>
                          p.projectId === "stillwater" &&
                          p.tower === e.target.value &&
                          p.floor === floor,
                      );
                      if (p) setUnit(p.id);
                    }}
                  >
                    <option>A</option>
                    <option>B</option>
                  </select>
                </label>
                <label>
                  Tầng
                  <select
                    aria-label="Tầng"
                    value={floor}
                    onChange={(e) => {
                      const f = Number(e.target.value);
                      setFloor(f);
                      const p = data.properties.find(
                        (p) =>
                          p.projectId === "stillwater" &&
                          p.tower === tower &&
                          p.floor === f,
                      );
                      if (p) setUnit(p.id);
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div
                className="flagship-unit-list"
                aria-label="Chọn căn trong inventory"
              >
                {data.properties
                  .filter(
                    (p) =>
                      p.projectId === "stillwater" &&
                      p.tower === tower &&
                      p.floor === floor,
                  )
                  .map((p) => (
                    <button
                      key={p.id}
                      aria-pressed={unit === p.id}
                      onClick={() => chooseUnit(p.id)}
                    >
                      {p.id}
                      <small>
                        {p.area} m² · {p.beds} PN
                      </small>
                    </button>
                  ))}
              </div>
              <p className="flagship-selected" data-testid="flagship-selection">
                {property.id} <span>{compactMoney(property.price)}</span>
              </p>
              <Link className="flagship-cta" href={`/properties/${unit}`}>
                Khám phá căn {unit} ↗
              </Link>
              <Link
                href={`/explorer?project=stillwater&unit=${unit}&tower=${tower}&floor=${floor}`}
              >
                Mở inventory đầy đủ →
              </Link>
            </>
          ) : (
            <>
              <div className="flagship-room-list" aria-label="Chọn phòng A0302">
                {layout.rooms.map((r) => (
                  <button
                    key={r.id}
                    aria-pressed={room === r.id}
                    onClick={() => {
                      setRoom(r.id);
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              <p className="flagship-selected" data-testid="flagship-selection">
                {selectedRoom.name}
                <span>{selectedRoom.area} m²</span>
              </p>
              <Link className="flagship-cta" href="/properties/A0302">
                Xem hồ sơ căn A0302 ↗
              </Link>
              <Link href="/reserve/A0302">Đi tới quy trình giữ căn →</Link>
            </>
          )}
          <p className="flagship-note">
            Ảnh Cycles và mô hình web dùng cùng nguồn cảnh. Bản GLB được giảm
            chi tiết để tương tác; ánh sáng thời gian thực khác ảnh offline. Mặt
            bằng và diện tích là dữ liệu demo.
            {scene === "Stillwater" &&
              " Đường và công trình ngoài ranh dự án là bối cảnh giả định."}
          </p>
        </aside>
      </div>
      <footer className="flagship-provenance">
        <p>
          Hai cảnh đang được duyệt riêng. Chưa mở rộng sang các dự án hoặc căn
          hộ khác.
        </p>
        <p>
          Models, textures & HDRI:{" "}
          <a href="https://polyhaven.com/license">Poly Haven · CC0</a>. Đá mặt
          bàn:{" "}
          <a href="https://ambientcg.com/view?id=Marble014">ambientCG · CC0</a>.
          Sofa:{" "}
          <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/f0920f5b32d172a30efe3f9257e965918831e6ea/Models/GlamVelvetSofa">
            Eric Chadwick / Wayfair, LLC, 2021
          </a>{" "}
          · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
          . Sofa được đặt lại vị trí, tỷ lệ và tối ưu cho web. Không hàm ý bảo
          trợ thương hiệu.
        </p>
      </footer>
    </main>
  );
}
