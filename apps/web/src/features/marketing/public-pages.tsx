"use client";
import { ArtImage } from "@/components/art-image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDemo } from "@/services/store";
import { money, monthlyPayment } from "@/domain/format";
import {
  Field,
  Button,
  Action,
  Empty,
  LinkButton,
  Badge,
} from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
import { brand } from "@/lib/brand";
export const articles = [
  {
    id: "light-and-space",
    title: "Ánh sáng là một vật liệu kiến trúc.",
    category: "Architecture",
    image: "/images/library/duplex-study-1600.webp",
    paragraphs: [
      "Một không gian có thể thay đổi hoàn toàn theo thời điểm trong ngày. Ánh sáng không chỉ giúp nhìn rõ; nó tạo nhịp, nhấn chiều sâu và gợi cảm giác về thời gian.",
      "Khi xem một căn hộ, hãy quan sát hướng cửa, chiều sâu ban công và khả năng thông gió. Một khoảng hiên phù hợp có thể làm dịu ánh nắng trực tiếp mà vẫn giữ tầm nhìn mở.",
      "Trong mô hình ARVESSA, bạn có thể chọn tầng, hướng và tầm nhìn để hình dung vị trí. Các minh họa không thay thế khảo sát thực tế hoặc tư vấn thiết kế.",
    ],
  },
  {
    id: "considered-living",
    title: "Khoảng thở giữa nhịp sống đô thị.",
    category: "Experience",
    image: "/images/residence-courtyard.svg",
    paragraphs: [
      "Khoảng xanh không cần rộng để trở nên có ý nghĩa. Một góc sân có bóng mát, một lối đi ít tiếng ồn, một nơi có thể ngồi lại sau ngày làm việc đều góp phần vào trải nghiệm sống.",
      "Hãy xem cách các tiện ích nối với nhau thay vì chỉ đếm số lượng. Từ lối vào đến thang máy, từ khu sinh hoạt chung đến không gian riêng: sự chuyển tiếp tốt giúp mỗi ngày nhẹ nhàng hơn.",
      "The Stillwater là concept để nghiên cứu những kết nối đó. Mọi hình ảnh và thông tin tại đây phục vụ trình diễn.",
    ],
  },
  {
    id: "clear-decisions",
    title: "Lựa chọn bắt đầu từ thông tin rõ ràng.",
    category: "Vision",
    image: "/images/residence-exterior.svg",
    paragraphs: [
      "Trước một lựa chọn lớn, một bảng thông tin rõ thường hữu ích hơn một lời hứa dài. Giá, diện tích, vị trí và tình trạng cần được trình bày cùng ngữ cảnh.",
      "Lưu những căn phù hợp, so sánh theo cùng tiêu chí và ghi lại câu hỏi cần trao đổi. Không nên xem giá minh họa hoặc công cụ tính tài chính như một đề nghị vay hay cam kết đầu tư.",
      "ARVESSA đưa việc khám phá và theo dõi hồ sơ vào cùng một hành trình. Mục tiêu của demo là cho thấy tiến trình có thể rõ ràng đến đâu.",
    ],
  },
];
export function Journal({ id }: { id?: string }) {
  const a = articles.find((x) => x.id === id);
  if (id && !a)
    return (
      <main id="main" className="error-page">
        <h1>Không tìm thấy bài viết.</h1>
        <LinkButton href="/journal">Về Góc nhìn</LinkButton>
      </main>
    );
  return a ? (
    <main id="main" className="public-article">
      <p className="eyebrow">ARVESSA JOURNAL / {a.category}</p>
      <h1>{a.title}</h1>
      <ArtImage
        src={a.image}
        alt="Minh họa kiến trúc nguyên bản"
        width="1600"
        height="1000"
      />
      {a.paragraphs.map((p) => (
        <p key={p} style={{ marginTop: 30 }}>
          {p}
        </p>
      ))}
      <Link className="underlined-link" href="/journal">
        Xem những góc nhìn khác
      </Link>
    </main>
  ) : (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">THE JOURNAL</p>
        <h1>
          Những góc nhìn
          <br />
          cho một cách sống.
        </h1>
      </div>
      <div className="journal-grid">
        {articles.map((a) => (
          <article key={a.id} className="journal-card">
            <Link href={`/journal/${a.id}`}>
              <ArtImage
                src={a.image}
                alt={`Minh họa ${a.category}`}
                width="640"
                height="400"
              />
              <p className="eyebrow">{a.category} / 5 PHÚT ĐỌC</p>
              <h2>{a.title}</h2>
              <span className="underlined-link">Đọc bài viết</span>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
export function Finance() {
  const params = useSearchParams();
  const [price, setPrice] = useState(Number(params.get("price")) || 8e9),
    [down, setDown] = useState(40),
    [rate, setRate] = useState(9),
    [years, setYears] = useState(20);
  const principal = price * (1 - down / 100),
    monthly = monthlyPayment(principal, rate, years);
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">FINANCIAL PERSPECTIVE</p>
        <h1>Dự tính, để chủ động.</h1>
        <p>
          Công cụ tính theo khoản trả góp đều, lãi suất cố định giả định. Không
          phải tư vấn vay hay đề nghị tín dụng.
        </p>
      </div>
      <div className="finance-grid">
        <div className="form-stack">
          <Field label="Giá bất động sản (VND)">
            <input
              type="number"
              min="1000000"
              max="1000000000000"
              value={price}
              onChange={(e) => setPrice(Math.max(1e6, Number(e.target.value)))}
            />
          </Field>
          <Field label={`Vốn tự có: ${down}%`}>
            <input
              type="range"
              min="10"
              max="100"
              value={down}
              onChange={(e) => setDown(Number(e.target.value))}
            />
          </Field>
          <Field label="Lãi suất giả định (%/năm)">
            <input
              type="number"
              min="0"
              max="40"
              step=".1"
              value={rate}
              onChange={(e) =>
                setRate(Math.min(40, Math.max(0, Number(e.target.value))))
              }
            />
          </Field>
          <Field label={`Thời hạn: ${years} năm`}>
            <input
              type="range"
              min="1"
              max="35"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="finance-result">
          <p className="eyebrow">KHOẢN TRẢ ƯỚC TÍNH MỖI THÁNG</p>
          <strong>{money(monthly)}</strong>
          <hr />
          <p>
            Vốn tự có: {money(price - principal)}
            <br />
            Khoản vay giả định: {money(principal)}
            <br />
            Tổng lãi ước tính: {money(monthly * years * 12 - principal)}
          </p>
          <p className="fine-print">
            Chưa gồm phí, bảo hiểm, biến động lãi suất hoặc điều kiện cấp tín
            dụng thực tế.
          </p>
        </div>
      </div>
    </main>
  );
}
export function Compare() {
  const { data, run } = useDemo();
  const properties = data.properties.filter((p) =>
    data.comparisons.includes(p.id),
  );
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">COMPARE / TỐI ĐA 4 CĂN</p>
        <h1>
          Cùng một tiêu chí.
          <br />
          Rõ từng khác biệt.
        </h1>
      </div>
      {properties.length ? (
        <div className="table-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Tiêu chí</th>
                {properties.map((p) => (
                  <th key={p.id}>
                    <ArtImage
                      src={p.image}
                      projectId={p.projectId}
                      alt={`Minh họa ${p.id}`}
                      width="180"
                      height="112"
                    />
                    <Link href={`/properties/${p.id}`}>{p.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Giá", (p: (typeof properties)[number]) => money(p.price)],
                [
                  "Diện tích",
                  (p: (typeof properties)[number]) => `${p.area} m²`,
                ],
                ["Phòng ngủ", (p: (typeof properties)[number]) => p.beds],
                ["Phòng tắm", (p: (typeof properties)[number]) => p.baths],
                ["Tầng", (p: (typeof properties)[number]) => p.floor],
                ["Hướng", (p: (typeof properties)[number]) => p.direction],
                ["Tầm nhìn", (p: (typeof properties)[number]) => p.view],
              ].map(([label, render]) => (
                <tr key={String(label)}>
                  <th>{String(label)}</th>
                  {properties.map((p) => (
                    <td key={p.id}>
                      {(
                        render as (
                          p: (typeof properties)[number],
                        ) => string | number
                      )(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Tình trạng</th>
                {properties.map((p) => (
                  <td key={p.id}>
                    <Badge>{p.availability}</Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <th>Lựa chọn</th>
                {properties.map((p) => (
                  <td key={p.id}>
                    <Action
                      label="Bỏ khỏi so sánh"
                      action={() => run({ type: "compare", id: p.id })}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="fine-print">
            Bảng so sánh được lưu tự động trên trình duyệt demo.
          </p>
        </div>
      ) : (
        <Empty title="Chọn ít nhất hai căn để so sánh">
          <LinkButton href="/discover">Khám phá căn</LinkButton>
        </Empty>
      )}
    </main>
  );
}
export function Contact() {
  const run = useDemo((s) => s.run);
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [message, setMessage] = useState(""),
    [sent, setSent] = useState(false);
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">A CONVERSATION, FIRST</p>
        <h1>
          Gặp nhau ở<br />
          một góc nhìn mới.
        </h1>
        <p>
          Để lại yêu cầu trong môi trường demo. Nội dung được lưu vào CRM trên
          trình duyệt này, không gửi email hoặc liên hệ thực tế.
        </p>
      </div>
      <div className="finance-grid">
        <div>
          <h2>ARVESSA Demo Studio</h2>
          <p>Architecture · Vision · Experience</p>
          <p>Tư vấn trải nghiệm · Khám phá dự án · Hỗ trợ nền tảng</p>
          <LinkButton href="/appointments" secondary>
            Đặt lịch tham quan demo
          </LinkButton>
        </div>
        <div className="panel form-stack">
          {sent ? (
            <>
              <h2>Đã ghi nhận trong demo.</h2>
              <p>Yêu cầu đã xuất hiện ở module Khách hàng tiềm năng của CRM.</p>
              <Button className="secondary" onClick={() => setSent(false)}>
                Tạo yêu cầu khác
              </Button>
            </>
          ) : (
            <>
              <Field label="Tên demo">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Người dùng demo"
                />
              </Field>
              <Field label="Email demo">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.test"
                />
              </Field>
              <Field label="Bạn muốn tìm hiểu điều gì?">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>
              <Action
                label="Lưu yêu cầu tư vấn demo"
                className=""
                action={async () => {
                  await run({
                    type: "inquiry",
                    name,
                    email,
                    message,
                    propertyId: "A0302",
                  });
                  setSent(true);
                }}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
export function PublicAppointment() {
  const params = useSearchParams(),
    { session, data } = useDemo();
  const [open, setOpen] = useState(false),
    [saved, setSaved] = useState("");
  const project = params.get("project");
  const property =
    params.get("property") ||
    data.properties.find((p) => p.projectId === project)?.id ||
    "A0302";
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">YOUR VISIT</p>
        <h1>
          Trải nghiệm không gian.
          <br />
          Theo thời gian của bạn.
        </h1>
        <p>
          Chọn lịch hẹn demo. Hệ thống kiểm tra trùng lịch và cập nhật đồng thời
          Buyer Portal, CRM và Customer 360°.
        </p>
      </div>
      <div className="editorial-split" style={{ paddingTop: 0 }}>
        <ArtImage
          src="/images/residence-courtyard.svg"
          alt="Sân trong của dự án demo"
          width="1000"
          height="625"
        />
        <div>
          <h2>
            {saved ? "Lịch hẹn đã được lưu." : "Một cuộc hẹn có ý nghĩa."}
          </h2>
          <p>
            {saved
              ? "Bạn có thể đổi lịch, hủy hoặc xem tiến trình trong không gian cá nhân."
              : "Lịch hẹn chỉ là dữ liệu mô phỏng. Không có cuộc gọi, email hoặc nhân viên thật được điều phối."}
          </p>
          {session ? (
            <Button onClick={() => setOpen(true)}>
              {saved ? "Đặt thêm lịch hẹn" : "Chọn lịch tham quan"}
            </Button>
          ) : (
            <LinkButton
              href={`/sign-in?next=/appointments?property=${property}`}
            >
              Đăng nhập demo để đặt lịch
            </LinkButton>
          )}
          {saved && (
            <p>
              <Link
                href={`/${session?.role === "buyer" ? "buyer" : "crm"}/appointments`}
                className="underlined-link"
              >
                Xem lịch hẹn của tôi
              </Link>
            </p>
          )}
        </div>
      </div>
      {open && (
        <EntityForm
          entity="appointments"
          title="Đặt lịch tham quan"
          defaults={{
            propertyId: property,
            staff: "staff-sales",
            customerId: "buyer-demo",
          }}
          onClose={() => setOpen(false)}
          onSaved={setSaved}
        />
      )}
    </main>
  );
}
const faq = [
  [
    "Đây có phải nền tảng đang giao dịch thật?",
    "Không. Tất cả căn, dự án, hồ sơ, lịch hẹn và thanh toán trong phiên bản này đều là dữ liệu mô phỏng.",
  ],
  [
    "Giữ căn khác đặt cọc thế nào?",
    "Giữ căn demo có thời hạn. Chỉ khi thanh toán mô phỏng được xác nhận, hồ sơ mới chuyển sang trạng thái đã đặt cọc. Trạng thái chờ đối soát không đồng nghĩa thanh toán thành công.",
  ],
  [
    "Tại sao không thanh toán được?",
    "Giữ căn có thể đã hết hạn, đang chờ gia hạn hoặc không đủ điều kiện. Mở lịch sử yêu cầu để kiểm tra.",
  ],
  [
    "Dữ liệu có mất khi tải lại trang?",
    "Dữ liệu không nhạy cảm được lưu trong trình duyệt. Nút đặt lại demo khôi phục fixture ban đầu. Xóa dữ liệu trình duyệt cũng xóa phiên demo.",
  ],
  [
    "Có thể dùng bàn phím cho mô hình 3D không?",
    "Có. Bảng lựa chọn dự án, tháp, tầng và căn luôn nằm cạnh mô hình. Chế độ 2D cho phép chọn căn mà không cần WebGL.",
  ],
];
export function InfoPage({ slug }: { slug: string }) {
  const data = useDemo((s) => s.data);
  if (slug === "faq")
    return (
      <main id="main" className="public-article">
        <p className="eyebrow">GOOD TO KNOW</p>
        <h1>Những điều cần biết.</h1>
        {faq.map(([q, a]) => (
          <details className="faq-item" key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </main>
    );
  if (slug === "about" || slug === "brand")
    return (
      <main id="main" className="public-article">
        <p className="eyebrow">LUXURY ARCHITECTURAL DIGITAL BRAND</p>
        <ArtImage src={brand.primary} alt="ARVESSA" width="400" height="80" />
        <p className="brand-line" style={{ marginTop: 24 }}>
          {brand.line}
        </p>
        <h1 style={{ marginTop: 45 }}>
          Cấu trúc rõ ràng.
          <br />
          Tầm nhìn dài hạn.
          <br />
          Trải nghiệm liền mạch.
        </h1>
        <p>
          ARVESSA là nền tảng bất động sản cao cấp kết hợp trải nghiệm số và CRM
          doanh nghiệp. Chúng tôi đặt chất lượng không gian, sự rõ ràng của
          thông tin và tính nhất quán trong phục vụ vào cùng một hệ thống.
        </p>
        <h2>Architecture</h2>
        <p>
          Kiến trúc không chỉ nằm trong công trình. Nó còn thể hiện ở cách dữ
          liệu được sắp xếp, giao diện dẫn đường và những quyết định có nền
          tảng.
        </p>
        <h2>Vision</h2>
        <p>
          Một lựa chọn cần nhiều hơn một hình ảnh đẹp. Tầm nhìn bắt đầu từ thông
          tin có ngữ cảnh, từ việc hiểu những điều đã biết và những điều còn cần
          xác minh.
        </p>
        <h2>Experience</h2>
        <p>
          Từ khám phá dự án đến đặt lịch và theo dõi hồ sơ, mỗi điểm chạm cần rõ
          mục đích và tiếp nối được hành trình trước đó.
        </p>
        {slug === "brand" && (
          <>
            <h2>Ánh sáng. Vật liệu. Chiều sâu.</h2>
            <p>
              Ocean và teal tạo chiều sâu; pearl giữ không gian đọc thoáng.
              Champagne chỉ nhấn vào những chi tiết cần sự chú ý.
            </p>
            <div className="brand-palette">
              {[
                ["Deep Ocean", "#102633"],
                ["Luxury Teal", "#087C83"],
                ["Luminous Azure", "#4DAECB"],
                ["Champagne", "#D1A46B"],
                ["Pearl", "#F7F8F7"],
              ].map(([name, hex]) => (
                <div key={hex}>
                  <i style={{ background: hex }} />
                  <strong>{name}</strong>
                  <small>{hex}</small>
                </div>
              ))}
            </div>
            <h2>Cấu trúc mở</h2>
            <p>
              Biểu tượng A phát triển từ hai trụ xiên và một thanh ngang.
              Wordmark hình học giữ khoảng thở, dùng nhất quán trên nền Pearl và
              Deep Ocean.
            </p>
            <div className="panel">
              <ArtImage
                src="/brand/arvessa-primary.svg"
                alt="Logo trên nền sáng"
                width="500"
                height="100"
              />
            </div>
            <div className="panel" style={{ background: "#102633" }}>
              <ArtImage
                src="/brand/arvessa-primary-inverse.svg"
                alt="Logo trên nền tối"
                width="500"
                height="100"
              />
            </div>
            <p>
              Typography: Cormorant Garamond cho nội dung biên tập; Manrope cho
              giao diện nghiệp vụ. Logo giữ trạng thái concept dùng cho demo,
              chưa được xác nhận độc quyền.
            </p>
            <h2>Architecture studies</h2>
            <p>
              Ba nghiên cứu mở rộng ngôn ngữ kiến trúc: villa, duplex và tháp
              cao tầng. Đây là ảnh AI concept độc lập, không thuộc giỏ hàng dự
              án demo.
            </p>
            <div className="brand-studies">
              {[
                ["villa-study", "Villa / Garden architecture"],
                ["duplex-study", "Duplex / Light & volume"],
                ["tower-study", "Tower / Vertical rhythm"],
              ].map(([id, label]) => (
                <figure key={id}>
                  <ArtImage
                    src={`/images/library/${id}-1600.webp`}
                    alt={`Nghiên cứu AI ${label}`}
                    width={800}
                    height={500}
                    loading="lazy"
                    sizes="(max-width:700px) 90vw, 30vw"
                  />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
        <div className="info-box">
          ARVESSA hiện là bản trình diễn frontend. Không có doanh nghiệp, giải
          thưởng hoặc năng lực pháp lý thực tế nào được ngụ ý từ dữ liệu demo.
        </div>
      </main>
    );
  const title =
    slug === "privacy"
      ? "Quyền riêng tư trong demo."
      : slug === "terms"
        ? "Điều khoản sử dụng bản demo."
        : "Giữ căn và đặt cọc mô phỏng.";
  return (
    <main id="main" className="public-article">
      <p className="eyebrow">ARVESSA / DEMO INFORMATION</p>
      <h1>{title}</h1>
      {slug === "privacy" ? (
        <>
          <h2>Dữ liệu được lưu ở đâu?</h2>
          <p>
            Hồ sơ giả lập và tùy chọn giao diện được lưu bằng localStorage trên
            trình duyệt. Vai trò và thời hạn phiên demo nằm trong
            sessionStorage. Không lưu mật khẩu, nội dung tệp tải lên hoặc thông
            tin thanh toán.
          </p>
          <h2>Lịch sử khám phá</h2>
          <p>
            Theo dõi căn đã xem mặc định tắt. Bạn có thể bật trong Hồ sơ; khi
            tắt, lịch sử được xóa. Không gửi dữ liệu phân tích ra ngoài.
          </p>
          <h2>Đặt lại dữ liệu</h2>
          <p>
            Dùng nút Đặt lại demo trong Không gian cá nhân hoặc xóa dữ liệu
            trang của trình duyệt. Không nhập thông tin cá nhân thật vào bản
            trình diễn.
          </p>
        </>
      ) : slug === "terms" ? (
        <>
          <h2>Phạm vi sử dụng</h2>
          <p>
            Ứng dụng dùng để đánh giá thiết kế và luồng nghiệp vụ frontend. Các
            nội dung không phải đề nghị bán bất động sản, hợp đồng dịch vụ hay
            cam kết đầu tư.
          </p>
          <h2>Giới hạn</h2>
          <p>
            Phân quyền trình bày trên giao diện không phải bảo mật production.
            Dữ liệu không đồng bộ xuyên người dùng hoặc thiết bị. Quy trình giữ
            căn thật, xác thực và giao dịch cần hệ thống server riêng.
          </p>
          <h2>Tài nguyên</h2>
          <p>
            Hình kiến trúc và mô hình được dựng nguyên bản cho concept. Nội dung
            minh họa không thay thế bản vẽ, hồ sơ pháp lý hoặc khảo sát thực tế.
          </p>
        </>
      ) : (
        <>
          <h2>Điều kiện theo từng dự án</h2>
          {data.projects.map((p) => (
            <section key={p.id}>
              <h3>{p.name}</h3>
              <p>{p.policy.terms}</p>
              <p>
                Trạng thái mở demo: {p.policy.eligible ? "Có" : "Chưa"} · Số
                tiền mô phỏng: {money(p.policy.amount)}
              </p>
            </section>
          ))}
          <p>{data.cms.policy}</p>
          <h2>Giữ căn, thanh toán và hoàn</h2>
          <p>
            Giữ căn được xác nhận mới bắt đầu đếm ngược. Hết hạn sẽ mở lại căn,
            trừ hồ sơ thanh toán đang chờ đối soát. Yêu cầu gia hạn cần được
            duyệt trước khi hết hạn.
          </p>
          <p>
            Thanh toán gửi đi chưa phải xác nhận thành công. Giao dịch chưa biết
            kết quả cần nhân sự tài chính đối soát demo. Yêu cầu hoàn sau xác
            nhận cần duyệt; không có tiền thật được chuyển.
          </p>
          <h2>Hồ sơ và đơn vị nhận</h2>
          <p>
            {data.cms.company} chỉ là tên cấu hình demo. Không có tài khoản nhận
            tiền thật. Điều kiện pháp lý và giới hạn đặt cọc của dự án thực phải
            được xác minh trước khi tích hợp thương mại.
          </p>
        </>
      )}
      <p className="fine-print">
        Thông tin cho bản demo, cập nhật 15/11/2026. Không phải tư vấn pháp lý.
      </p>
    </main>
  );
}
