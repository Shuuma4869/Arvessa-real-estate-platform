const library = "/images/library/";
export const visualAssets = {
  stillwater: `${library}stillwater-blue-hour-1600.webp`,
  cedar: `${library}cedar-courtyard-1600.webp`,
  horizon: `${library}horizon-coast-1600.webp`,
  interior: `${library}stillwater-penthouse-1600.webp`,
  pool: `${library}stillwater-pool-1600.webp`,
  villa: `${library}villa-study-1600.webp`,
  duplex: `${library}duplex-study-1600.webp`,
  tower: `${library}tower-study-1600.webp`,
};
// Resolve legacy demo imagery at presentation time; keep saved CRM data intact.
export function resolveVisual(src: string, projectId?: string) {
  const defaults: Record<string, string> = {
    stillwater: "/images/residence-exterior.svg",
    cedar: "/images/residence-courtyard.svg",
    horizon: "/images/residence-exterior.svg",
  };
  if (projectId && src === defaults[projectId])
    return visualAssets[projectId as "stillwater" | "cedar" | "horizon"];
  const legacy: Record<string, string> = {
    "/images/residence-exterior.svg": visualAssets.stillwater,
    "/images/residence-interior.svg": visualAssets.interior,
    "/images/residence-courtyard.svg": visualAssets.pool,
  };
  return legacy[src] || src;
}
export function projectGallery(id: string, src: string) {
  return id === "stillwater"
    ? [resolveVisual(src, id), visualAssets.interior, visualAssets.pool]
    : [resolveVisual(src, id)];
}
