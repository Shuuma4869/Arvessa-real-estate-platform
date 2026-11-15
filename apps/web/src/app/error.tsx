"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="error-page">
      <h1>Chưa tải được không gian.</h1>
      <p>
        Dữ liệu demo đã lưu vẫn nằm trong trình duyệt. Bạn có thể thử tải lại.
      </p>
      <button className="button" onClick={reset}>
        Thử lại
      </button>
      <Link href="/" className="button secondary">
        Trang chủ
      </Link>
    </main>
  );
}
