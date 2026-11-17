"use client";
import { ArtImage } from "@/components/art-image";
import { propertyVisual } from "@/lib/visual-assets";
import Link from "next/link";
import {
  Heart,
  ArrowUpRight,
  Columns2,
  BedDouble,
  Maximize2,
} from "lucide-react";
import { Property } from "@/domain/types";
import { compactMoney } from "@/domain/format";
import { useDemo } from "@/services/store";
import { Badge } from "@/components/ui";
export function PropertyCard({
  property: p,
  onQuick,
}: {
  property: Property;
  onQuick?: (p: Property) => void;
}) {
  const { data, run } = useDemo();
  return (
    <article className="property-card">
      <div className="property-image">
        <Link href={`/properties/${p.id}`}>
          <ArtImage
            src={propertyVisual(p)}
            projectId={p.projectId}
            sizes="(max-width:700px) 90vw, 30vw"
            alt={`Minh họa kiến trúc ${data.projects.find((x) => x.id === p.projectId)?.name}`}
            width="640"
            height="400"
            loading="lazy"
          />
        </Link>
        <div className="image-badge">
          <Badge>{p.availability}</Badge>
        </div>
        <button
          className={`favorite-button ${data.favorites.includes(p.id) ? "selected" : ""}`}
          aria-label={`${data.favorites.includes(p.id) ? "Bỏ yêu thích" : "Yêu thích"} ${p.id}`}
          aria-pressed={data.favorites.includes(p.id)}
          onClick={() => void run({ type: "favorite", id: p.id })}
        >
          <Heart
            size={18}
            fill={data.favorites.includes(p.id) ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="property-meta">
        <span>
          {data.projects.find((x) => x.id === p.projectId)?.name} / {p.id}
        </span>
        <Link href={`/properties/${p.id}`} aria-label={`Xem căn ${p.id}`}>
          <ArrowUpRight size={20} />
        </Link>
      </div>
      <h3>
        <Link href={`/properties/${p.id}`}>{p.name}</Link>
      </h3>
      <div className="property-spec">
        <span>
          <BedDouble size={15} />
          {p.beds} phòng ngủ
        </span>
        <span>
          <Maximize2 size={14} />
          {p.area} m²
        </span>
        <span>Tầng {p.floor}</span>
      </div>
      <div className="property-bottom">
        <strong>{compactMoney(p.price)}</strong>
        <div className="actions">
          <button
            className="icon-button"
            title="So sánh"
            aria-label={`So sánh ${p.id}`}
            onClick={() =>
              void run({ type: "compare", id: p.id }).catch((e) =>
                useDemo.getState().notify(e.message),
              )
            }
          >
            <Columns2 size={17} />
          </button>
          {onQuick && (
            <button className="text-button" onClick={() => onQuick(p)}>
              Xem nhanh
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
