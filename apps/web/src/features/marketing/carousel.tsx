"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useDemo } from "@/services/store";
import { sound } from "@/lib/sound";
export function ImmersivePropertyCarousel() {
  const projects = useDemo((s) => s.data.projects).filter((p) => p.published);
  const featured = useDemo((s) => s.data.cms.featuredProject);
  projects.sort(
    (a, b) => Number(b.id === featured) - Number(a.id === featured),
  );
  const [index, setIndex] = useState(0);
  const start = useRef(0);
  const move = (dir: number) => {
    setIndex((i) => (i + dir + projects.length) % projects.length);
    sound("swipe");
  };
  return (
    <section
      className="immersive-carousel"
      aria-label="Bộ sưu tập dự án"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
      onPointerDown={(e) => {
        start.current = e.clientX;
      }}
      onPointerUp={(e) => {
        const diff = e.clientX - start.current;
        if (Math.abs(diff) > 50) move(diff < 0 ? 1 : -1);
      }}
    >
      <div className="carousel-stage">
        {projects.map((p, i) => {
          const offset = (i - index + projects.length) % projects.length;
          return (
            <article
              key={p.id}
              className={`carousel-slide ${offset === 0 ? "active" : offset === 1 ? "next" : "previous"}`}
              aria-hidden={offset !== 0}
            >
              <img
                src={p.image}
                alt={`Minh họa ${p.name}`}
                width="900"
                height="560"
                loading="lazy"
                draggable={false}
              />
              <div className="carousel-caption">
                <div>
                  <p className="eyebrow">{p.location}</p>
                  <h3>{p.name}</h3>
                </div>
                <Link
                  href={`/projects/${p.id}`}
                  tabIndex={offset === 0 ? 0 : -1}
                  aria-label={`Khám phá ${p.name}`}
                >
                  <ArrowUpRight />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="carousel-controls">
        <span aria-live="polite">
          0{index + 1} <span className="muted">/ 0{projects.length}</span>
        </span>
        <div className="carousel-dots">
          {projects.map((p, i) => (
            <button
              key={p.id}
              aria-label={`Dự án ${i + 1}: ${p.name}`}
              aria-current={i === index}
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
    </section>
  );
}
