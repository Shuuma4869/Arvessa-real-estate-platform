"use client";
import { ArtImage } from "@/components/art-image";
import { useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Columns2,
} from "lucide-react";
import { useDemo } from "@/services/store";
import { compactMoney } from "@/domain/format";
import { propertyVisual, resolveVisual } from "@/lib/visual-assets";
import { sound } from "@/lib/sound";
export function ImmersivePropertyCarousel() {
  const data = useDemo((s) => s.data);
  const projects = data.projects
    .filter((p) => p.published)
    .sort(
      (a, b) =>
        Number(b.id === data.cms.featuredProject) -
        Number(a.id === data.cms.featuredProject),
    );
  const cards = [
    ...projects.map((p, i) => ({
      id: p.id,
      unit: false,
      name: p.name,
      kicker: p.location,
      image: resolveVisual(p.image, p.id),
      href: `/projects/${p.id}`,
      label: `Dự án ${i + 1}: ${p.name}`,
      spec: `${p.towers.length} tháp · ${p.floors} tầng · Bộ sưu tập dự án`,
      price: "Khám phá địa chỉ",
      cta: `Khám phá ${p.name}`,
    })),
    ...data.properties
      .filter(
        (p) =>
          ["A0301", "A0302"].includes(p.id) &&
          projects.some((project) => project.id === p.projectId),
      )
      .map((p) => ({
        id: p.id,
        unit: true,
        name: p.beds === 1 ? "The Garden Suite" : "The Lake Residence",
        kicker: `THE STILLWATER / ${p.id}`,
        image: propertyVisual(p),
        href: `/properties/${p.id}`,
        label: `Căn ${p.id}`,
        spec: `${p.beds} phòng ngủ · ${p.area} m² · Tầng ${p.floor}`,
        price: `${compactMoney(p.price)} · giá demo`,
        cta: `Khám phá căn ${p.id}`,
      })),
  ];
  const [index, setIndex] = useState(0),
    [drag, setDrag] = useState(0),
    [dragging, setDragging] = useState(false);
  const pointer = useRef<{
    x: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  const moved = useRef(false);
  const current = index % Math.max(cards.length, 1);
  const move = (step: number) => {
    setIndex((i) => (i + step + cards.length * 2) % cards.length);
    sound("swipe");
  };
  if (!cards.length) return null;
  return (
    <section
      className={`immersive-carousel flagship-coverflow ${dragging ? "dragging" : ""}`}
      aria-label="Bộ sưu tập dự án"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          move(e.key === "ArrowRight" ? 1 : -1);
        }
        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          setIndex(e.key === "Home" ? 0 : cards.length - 1);
        }
      }}
    >
      <div
        aria-hidden="true"
        className="collection-atmosphere"
        style={{
          backgroundImage: `url("${cards[current].image.replace("-1600.webp", "-480.webp")}")`,
        }}
      />
      <div
        className="coverflow-stage"
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          }
        }}
        onPointerDown={(e) => {
          moved.current = false;
          if ((e.target as HTMLElement).closest("a,button")) return;
          pointer.current = {
            x: e.clientX,
            lastX: e.clientX,
            lastTime: performance.now(),
            velocity: 0,
          };
          moved.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const p = pointer.current;
          if (!p) return;
          const now = performance.now();
          p.velocity = (e.clientX - p.lastX) / Math.max(1, now - p.lastTime);
          p.lastX = e.clientX;
          p.lastTime = now;
          const dx = e.clientX - p.x;
          if (Math.abs(dx) > 8) moved.current = true;
          setDrag(Math.max(-600, Math.min(600, dx)));
        }}
        onPointerUp={(e) => {
          const p = pointer.current;
          if (!p) return;
          const dx = e.clientX - p.x;
          const velocity =
            performance.now() - p.lastTime > 100 ? 0 : p.velocity;
          const projected = dx + velocity * 140;
          if (Math.abs(projected) > 55)
            move(
              -Math.sign(projected) *
                Math.min(2, Math.max(1, Math.round(Math.abs(projected) / 280))),
            );
          pointer.current = null;
          setDragging(false);
          setDrag(0);
        }}
        onPointerCancel={() => {
          pointer.current = null;
          setDragging(false);
          setDrag(0);
        }}
      >
        {cards.map((card, i) => {
          let offset = (i - current + cards.length) % cards.length;
          if (offset > cards.length / 2) offset -= cards.length;
          const pos = offset + drag / 330;
          return (
            <article
              key={card.id}
              className={`coverflow-card ${offset === 0 ? "active" : ""}`}
              aria-hidden={offset !== 0}
              style={
                {
                  "--offset": pos,
                  "--distance": Math.abs(pos),
                  zIndex: 20 - Math.round(Math.abs(pos) * 4),
                } as CSSProperties
              }
            >
              <div className="coverflow-image">
                <ArtImage
                  src={card.image}
                  sizes="(max-width:700px) 78vw, 430px"
                  alt={`Concept ${card.name}`}
                  width={800}
                  height={600}
                  loading="lazy"
                  draggable={false}
                />
                {card.unit && offset === 0 && (
                  <div className="coverflow-actions">
                    <button
                      aria-label={`Yêu thích ${card.id}`}
                      aria-pressed={data.favorites.includes(card.id)}
                      onClick={() =>
                        void useDemo
                          .getState()
                          .run({ type: "favorite", id: card.id })
                      }
                    >
                      <Heart size={17} />
                    </button>
                    <button
                      aria-label={`So sánh ${card.id}`}
                      aria-pressed={data.comparisons.includes(card.id)}
                      onClick={() =>
                        void useDemo
                          .getState()
                          .run({ type: "compare", id: card.id })
                          .catch((error) =>
                            useDemo.getState().notify(error.message),
                          )
                      }
                    >
                      <Columns2 size={17} />
                    </button>
                  </div>
                )}
              </div>
              <div className="coverflow-content">
                <p className="eyebrow">{card.kicker}</p>
                <h3>{card.name}</h3>
                <p>{card.spec}</p>
                <strong>{card.price}</strong>
                <Link
                  href={card.href}
                  tabIndex={offset === 0 ? 0 : -1}
                  aria-label={card.cta}
                >
                  Khám phá <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="carousel-controls">
        <span aria-live="polite">
          0{current + 1} <span>/ 0{cards.length}</span>
        </span>
        <div className="carousel-dots">
          {cards.map((card, i) => (
            <button
              key={card.id}
              aria-label={card.label}
              aria-current={i === current}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="actions">
          <button
            className="circle-button"
            aria-label="Dự án trước"
            onClick={() => move(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="circle-button"
            aria-label="Dự án sau"
            onClick={() => move(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <p className="coverflow-hint">
        Kéo hoặc dùng phím ← → để xem địa chỉ kế tiếp.
      </p>
    </section>
  );
}
