"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { brand } from "@/lib/brand";
import { useDemo } from "@/services/store";
import { stopSound } from "@/lib/sound";
export function PublicShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname(),
    { session, data, run } = useDemo();
  return (
    <>
      <header className={`public-header ${path === "/" ? "on-hero" : ""}`}>
        <Link href="/" aria-label="ARVESSA — Trang chủ">
          <img
            className="logo"
            src={brand.primary}
            alt="ARVESSA"
            width="240"
            height="48"
          />
        </Link>
        <nav className={open ? "open" : ""} aria-label="Điều hướng chính">
          <Link onClick={() => setOpen(false)} href="/discover">
            Bộ sưu tập
          </Link>
          <Link onClick={() => setOpen(false)} href="/projects/stillwater">
            Dự án
          </Link>
          <Link onClick={() => setOpen(false)} href="/about">
            Về ARVESSA
          </Link>
          <Link onClick={() => setOpen(false)} href="/journal">
            Góc nhìn
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={
              data.preferences.sound ? "Tắt âm thanh" : "Bật âm thanh"
            }
            onClick={() => {
              if (data.preferences.sound) stopSound();
              void run({
                type: "preferences",
                values: { sound: !data.preferences.sound },
              });
            }}
          >
            {data.preferences.sound ? (
              <Volume2 size={17} />
            ) : (
              <VolumeX size={17} />
            )}
          </button>
          <Link
            className="header-account"
            href={
              session
                ? `/${session.role === "buyer" ? "buyer" : "crm"}/dashboard`
                : "/sign-in"
            }
          >
            {session ? "Không gian của tôi" : "Đăng nhập"}
            <ArrowUpRight size={14} />
          </Link>
          <button
            className="icon-button mobile-menu"
            aria-label="Mở điều hướng"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {children}
      <footer className="public-footer">
        <div className="footer-top">
          <div>
            <img src={brand.inverse} alt="ARVESSA" width="240" height="48" />
            <p className="brand-line">{brand.line}</p>
            <p>
              Không gian tốt bắt đầu
              <br />
              từ một góc nhìn khác.
            </p>
          </div>
          <div>
            <h3>Khám phá</h3>
            <Link href="/discover">Bất động sản</Link>
            <Link href="/explorer">Không gian 3D</Link>
            <Link href="/compare">So sánh căn</Link>
            <Link href="/finance">Dự tính tài chính</Link>
          </div>
          <div>
            <h3>Kết nối</h3>
            <Link href="/contact">Liên hệ</Link>
            <Link href="/appointments">Đặt lịch tham quan</Link>
            <Link href="/faq">Câu hỏi thường gặp</Link>
            <Link href="/brand">Nhận diện thương hiệu</Link>
          </div>
          <div>
            <h3>Thông tin</h3>
            <Link href="/privacy">Quyền riêng tư</Link>
            <Link href="/terms">Điều khoản</Link>
            <Link href="/deposit-policy">Chính sách đặt cọc demo</Link>
            <Link href="/sign-in">Truy cập workspace</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ARVESSA · Bản trình diễn</span>
          <span>Dự án, hồ sơ và giao dịch đều là dữ liệu mô phỏng.</span>
        </div>
      </footer>
    </>
  );
}
