export type RoomKind =
  "living" | "kitchen" | "bedroom" | "bath" | "hall" | "balcony";
export interface ResidenceRoom {
  id: string;
  name: string;
  kind: RoomKind;
  x: number;
  z: number;
  w: number;
  d: number;
  area: number;
}
/** One spatial source for SVG, WebGL and panorama cameras. Areas are illustrative allocations. */
export function residenceLayout(beds: number, area: number) {
  const count = Math.min(3, Math.max(1, Math.round(beds))),
    width = 5.6 + count * 2.8,
    depth = 11.4;
  const rooms: ResidenceRoom[] = [];
  const push = (
    id: string,
    name: string,
    kind: RoomKind,
    x: number,
    z: number,
    w: number,
    d: number,
  ) => rooms.push({ id, name, kind, x, z, w, d, area: 0 });
  for (let i = 0; i < count; i++)
    push(
      `bedroom-${i + 1}`,
      `Phòng ngủ ${i + 1}`,
      "bedroom",
      (i * (width - 2.4)) / count,
      0,
      (width - 2.4) / count,
      4,
    );
  const baths = count === 1 ? 1 : 2;
  for (let i = 0; i < baths; i++)
    push(
      `bath-${i + 1}`,
      `Phòng tắm ${i + 1}`,
      "bath",
      width - 2.4,
      (i * 4) / baths,
      2.4,
      4 / baths,
    );
  push("hall", "Sảnh / lưu thông", "hall", 0, 4, width, 1.2);
  push("living", "Phòng khách", "living", 0, 5.2, width * 0.6, 4.4);
  push(
    "kitchen",
    "Bếp & phòng ăn",
    "kitchen",
    width * 0.6,
    5.2,
    width * 0.4,
    4.4,
  );
  push("balcony", "Loggia", "balcony", 0, 9.6, width, 1.8);
  const total = rooms.reduce((sum, r) => sum + r.w * r.d, 0);
  let assigned = 0;
  rooms.forEach((r, i) => {
    r.area =
      i === rooms.length - 1
        ? Math.round((area - assigned) * 10) / 10
        : Math.round(((area * r.w * r.d) / total) * 10) / 10;
    assigned += r.area;
  });
  return { beds: count, width, depth, area, rooms };
}
export type ResidenceLayout = ReturnType<typeof residenceLayout>;
