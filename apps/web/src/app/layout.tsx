import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/cormorant-garamond";
import "./globals.css";
import "../design-system/visual.css";
import "../design-system/flagship.css";
import Providers from "@/components/providers";
import { brand } from "@/lib/brand";
export const metadata: Metadata = {
  title: {
    default: "ARVESSA — Architecture · Vision · Experience",
    template: "%s | ARVESSA",
  },
  description: brand.description,
  icons: { icon: "/brand/favicon.svg" },
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Chuyển đến nội dung
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
