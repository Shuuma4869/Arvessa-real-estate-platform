"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/services/store";
import { money } from "@/domain/format";
import {
  Badge,
  Modal,
  LinkButton,
  Action,
  SectionTitle,
} from "@/components/ui";
import { PropertyCard } from "./property-card";
export default function PropertyDetail({ id }: { id: string }) {
  const { data, run, ready } = useDemo();
  const p = data.properties.find((p) => p.id === id);
  const [picture, setPicture] = useState(0),
    [lightbox, setLightbox] = useState(false);
  const exists = !!p;
  useEffect(() => {
    if (ready && exists) void run({ type: "view", id });
  }, [ready, id, run, exists]);
  if (!p)
    return (
      <main id="main" className="error-page">
        <h1>Không tìm thấy căn.</h1>
        <LinkButton href="/discover">Xem bộ sưu tập</LinkButton>
      </main>
    );
  const project = data.projects.find((x) => x.id === p.projectId)!;
  const images = [
    p.image,
    "/images/residence-interior.svg",
    "/images/residence-courtyard.svg",
  ];
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">
          <Link href={`/projects/${project.id}`}>{project.name}</Link> / {p.id}
        </p>
        <h1>{p.name}</h1>
        <p>
          {project.location} · Tháp {p.tower}, tầng {p.floor}
        </p>
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-gallery">
            <button
              style={{ padding: 0, width: "100%" }}
              onClick={() => setLightbox(true)}
              aria-label="Mở bộ ảnh lớn"
            >
              <img
                src={images[picture]}
                alt={`Ảnh minh họa ${picture + 1} cho ${project.name}`}
                width="1600"
                height="1000"
              />
            </button>
            <div className="gallery-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  aria-label={`Xem ảnh ${i + 1}`}
                  aria-pressed={i === picture}
                  onClick={() => setPicture(i)}
                >
                  <img src={src} alt="" width="240" height="150" />
                </button>
              ))}
            </div>
          </div>
          <div className="spec-grid">
            {[
              ["Diện tích", `${p.area} m²`],
              ["Phòng ngủ", p.beds],
              ["Phòng tắm", p.baths],
              ["Hướng", p.direction],
              ["Tầm nhìn", p.view],
              ["Loại hình", p.type],
            ].map(([k, v]) => (
              <div key={k}>
                <small>{k}</small>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <section className="detail-section">
            <h2>Không gian, trong từng chi tiết.</h2>
            <p>{project.story}</p>
            <p>
              Hình ảnh là nghiên cứu không gian của cùng concept dự án; không mô
              tả hoàn thiện bàn giao của căn cụ thể.
            </p>
            <img
              className="plan"
              src="/images/residence-plan.svg"
              alt="Mặt bằng minh họa loại căn hai phòng ngủ"
              width="1200"
              height="900"
            />
            <p className="fine-print">
              Mặt bằng tham khảo loại căn 2 phòng ngủ; căn {p.id} có {p.beds}{" "}
              phòng ngủ. Dùng mô hình 3D để kiểm tra vị trí căn trong tòa.
            </p>
            <LinkButton href={`/explorer?project=${project.id}&unit=${p.id}`}>
              Xem vị trí căn trong 3D
            </LinkButton>
          </section>
          <section className="detail-section">
            <h2>Một nhịp sống cân bằng.</h2>
            <p>
              Sân vườn, hồ cảnh quan và không gian cộng đồng là các tiện ích
              nghiên cứu trong concept. Kết nối đô thị xung quanh được trình bày
              ở trang dự án.
            </p>
          </section>
        </div>
        <aside className="detail-summary">
          <Badge>{p.availability}</Badge>
          <span className="price">{money(p.price)}</span>
          <p className="fine-print">Giá minh họa · Không phải chào bán</p>
          <h2>Để lựa chọn thêm rõ ràng.</h2>
          <p>
            Hẹn tham quan hoặc trải nghiệm quy trình giữ căn trong môi trường mô
            phỏng.
          </p>
          <div className="form-stack">
            <LinkButton href={`/reserve/${id}`}>
              Yêu cầu giữ căn demo
            </LinkButton>
            <LinkButton href={`/appointments?property=${id}`} secondary>
              Đặt lịch tham quan
            </LinkButton>
            <div className="actions">
              <Action
                label={
                  data.favorites.includes(id) ? "Bỏ yêu thích" : "Yêu thích"
                }
                action={() => run({ type: "favorite", id })}
              />
              <Action
                label={data.comparisons.includes(id) ? "Bỏ so sánh" : "So sánh"}
                action={() => run({ type: "compare", id })}
              />
            </div>
          </div>
          <hr />
          <p className="fine-print">
            Linh Trần · Chuyên viên demo
            <br />
            Không có cuộc gọi hay tin nhắn thật được gửi.
          </p>
          <Link className="underlined-link" href={`/finance?price=${p.price}`}>
            Dự tính phương án tài chính
          </Link>
        </aside>
      </div>
      <section className="detail-section">
        <SectionTitle title="Những lựa chọn gần với bạn." />
        <div className="property-grid">
          {data.properties
            .filter(
              (x) =>
                x.id !== id && x.projectId === p.projectId && x.beds === p.beds,
            )
            .slice(0, 3)
            .map((x) => (
              <PropertyCard key={x.id} property={x} />
            ))}
        </div>
      </section>
      {lightbox && (
        <Modal
          wide
          title={`Bộ ảnh ${project.name}`}
          onClose={() => setLightbox(false)}
        >
          <img
            className="gallery-lightbox"
            src={images[picture]}
            alt={`Minh họa ${project.name}`}
            width="1600"
            height="1000"
          />
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => setPicture((picture + 2) % 3)}
            >
              Ảnh trước
            </button>
            <button
              className="button secondary"
              onClick={() => setPicture((picture + 1) % 3)}
            >
              Ảnh sau
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
