import Link from "next/link";
import type { Property } from "@/domain/types";
import { propertyVisual } from "@/lib/visual-assets";
import { ArtImage } from "./art-image";
export function PropertyPreview({ property: p }: { property: Property }) {
  return (
    <Link
      className="property-preview"
      href={`/properties/${p.id}`}
      aria-label={`Khám phá không gian căn ${p.id}`}
    >
      <ArtImage
        src={propertyVisual(p)}
        alt=""
        width={160}
        height={100}
        sizes="100px"
        loading="lazy"
      />
      <span>
        <strong>{p.id}</strong>
        <small>
          {p.beds} PN · {p.area} m² · Tầng {p.floor}
        </small>
        <small>Mặt bằng / 3D / 360° ↗</small>
      </span>
    </Link>
  );
}
