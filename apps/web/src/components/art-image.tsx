import { ImgHTMLAttributes } from "react";
import { resolveVisual } from "@/lib/visual-assets";
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  projectId?: string;
};
export function ArtImage({ src, projectId, sizes, alt, ...props }: Props) {
  const resolved = resolveVisual(src, projectId);
  const responsive = resolved.startsWith("/images/library/");
  const portrait = /penthouse|tower-study/.test(resolved);
  const widths = portrait ? [480, 800, 1024] : [480, 800, 1600];
  return (
    <img
      {...props}
      src={resolved}
      alt={alt ?? ""}
      decoding={props.fetchPriority === "high" ? "sync" : "async"}
      srcSet={
        responsive
          ? widths
              .map(
                (w, i) =>
                  `${resolved.replace("-1600.webp", `-${i === 2 ? 1600 : w}.webp`)} ${w}w`,
              )
              .join(", ")
          : undefined
      }
      sizes={
        responsive
          ? sizes || "(max-width: 700px) 100vw, (max-width: 1100px) 60vw, 45vw"
          : undefined
      }
    />
  );
}
