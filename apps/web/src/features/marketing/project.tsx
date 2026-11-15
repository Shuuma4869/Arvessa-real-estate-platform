"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/services/store";
import { PropertyCard } from "../discovery/property-card";
import { LinkButton, SectionTitle, Modal, Button } from "@/components/ui";
export default function ProjectPage({ id }: { id: string }) {
  const data = useDemo((s) => s.data);
  const project = data.projects.find((p) => p.id === id);
  const [document, setDocument] = useState(false);
  if (!project)
    return (
      <main id="main" className="error-page">
        <h1>Không tìm thấy dự án.</h1>
        <LinkButton href="/discover">Trở lại bộ sưu tập</LinkButton>
      </main>
    );
  return (
    <main id="main" className="public-page">
      <section className="project-hero">
        <img
          src={project.image}
          alt={`Minh họa dự án ${project.name}`}
          width="1600"
          height="1000"
        />
        <div>
          <p className="eyebrow">ARVESSA / PROJECT CONCEPT</p>
          <h1>{project.name}</h1>
          <p>{project.location} · Dự án minh họa</p>
        </div>
      </section>
      <div className="container project-body">
        <nav className="tabs" aria-label="Nội dung dự án">
          <a href="#overview">Tổng quan</a>
          <a href="#residences">Căn hộ</a>
          <a href="#amenities">Tiện ích</a>
          <a href="#progress">Tiến độ</a>
          <a href="#documents">Tài liệu</a>
        </nav>
        <section
          id="overview"
          className="editorial-split"
          style={{ paddingTop: 15 }}
        >
          <div>
            <p className="eyebrow">A PLACE TO BELONG</p>
            <h2>
              Được thiết kế
              <br />
              cho cách bạn sống.
            </h2>
            <p>{project.story}</p>
            <div className="spec-grid">
              <div>
                <small>Số tháp</small>
                {project.towers.length}
              </div>
              <div>
                <small>Tầng / tháp</small>
                {project.floors}
              </div>
              <div>
                <small>Số căn</small>
                {project.towers.length * project.floors * project.unitsPerFloor}
              </div>
            </div>
            <div className="actions">
              <LinkButton href={`/explorer?project=${id}`}>
                Khám phá 3D
              </LinkButton>
              <LinkButton href={`/appointments?project=${id}`} secondary>
                Hẹn tham quan
              </LinkButton>
            </div>
          </div>
          <img
            src="/images/residence-interior.svg"
            alt="Nghiên cứu nội thất căn hai phòng ngủ"
            width="1600"
            height="1000"
          />
        </section>
        <section id="residences">
          <SectionTitle
            eyebrow="RESIDENCE COLLECTION"
            title="Những lựa chọn đang mở."
          >
            <Link
              href={`/discover?projectId=${id}`}
              className="underlined-link"
            >
              Xem toàn bộ giỏ hàng
            </Link>
          </SectionTitle>
          <div className="property-grid">
            {data.properties
              .filter((p) => p.projectId === id && p.floor === 3)
              .slice(0, 3)
              .map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
          </div>
        </section>
        <section className="editorial-split" id="amenities">
          <img
            src="/images/residence-courtyard.svg"
            alt="Minh họa tiện ích sân trong"
            width="1600"
            height="1000"
            loading="lazy"
          />
          <div>
            <p className="eyebrow">AMENITIES & LIFESTYLE</p>
            <h2>
              Khoảng thở
              <br />
              giữa ngày thường.
            </h2>
            <p>
              Sân trong xanh, hồ cảnh quan, không gian làm việc chung và khu
              tiếp khách tạo nên chuỗi trải nghiệm xuyên suốt.
            </p>
            <p>
              Vị trí demo kết nối công viên, trường học và khu thương mại.
              Khoảng cách thực tế chưa được xác minh; không dùng thông tin này
              để quyết định giao dịch.
            </p>
            <LinkButton href={`/explorer?project=${id}`}>
              Tham quan mô hình tương tác
            </LinkButton>
          </div>
        </section>
        <section className="detail-section">
          <SectionTitle
            eyebrow="FLOOR PLAN STUDY"
            title="Rõ từng khoảng không."
          />
          <img
            className="plan"
            src="/images/residence-plan.svg"
            alt="Mặt bằng concept căn hai phòng ngủ; không phải bản vẽ thi công"
            width="1200"
            height="900"
            loading="lazy"
          />
          <p className="fine-print">
            Sơ đồ minh họa loại căn hai phòng ngủ. Diện tích cụ thể lấy từ hồ sơ
            từng căn; mặt bằng thi công chưa được cung cấp.
          </p>
        </section>
        <section id="progress" className="detail-section">
          <SectionTitle title="Tiến trình dự án demo." />
          <div className="journey-grid">
            {[
              "Nghiên cứu thiết kế",
              "Dựng mô hình kiến trúc",
              "Mở trải nghiệm demo",
              "Thu thập phản hồi",
            ].map((t, i) => (
              <article key={t}>
                <span>0{i + 1}</span>
                <h3>{t}</h3>
                <p>
                  {i < 3
                    ? "Đã hoàn thành trong concept"
                    : "Đang tiếp nhận trong phiên trình diễn"}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section id="documents" className="detail-section panel">
          <h2>Tài liệu & chính sách</h2>
          <p>{project.policy.terms}</p>
          <div className="actions">
            <Button className="secondary" onClick={() => setDocument(true)}>
              Xem hồ sơ dự án demo
            </Button>
            <LinkButton href="/deposit-policy" secondary>
              Đọc điều kiện đặt cọc
            </LinkButton>
          </div>
        </section>
      </div>
      {document && (
        <Modal title="Hồ sơ concept dự án" onClose={() => setDocument(false)}>
          <div className="document-preview">
            <h2>{project.name}</h2>
            <p>Hồ sơ phiên bản 1 · 15/11/2026</p>
            <p>{project.story}</p>
            <p>
              {project.towers.length} tháp, {project.floors} tầng mỗi tháp,{" "}
              {project.unitsPerFloor} căn mỗi tầng.
            </p>
            <p>
              Tài liệu mô phỏng cho thiết kế trải nghiệm. Không phải hồ sơ pháp
              lý, giấy phép xây dựng hay cam kết mở bán.
            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}
