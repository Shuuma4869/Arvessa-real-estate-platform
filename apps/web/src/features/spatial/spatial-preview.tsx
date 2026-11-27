"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Rotate3D, ArrowUpRight } from "lucide-react";
import { useDemo } from "@/services/store";
const BuildingCanvas = dynamic(() => import("./building-canvas"), {
  ssr: false,
  loading: () => <p className="loading">Đang mở không gian…</p>,
});
export function SpatialPreview() {
  const data = useDemo((s) => s.data);
  const project = data.projects.find((p) => p.id === "stillwater")!;
  const properties = useMemo(
    () => data.properties.filter((p) => p.projectId === project.id),
    [data.properties, project.id],
  );
  const [started, setStarted] = useState(false),
    [selected, setSelected] = useState("A0302"),
    [fallback, setFallback] = useState(false);
  const onFallback = useCallback(() => setFallback(true), []);
  const onProgress = useCallback(() => {}, []);
  return (
    <div className="spatial-preview">
      {started && !fallback ? (
        <BuildingCanvas
          project={project}
          properties={properties}
          selected={selected}
          floor={0}
          tower=""
          availableOnly={false}
          night={false}
          cameraView="perspective"
          reducedMotion={data.preferences.reducedMotion}
          onPick={setSelected}
          onFallback={onFallback}
          onProgress={onProgress}
        />
      ) : (
        <div className="spatial-start">
          <span className="eyebrow">THE STILLWATER / ARCHITECTURAL MODEL</span>
          <Rotate3D size={64} strokeWidth={0.8} />
          <h3>
            Đổi góc nhìn.
            <br />
            Khám phá từng không gian.
          </h3>
          {fallback ? (
            <Link
              className="button"
              href="/explorer?project=stillwater&mode=2d"
            >
              Mở bảng lựa chọn 2D
            </Link>
          ) : (
            <button className="button" onClick={() => setStarted(true)}>
              Khởi động mô hình 3D
            </button>
          )}
        </div>
      )}
      {started && !fallback && (
        <div className="preview-selection">
          <span>{selected} · kéo để xoay</span>
          <Link href={`/explorer?project=stillwater&unit=${selected}`}>
            Mở showroom <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
