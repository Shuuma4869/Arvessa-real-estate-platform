"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  ArrowDown,
  Search,
} from "lucide-react";
import { ArtImage } from "@/components/art-image";
import { LinkButton } from "@/components/ui";
import { useDemo } from "@/services/store";
import { ImmersivePropertyCarousel } from "./carousel";
import { SpatialPreview } from "../spatial/spatial-preview";
import { brand } from "@/lib/brand";
import "./public-spatial.css";
const scenes = [
  {
    label: "Kiến trúc",
    image: "/images/library/stillwater-blue-hour-1600.webp",
    title: "Những lớp hiên đón ánh sáng.",
    copy: "Hai tháp thấp tầng và nhịp ban công mở ra mặt nước.",
    href: "/projects/stillwater",
    point: "Khám phá The Stillwater",
    x: 60,
    y: 44,
  },
  {
    label: "Không gian",
    image: "/images/library/stillwater-two-bedroom-1600.webp",
    title: "Một khoảng sống dành riêng.",
    copy: "Vật liệu tự nhiên, ánh sáng dịu và không gian kết nối.",
    href: "/properties/A0302",
    point: "Bước vào căn A0302",
    x: 47,
    y: 61,
  },
  {
    label: "Tiện ích",
    image: "/images/library/stillwater-pool-1600.webp",
    title: "Chạm vào nhịp sống chậm.",
    copy: "Mặt nước và sân vườn nối dài hành trình trở về.",
    href: "/projects/stillwater#masterplan",
    point: "Xem tổng mặt bằng",
    x: 62,
    y: 68,
  },
  {
    label: "Mô hình",
    image: "/spatial-flagships/Stillwater-golden.webp",
    title: "Bóng hiên trên mặt đứng.",
    copy: "Góc nắng thấp làm rõ chiều sâu ban công và các lớp vật liệu của mô hình The Stillwater.",
    href: "/spatial-review",
    point: "Mở phòng trưng bày",
    x: 57,
    y: 48,
  },
];
export default function Landing() {
  const data = useDemo((s) => s.data);
  const [scene, setScene] = useState(0),
    [spot, setSpot] = useState(false),
    [amenity, setAmenity] = useState(0);
  const active = scenes[scene];
  const change = (next: number) => {
    setScene((next + scenes.length) % scenes.length);
    setSpot(false);
  };
  return (
    <main id="main" className="flagship-landing">
      <section
        className="atelier-hero"
        aria-label="ARVESSA — Architectural Atelier"
      >
        <div className="atelier-hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> THE STILLWATER · BỘ SƯU TẬP KIẾN
            TRÚC
          </p>
          <h1>
            {data.cms.headline.split("\n").map((line, i) => (
              <span key={i}>{i === 1 ? <em>{line}</em> : line}</span>
            ))}
          </h1>
          <p className="hero-description">{data.cms.subtitle}</p>
          <div className="hero-cta">
            <Link className="button atelier-primary" href="/discover">
              Khám phá bộ sưu tập <ArrowUpRight size={18} />
            </Link>
            <Link className="atelier-text-link" href="/appointments">
              Hẹn một cuộc gặp <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-footnote">
            <img src="/brand/arvessa-mark.svg" alt="" width={36} height={36} />
            <span>{brand.line}</span>
          </div>
          <Link href="/properties/A0302" className="hero-residence-study">
            <ArtImage
              src="/images/library/stillwater-two-bedroom-1600.webp"
              alt=""
              width={180}
              height={108}
              sizes="100px"
              loading="lazy"
            />
            <span>
              <small>HỒ SƠ CĂN HỘ</small>
              <strong>Lake Residence · A0302</strong>
              <span>Mặt bằng và tour từng phòng</span>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <a className="atelier-scroll" href="#collection">
            Xem bộ sưu tập <ArrowDown size={16} />
          </a>
        </div>
        <div className="atelier-hero-visual">
          <div className="hero-scene-image" key={scene}>
            <picture>
              {scene === 0 && (
                <source
                  media="(max-width:700px)"
                  srcSet="/images/library/stillwater-blue-hour-mobile.webp"
                />
              )}
              <ArtImage
                src={active.image}
                alt={
                  scene === 3
                    ? "The Stillwater trong ánh chiều, dựng từ mô hình kiến trúc"
                    : `Phối cảnh concept The Stillwater — ${active.label.toLowerCase()}`
                }
                width={1600}
                height={1067}
                sizes="(max-width:700px) 100vw, 58vw"
                fetchPriority={scene === 0 ? "high" : "auto"}
              />
            </picture>
          </div>
          <div className="hero-scene-tabs" aria-label="Góc nhìn The Stillwater">
            {scenes.map((s, i) => (
              <button
                key={s.label}
                aria-pressed={scene === i}
                onClick={() => change(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            className="scene-hotspot"
            style={{ left: `${active.x}%`, top: `${active.y}%` }}
            aria-label={`Tìm hiểu: ${active.title}`}
            aria-expanded={spot}
            onClick={() => setSpot(!spot)}
          >
            <Plus size={20} />
          </button>
          {spot && (
            <div
              className="scene-hotspot-panel"
              role="region"
              aria-label="Chi tiết không gian"
            >
              <strong>{active.title}</strong>
              <p>{active.copy}</p>
              <Link href={active.href}>{active.point} ↗</Link>
            </div>
          )}
          <div className="hero-scene-caption">
            <div>
              <small>
                THE STILLWATER /{" "}
                {scene === 3 ? "RENDER TỪ MÔ HÌNH" : "CONCEPT STUDY"}
              </small>
              <h2>{active.title}</h2>
            </div>
            <div className="scene-arrows">
              <button
                aria-label="Cảnh hero trước"
                onClick={() => change(scene - 1)}
              >
                <ArrowLeft size={17} />
              </button>
              <span>
                0{scene + 1}
                <small> / 0{scenes.length}</small>
              </span>
              <button
                aria-label="Cảnh hero sau"
                onClick={() => change(scene + 1)}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <form className="atelier-search" action="/discover">
        <label>
          <span>DỰ ÁN</span>
          <select name="projectId" aria-label="Chọn dự án">
            <option value="">Mọi không gian</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>LOẠI HÌNH</span>
          <select name="type" aria-label="Loại hình">
            <option value="">Tất cả loại hình</option>
            <option>Căn hộ</option>
            <option>Penthouse</option>
          </select>
        </label>
        <label>
          <span>NGÂN SÁCH</span>
          <select name="maxPrice" aria-label="Ngân sách">
            <option value="">Khoảng giá của bạn</option>
            <option value="8">Đến 8 tỷ</option>
            <option value="10">Đến 10 tỷ</option>
            <option value="15">Đến 15 tỷ</option>
          </select>
        </label>
        <button className="button" type="submit">
          <Search size={17} />
          Tìm không gian
        </button>
      </form>
      <section className="atelier-story container">
        <p className="eyebrow">01 / THE ARVESSA PERSPECTIVE</p>
        <div>
          <h2>
            Kiến trúc không dừng lại
            <br />ở những <em>đường nét.</em>
          </h2>
          <p>
            Nó tiếp tục trong ánh sáng đi qua một ô cửa, trong khoảng thở giữa
            hai lớp không gian, và trong cách bạn tìm thấy nơi thuộc về mình.
          </p>
          <Link className="underlined-link" href="/about">
            Góc nhìn của ARVESSA <ArrowUpRight size={16} />
          </Link>
        </div>
        <span className="atelier-statement" aria-hidden="true">
          A<br />V<br />E
        </span>
      </section>
      <section id="collection" className="atelier-collection">
        <div className="container">
          <div className="atelier-section-heading">
            <div>
              <p className="eyebrow">02 / SELECTED ADDRESSES & RESIDENCES</p>
              <h2>
                Nơi chốn.
                <br />
                <em>Và những khả năng.</em>
              </h2>
            </div>
            <p>
              Mỗi địa chỉ là một góc nhìn khác.
              <br />
              Kéo để tìm không gian của bạn.
            </p>
          </div>
        </div>
        <ImmersivePropertyCarousel />
      </section>
      <section className="atelier-spatial container">
        <div>
          <p className="eyebrow">03 / ARCHITECTURE, BROUGHT TO LIFE</p>
          <h2>
            Đến gần hơn.
            <br />
            <em>Nhìn sâu hơn.</em>
          </h2>
          <p>
            Xoay toàn khu, khám phá tầng và chọn căn trong một mô hình kiến trúc
            tương tác. Cùng một dữ liệu xuyên suốt hành trình của bạn.
          </p>
          <LinkButton href="/explorer?project=stillwater">
            Bước vào showroom 3D <ArrowUpRight size={17} />
          </LinkButton>
          <Link className="source-study-link" href="/spatial-review">
            Xem mô hình và bản dựng The Stillwater <ArrowUpRight size={15} />
          </Link>
          <div className="spatial-facts">
            <span>
              <b>02</b> tháp
            </span>
            <span>
              <b>06</b> tầng
            </span>
            <span>
              <b>48</b> căn
            </span>
          </div>
        </div>
        <SpatialPreview />
      </section>
      <section className="atelier-living">
        <div className="atelier-living-image">
          <ArtImage
            src="/images/library/stillwater-penthouse-1600.webp"
            alt="Concept nội thất penthouse Stillwater"
            width={1024}
            height={1536}
            loading="lazy"
            sizes="(max-width:700px) 100vw, 50vw"
          />
          <span>THE STILLWATER / PRIVATE SPACES</span>
        </div>
        <div className="atelier-living-copy">
          <p className="eyebrow">04 / THE ART OF LIVING</p>
          <h2>
            Không gian tốt.
            <br />
            <em>Cảm nhận được.</em>
          </h2>
          <p>
            Đọc mặt bằng, xoay không gian nội thất và bước vào từng góc nhìn. Từ
            một lựa chọn trên bản đồ đến một nơi chốn bạn có thể hình dung.
          </p>
          <Link className="atelier-text-link" href="/properties/A0302">
            Khám phá Lake Residence — A0302 <ArrowUpRight size={17} />
          </Link>
          <div className="living-materials">
            <span>Đá tự nhiên</span>
            <span>Gỗ ấm</span>
            <span>Ánh sáng</span>
          </div>
        </div>
      </section>
      <section className="atelier-amenities container">
        <div className="atelier-section-heading">
          <div>
            <p className="eyebrow">05 / EVERYDAY, CONSIDERED</p>
            <h2>
              Chậm lại.
              <br />
              <em>Để sống trọn hơn.</em>
            </h2>
          </div>
          <Link className="underlined-link" href="/projects/stillwater">
            The Stillwater <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="amenity-scene">
          <ArtImage
            src="/images/library/stillwater-pool-1600.webp"
            alt="Hồ bơi và pergola trong concept The Stillwater"
            width={1600}
            height={900}
            loading="lazy"
            sizes="90vw"
          />
          {[
            [28, 63],
            [65, 37],
            [82, 70],
          ].map(([x, y], i) => (
            <button
              key={i}
              className={`amenity-point ${amenity === i ? "active" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={["Hồ nước", "Pergola", "Sân vườn"][i]}
              aria-pressed={amenity === i}
              onClick={() => setAmenity(i)}
            >
              <Plus size={18} />
            </button>
          ))}
          <div className="amenity-note" aria-live="polite">
            <small>0{amenity + 1} / THE EVERYDAY COLLECTION</small>
            <h3>
              {
                [
                  "Một khoảng nước tĩnh.",
                  "Những lớp nắng dịu.",
                  "Thiên nhiên trong nhịp sống.",
                ][amenity]
              }
            </h3>
            <p>
              {
                [
                  "Mặt nước mở rộng tầm nhìn và tạo khoảng nghỉ giữa hành trình trở về.",
                  "Kết cấu gỗ tạo bóng râm và nhịp ánh sáng thay đổi theo thời gian.",
                  "Cảnh quan kết nối các lối đi, không gian chung và nơi ở.",
                ][amenity]
              }
            </p>
          </div>
        </div>
      </section>
      <section className="atelier-journey container">
        <p className="eyebrow">06 / A CONSIDERED JOURNEY</p>
        <h2>
          Mọi bước đi.
          <br />
          <em>Đều rõ ràng.</em>
        </h2>
        <div>
          {[
            ["01", "Khám phá", "/discover"],
            ["02", "Trải nghiệm", "/appointments"],
            ["03", "Lựa chọn", "/properties/A0302"],
            ["04", "Tiếp nối", "/buyer/dashboard"],
          ].map(([n, title, href]) => (
            <Link key={n} href={href}>
              <small>{n}</small>
              <span>{title}</span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="atelier-invitation">
        <img
          src="/brand/arvessa-mark-inverse.svg"
          alt=""
          width={64}
          height={64}
        />
        <p className="eyebrow">07 / YOUR NEXT PERSPECTIVE</p>
        <h2>
          Một góc nhìn mới.
          <br />
          <em>Bắt đầu từ bạn.</em>
        </h2>
        <LinkButton href="/appointments">
          Đặt lịch tư vấn <ArrowUpRight size={18} />
        </LinkButton>
        <p className="fine-print">
          Trải nghiệm trình diễn · Không gửi email/SMS hoặc thực hiện giao dịch
          thật.
        </p>
      </section>
    </main>
  );
}
