"use client";
import { useState } from "react";
const concepts = [
  ["aperture", "Architectural Aperture", "Một cổng không gian mở, bốn mặt phẳng xoay quanh tâm và một ngưỡng chuyển tiếp. Khoảng rỗng là tâm điểm, không phải nét chữ A."],
  ["monogram", "Spatial Monogram AV", "Các nét A/V chung một nhịp xiên. Gọn ở kích thước nhỏ nhưng còn gần monogram chữ cái thông dụng."],
  ["horizon", "Structural Horizon", "Ba lớp cao độ và một điểm ngắt. Mạch lạc trong enterprise, ít đặc trưng hơn khi đứng độc lập."],
];
export function BrandSpecimen() {
  const [inverse, setInverse] = useState(false);
  return <section className={`brand-specimen ${inverse ? "inverse" : ""}`} aria-label="Brand specimen ARVESSA">
    <div className="specimen-top"><div><p className="eyebrow">IDENTITY / ARCHITECTURAL ATELIER</p><h2>Mở một góc nhìn.</h2></div><button className="button secondary" aria-pressed={inverse} onClick={() => setInverse(!inverse)}>Nền {inverse ? "sáng" : "tối"}</button></div>
    <div className="logo-concepts">{concepts.map(([id, name, copy], i) => <article key={id}>
      <small>0{i + 1}{i === 0 ? " / SELECTED" : " / STUDY"}</small><img src={`/brand/concept-${id}.svg`} alt={`Concept ${name}`} width={96} height={96} /><h3>{name}</h3><p>{copy}</p>
    </article>)}</div>
    <div className="specimen-lockup"><img src={`/brand/arvessa-primary${inverse ? "-inverse" : ""}.svg`} alt="ARVESSA — Architectural Aperture" width={640} height={128} /><p>Architecture · Vision · Experience</p></div>
    <div className="specimen-sizes" aria-label="Kiểm tra mark ở kích thước nhỏ">{[16,24,32,48,96].map(size => <figure key={size}><img src={`/brand/arvessa-mark${inverse ? "-inverse" : ""}.svg`} alt={`Mark ${size} pixel`} width={size} height={size}/><figcaption>{size}px</figcaption></figure>)}</div>
    <div className="specimen-type"><p className="eyebrow">CORMORANT GARAMOND / MANROPE</p><h2>Ánh sáng định hình<br/><em>cách ta sống.</em></h2><p>Đường nét · Khoảng thở · Vật liệu · Trải nghiệm</p><span>01 — 84 / 107 m² / 8.240.000.000 ₫</span></div>
  </section>;
}
