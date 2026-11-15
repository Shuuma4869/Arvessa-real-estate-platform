import { Property } from "./types";
export function filterProperties(properties: Property[], q: URLSearchParams) {
  const fields = [
    "projectId",
    "type",
    "direction",
    "view",
    "availability",
  ] as const;
  return properties
    .filter((p) => {
      if (
        q.get("q") &&
        !`${p.name} ${p.id}`
          .toLocaleLowerCase("vi")
          .includes(q.get("q")!.toLocaleLowerCase("vi"))
      )
        return false;
      if (fields.some((k) => q.get(k) && p[k] !== q.get(k))) return false;
      for (const k of ["beds", "baths", "floor"] as const)
        if (q.get(k) && p[k] !== Number(q.get(k))) return false;
      return (
        p.price >= Number(q.get("minPrice") || 0) * 1e9 &&
        p.price <= Number(q.get("maxPrice") || 100) * 1e9 &&
        p.area >= Number(q.get("minArea") || 0) &&
        p.area <= Number(q.get("maxArea") || 999)
      );
    })
    .sort((a, b) =>
      q.get("sort") === "price-desc"
        ? b.price - a.price
        : q.get("sort") === "area"
          ? b.area - a.area
          : a.price - b.price,
    );
}
