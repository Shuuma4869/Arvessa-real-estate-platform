"use client";
import { useRef, useState } from "react";
import type { ResidenceLayout, ResidenceRoom } from "./residence-layout";
function Furniture({ r }: { r: ResidenceRoom }) {
  const cx = r.x + r.w / 2;
  if (r.kind === "bedroom")
    return (
      <g>
        <rect x={cx - 0.95} y={0.6} width={1.9} height={2.2} rx={0.1} />
        <path d={`M${cx - 0.95} 1.2h1.9 M${cx - 0.95} 2.1h1.9`} />
        <rect x={cx - 0.8} y={0.7} width={0.65} height={0.4} rx={0.06} />
        <rect x={cx + 0.15} y={0.7} width={0.65} height={0.4} rx={0.06} />
        <rect x={r.x + 0.2} y={2} width={0.55} height={1.6} />
      </g>
    );
  if (r.kind === "living")
    return (
      <g>
        <rect x={0.6} y={5.8} width={3.1} height={1.1} rx={0.2} />
        <path d="M.9 5.8v1.1 M1.85 5.8v1.1 M2.8 5.8v1.1" />
        <ellipse cx={2.2} cy={7.8} rx={0.8} ry={0.6} />
        <rect x={r.w - 1.3} y={8} width={0.85} height={0.85} rx={0.2} />
        <rect x={0.2} y={7.4} width={0.4} height={1.8} />
      </g>
    );
  if (r.kind === "kitchen")
    return (
      <g>
        <rect x={r.x + 0.1} y={5.3} width={r.w - 0.2} height={0.7} />
        <circle cx={r.x + 0.8} cy={5.65} r={0.18} />
        <circle cx={r.x + 1.3} cy={5.65} r={0.18} />
        <rect x={cx - 1.1} y={7.5} width={2.2} height={1.1} rx={0.2} />
        {[-0.7, 0.7].map((x) => (
          <g key={x}>
            <rect x={cx + x - 0.2} y={7} width={0.4} height={0.4} rx={0.1} />
            <rect x={cx + x - 0.2} y={8.7} width={0.4} height={0.4} rx={0.1} />
          </g>
        ))}
      </g>
    );
  if (r.kind === "bath")
    return (
      <g>
        <rect x={r.x + 0.15} y={r.z + 0.15} width={0.85} height={0.4} />
        <ellipse cx={r.x + 0.55} cy={r.z + 0.35} rx={0.3} ry={0.13} />
        <rect x={r.x + 1.35} y={r.z + 0.1} width={0.95} height={r.d - 0.2} />
        <ellipse cx={r.x + 0.5} cy={r.z + r.d - 0.6} rx={0.25} ry={0.32} />
      </g>
    );
  if (r.kind === "balcony")
    return (
      <g>
        <circle cx={2} cy={10.5} r={0.4} />
        <circle cx={1.1} cy={10.5} r={0.3} />
        <circle cx={2.9} cy={10.5} r={0.3} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={r.w - 1.5 + i * 0.35} cy={10.7} r={0.23} />
        ))}
      </g>
    );
  return null;
}
export function ResidencePlan({
  layout,
  selected,
  onSelect,
  mini = false,
}: {
  layout: ResidenceLayout;
  selected: string;
  onSelect: (id: string) => void;
  mini?: boolean;
}) {
  const [furnished, setFurnished] = useState(true);
  const [dimensions, setDimensions] = useState(false);
  const scale = Math.sqrt(layout.area / (layout.width * layout.depth));
  const metric = (length: number) =>
    (length * scale).toLocaleString("vi", { maximumFractionDigits: 2 }) + " m";
  const [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  return (
    <div className={`residence-plan ${mini ? "mini" : ""}`}>
      {!mini && (
        <div className="plan-tools">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            aria-label="Phóng to mặt bằng"
          >
            ＋
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            aria-label="Thu nhỏ mặt bằng"
          >
            −
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            Đặt lại
          </button>
          <button
            aria-pressed={furnished}
            onClick={() => setFurnished(!furnished)}
          >
            Nội thất
          </button>
          <button
            aria-pressed={dimensions}
            onClick={() => setDimensions(!dimensions)}
          >
            Kích thước
          </button>
          <span aria-label="Hướng Bắc">N ↑</span>
        </div>
      )}
      <svg
        viewBox={`-1 -1 ${layout.width + 2} ${layout.depth + 2}`}
        aria-label={`Mặt bằng ${layout.beds} phòng ngủ, ${layout.area} mét vuông`}
        onPointerDown={(e) => {
          if ((e.target as Element).closest('[role="button"]')) return;
          drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const ctm = e.currentTarget.getScreenCTM();
          if (drag.current && ctm)
            setPan({
              x: drag.current.px + (e.clientX - drag.current.x) / ctm.a,
              y: drag.current.py + (e.clientY - drag.current.y) / ctm.d,
            });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <g
          transform={`translate(${pan.x} ${pan.y}) translate(${layout.width / 2} ${layout.depth / 2}) scale(${zoom}) translate(${-layout.width / 2} ${-layout.depth / 2})`}
        >
          {layout.rooms.map((r) => (
            <g
              key={r.id}
              role="button"
              tabIndex={0}
              aria-label={`${r.name} · ${r.area} m²`}
              aria-pressed={selected === r.id}
              onClick={() => onSelect(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(r.id);
                }
              }}
              className={selected === r.id ? "selected" : ""}
            >
              <rect
                className="room-footprint"
                x={r.x}
                y={r.z}
                width={r.w}
                height={r.d}
              />
              {furnished && (
                <g className="plan-furniture">
                  <Furniture r={r} />
                </g>
              )}
              {!mini && (
                <text x={r.x + r.w / 2} y={r.z + r.d - 0.3} textAnchor="middle">
                  {r.name} · {r.area} m²
                </text>
              )}
            </g>
          ))}
          {layout.rooms
            .filter((r) => r.kind === "bedroom")
            .map((r) => (
              <g
                key={`door-${r.id}`}
                className="plan-doors"
                pointerEvents="none"
              >
                <path
                  d={`M${r.x + r.w / 2 - 0.475} 4h.95`}
                  stroke="#f2ead7"
                  strokeWidth=".15"
                />
                <path
                  d={`M${r.x + r.w / 2 - 0.475} 4v-.95a.95 .95 0 0 1 .95 .95`}
                  fill="none"
                  stroke="#57705a"
                  strokeWidth=".035"
                />
              </g>
            ))}
          {dimensions && !mini && (
            <g
              className="plan-dimensions"
              pointerEvents="none"
              aria-hidden="true"
            >
              <path
                d={`M0 -.38H${layout.width} M0 -.52v.28 M${layout.width} -.52v.28 M-.38 0V${layout.depth} M-.52 0h.28 M-.52 ${layout.depth}h.28`}
              />
              <text x={layout.width / 2} y={-0.5} textAnchor="middle">
                {metric(layout.width)}
              </text>
              <text
                transform={`translate(-.5 ${layout.depth / 2}) rotate(-90)`}
                textAnchor="middle"
              >
                {metric(layout.depth)}
              </text>
            </g>
          )}
          <path
            className="plan-outline"
            d={`M0 0H${layout.width}V${layout.depth}H0Z`}
          />
        </g>
      </svg>
      {!mini && (
        <p className="fine-print">
          Chọn phòng để khám phá · Kéo khoảng trống để dịch chuyển · Diện tích
          và kích thước theo mô hình minh họa.
        </p>
      )}
    </div>
  );
}
