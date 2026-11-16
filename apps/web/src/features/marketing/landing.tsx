"use client";
import { ArtImage } from "@/components/art-image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  MoveUpRight,
  Leaf,
  Waves,
  Sun,
  Search,
} from "lucide-react";
import { useDemo } from "@/services/store";
import { SectionTitle, LinkButton } from "@/components/ui";
import { PropertyCard } from "../discovery/property-card";
import { ImmersivePropertyCarousel } from "./carousel";
import { brand } from "@/lib/brand";
export default function Landing() {
  const { data } = useDemo();
  return (
    <main id="main">
      <section className="hero">
        <picture>
          <source
            media="(max-width: 700px)"
            srcSet="/images/library/stillwater-blue-hour-mobile.webp"
          />
          <ArtImage
            className="hero-art"
            sizes="100vw"
            src="/images/residence-exterior.svg"
            alt="Phối cảnh AI The Stillwater bên mặt nước lúc hoàng hôn"
            width="1600"
            height="1000"
            fetchPriority="high"
          />
        </picture>
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">THE ART OF CONSIDERED LIVING</p>
          <h1>
            {data.cms.headline.split("\n").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </h1>
          <p>{data.cms.subtitle}</p>
          <Link className="hero-link" href="/discover">
            Khám phá bộ sưu tập <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="hero-bottom">
          <span>{brand.line}</span>
          <a href="#collection" aria-label="Cuộn tới bộ sưu tập">
            <ArrowDown size={18} />
          </a>
          <span>THE STILLWATER · CONCEPT 01</span>
        </div>
        <Link className="hero-explore-card" href="/explorer">
          <span className="orbit-symbol" aria-hidden="true">
            ↗
          </span>
          <span>
            <small>SPATIAL EXPERIENCE</small>
            <strong>Bước vào không gian 3D</strong>
          </span>
          <ArrowUpRight size={18} />
        </Link>
        <div className="hero-index" aria-hidden="true">
          01 <span>/ 03</span>
        </div>
      </section>
      <form className="smart-search container" action="/discover">
        <label>
          <span>ĐỊA ĐIỂM / DỰ ÁN</span>
          <select name="projectId" aria-label="Chọn dự án">
            <option value="">Mọi không gian</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.location.split(" · ")[1]}
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
      <section className="container intro-section">
        <p className="eyebrow">01 / THE ARVESSA PERSPECTIVE</p>
        <div>
          <h2>
            Kiến trúc có chiều sâu.
            <br />
            Cuộc sống có khoảng thở.
          </h2>
          <p>
            Chúng tôi nhìn bất động sản từ cách con người sống trong đó. Từ một
            ô cửa đón nắng đến nhịp chuyển tiếp giữa không gian riêng và thành
            phố — mỗi chi tiết đều có ý nghĩa.
          </p>
          <Link className="underlined-link" href="/about">
            Góc nhìn của ARVESSA <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section id="collection" className="collection-section">
        <div className="container">
          <SectionTitle
            eyebrow="02 / SELECTED ADDRESSES"
            title="Những nơi chốn khác biệt."
          >
            <Link href="/discover" className="underlined-link">
              Xem bộ sưu tập <ArrowUpRight size={16} />
            </Link>
          </SectionTitle>
          <ImmersivePropertyCarousel />
        </div>
      </section>
      <section className="container category-strip">
        {["Căn hộ", "Penthouse"].map((x, i) => (
          <Link key={x} href={`/discover?type=${encodeURIComponent(x)}`}>
            <span>0{i + 1}</span>
            <h3>{x}</h3>
            <MoveUpRight />
          </Link>
        ))}
        <Link href="/explorer">
          <span>03</span>
          <h3>Khám phá không gian 3D</h3>
          <MoveUpRight />
        </Link>
      </section>
      <section className="signature-section">
        <div className="signature-image">
          <ArtImage
            src="/images/residence-courtyard.svg"
            alt="Sân trong và mặt nước The Stillwater — minh họa"
            width="1600"
            height="1000"
            loading="lazy"
          />
          <span>THE STILLWATER / COURTYARD STUDY</span>
        </div>
        <div className="signature-copy">
          <p className="eyebrow">03 / SIGNATURE DEVELOPMENT</p>
          <h2>
            Trở về.
            <br />
            Và chậm lại.
          </h2>
          <p>
            The Stillwater là nghiên cứu về một cuộc sống cân bằng: hai tháp
            thấp tầng, những khoảng hiên sâu và sân vườn mở ra phía mặt nước.
          </p>
          <div className="signature-stats">
            <div>
              <strong>02</strong>
              <span>Tháp kiến trúc</span>
            </div>
            <div>
              <strong>06</strong>
              <span>Tầng mỗi tháp</span>
            </div>
            <div>
              <strong>48</strong>
              <span>Căn trong mô hình</span>
            </div>
          </div>
          <LinkButton href="/projects/stillwater">
            Khám phá The Stillwater
          </LinkButton>
        </div>
      </section>
      <section className="container explorer-teaser">
        <div>
          <p className="eyebrow">04 / A NEW PERSPECTIVE</p>
          <h2>
            Tìm góc nhìn
            <br />
            của riêng bạn.
          </h2>
          <p>
            Xoay mô hình, chọn tầng và khám phá từng căn. Xem vị trí trong tổng
            thể trước khi đi sâu vào chi tiết.
          </p>
          <LinkButton href="/explorer">Bước vào không gian 3D</LinkButton>
        </div>
        <Link
          href="/explorer"
          className="architectural-grid"
          aria-label="Mở mô hình 3D tương tác"
        >
          <div className="isometric-building">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="building-level">
                {Array.from({ length: 4 }, (_, n) => (
                  <span key={n} />
                ))}
              </div>
            ))}
          </div>
          <span className="floating-note">
            360° ORBIT · CHỌN TẦNG · CHỌN CĂN
          </span>
        </Link>
      </section>
      <section className="amenities container">
        <SectionTitle
          eyebrow="05 / EVERYDAY, CONSIDERED"
          title="Điều nhỏ tạo nên khác biệt."
        />
        <div className="amenity-grid">
          {[
            [
              Leaf,
              "Một khoảng xanh",
              "Sân vườn nối tiếp các không gian chung, đưa thiên nhiên vào nhịp sống mỗi ngày.",
            ],
            [
              Waves,
              "Mặt nước tĩnh",
              "Hồ cảnh quan và khoảng nghỉ là những điểm dừng giữa hành trình trở về.",
            ],
            [
              Sun,
              "Ánh sáng tự nhiên",
              "Những lớp hiên sâu điều tiết nắng, tạo chiều sâu và sự riêng tư.",
            ],
          ].map(([Icon, title, copy]) => {
            const I = Icon as typeof Leaf;
            return (
              <article key={String(title)}>
                <I size={28} strokeWidth={1} />
                <h3>{String(title)}</h3>
                <p>{String(copy)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="residences-section">
        <div className="container">
          <SectionTitle
            eyebrow="06 / CURATED RESIDENCES"
            title="Không gian dành cho bạn."
          >
            <Link href="/discover" className="underlined-link">
              Xem tất cả <ArrowUpRight size={16} />
            </Link>
          </SectionTitle>
          <div className="property-grid">
            {data.properties
              .filter((p) => p.projectId === "stillwater" && p.floor === 3)
              .slice(0, 3)
              .map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
          </div>
        </div>
      </section>
      <section className="container editorial-split">
        <ArtImage
          src="/images/residence-interior.svg"
          alt="Không gian phòng khách mở ra sân vườn — minh họa"
          width="1600"
          height="1000"
          loading="lazy"
        />
        <div>
          <p className="eyebrow">07 / CONNECTED LIVING</p>
          <h2>
            Gần thành phố.
            <br />
            Gần chính mình.
          </h2>
          <p>
            Một địa chỉ không chỉ là vị trí trên bản đồ. Đó là những kết nối với
            nơi làm việc, trường học, khoảng xanh và cộng đồng quanh bạn.
          </p>
          <Link className="underlined-link" href="/journal">
            Đọc những góc nhìn mới <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="container journey">
        <SectionTitle
          eyebrow="08 / YOUR JOURNEY"
          title="Một hành trình rõ ràng."
        />
        <div className="journey-grid">
          {[
            ["01", "Khám phá", "Lọc, so sánh và tìm hiểu không gian."],
            ["02", "Trải nghiệm", "Đặt lịch tham quan và trao đổi nhu cầu."],
            ["03", "Lựa chọn", "Xem điều khoản và yêu cầu giữ căn demo."],
            ["04", "Tiếp nối", "Theo dõi hồ sơ trong không gian của bạn."],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="consultation">
        <p className="eyebrow">LET’S FIND YOUR PERSPECTIVE</p>
        <h2>
          Không gian tiếp theo
          <br />
          bắt đầu từ cuộc trò chuyện.
        </h2>
        <LinkButton href="/appointments">Đặt lịch tư vấn</LinkButton>
        <p className="fine-print">
          Trải nghiệm trình diễn. Không gửi email, SMS hay yêu cầu giao dịch
          thật.
        </p>
      </section>
    </main>
  );
}
