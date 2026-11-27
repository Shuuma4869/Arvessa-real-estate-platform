import type { Metadata } from "next";
import FlagshipReview from "@/features/spatial/flagship-review";
export const metadata: Metadata = {
  title: "Spatial Atelier — ARVESSA",
  description: "The Stillwater & A0302. Architecture · Vision · Experience.",
  robots: { index: false, follow: false },
};
export default function SpatialReviewPage() {
  return <FlagshipReview />;
}
