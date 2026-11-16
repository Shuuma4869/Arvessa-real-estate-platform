"use client";
import { useState } from "react";
import Link from "next/link";
import { Project } from "@/domain/types";
import { ArtImage } from "@/components/art-image";
import { Modal, SectionTitle } from "@/components/ui";
import { projectGallery } from "@/lib/visual-assets";
export function ProjectVisuals({ project }: { project: Project }) {
  const [spot, setSpot] = useState(project.towers[0]);
  const [photo, setPhoto] = useState<number | null>(null);
  const active =
    spot === "garden" || project.towers.includes(spot)
      ? spot
      : project.towers[0];
  const images = projectGallery(project.id, project.image);
  return (
    <section className="project-visuals" id="masterplan">
      <SectionTitle
        eyebrow="THE SITE / INTERACTIVE STUDY"
        title="Mỗi vị trí, một góc nhìn."
      />
      <div className="masterplan-layout">
        <div className="masterplan" aria-label="Sơ đồ tổng mặt bằng concept">
          <span className="north-marker">N ↑</span>
          <div className="masterplan-water">MẶT NƯỚC / CẢNH QUAN</div>
          <div className="masterplan-towers">
            {project.towers.map((tower) => (
              <button
                key={tower}
                className={`masterplan-tower ${active === tower ? "selected" : ""}`}
                onClick={() => setSpot(tower)}
                aria-pressed={active === tower}
                aria-label={`Khám phá tháp ${tower}`}
              >
                <span>{tower}</span>
                <small>{project.floors} tầng</small>
              </button>
            ))}
          </div>
          <button
            className="garden-hotspot"
            onClick={() => setSpot("garden")}
            aria-pressed={active === "garden"}
          >
            ＋ Sân vườn
          </button>
          <span className="site-entry">LỐI TIẾP CẬN ↑</span>
        </div>
        <div className="masterplan-copy" aria-live="polite">
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
          <Link
            className="underlined-link"
            href={`/explorer?project=${project.id}${active !== "garden" ? `&tower=${active}` : ""}`}
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
