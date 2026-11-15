import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="error-page">
      <p className="eyebrow">ARVESSA · 404</p>
      <h1>
        Không gian bạn tìm
        <br />
        chưa có ở đây.
      </h1>
      <p>Đường dẫn có thể đã thay đổi. Hãy trở lại bộ sưu tập.</p>
      <Link className="button" href="/discover">
        Khám phá bất động sản
      </Link>
    </main>
  );
}
