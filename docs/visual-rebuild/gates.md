# Visual Gates — nhật ký nghiệm thu

## Gate 0 — Baseline / hoàn tất kiểm toán

Commit `8c15b15`; [audit và gap matrix](audit.md). 20 ảnh trước ở bốn viewport, không lỗi runtime/overflow trong lượt capture. Bộ ref chỉ lưu local ignored. Đây là baseline chưa đạt chuẩn flagship, dù các kiểm thử nghiệp vụ cũ PASS.

## Gate 1 — Direction / đã triển khai và kiểm chứng

Architectural Aperture gồm bốn mặt phẳng quanh một khoảng mở hình thoi, có đường cắt giữa các phần; thay mark A cũ. Hai concept AV và Horizon được giữ để so sánh. Wordmark chuyển từ Cormorant Garamond 600 sang path với tracking riêng, font SIL OFL ghi nguồn. Có horizontal/stacked/light/dark/mark/favicon/social và clearspace/minimum-size trong [logo usage](../../design/logo/logo-usage.md).

[Design board](../../design/flagship-review-board.html) có hero mock, typography, màu và chuỗi cảnh. `/brand` có specimen thực: toggle sáng/tối, ba concept, mark 16/24/32/48/96 và tiếng Việt. Sau review đã bỏ silhouette giống mái nhà; chuyển thành bốn mặt phẳng tách rõ thay vì một viền hình thoi liền.

Bằng chứng: [desktop](evidence/gate-1/brand-1440.webp), [mobile](evidence/gate-1/brand-390.webp), [nền tối](evidence/gate-1/brand-dark-1440.webp), [direction board](evidence/gate-1/direction-board.webp). Playwright chạy app thật cổng 3037, toggle hoạt động, SVG tải được, không pageerror/overflow ở 1440/390. Typecheck/lint PASS. Chưa suy ra các gate 2–6 hoàn tất từ kết quả này.

## Gate 2 — Landing / coverflow đã kiểm chứng

Landing gồm hero chuyển ba cảnh, hotspot dẫn tới đúng căn, tìm kiếm, câu chuyện kiến trúc, bộ sưu tập năm thẻ, preview WebGL theo yêu cầu, tiện ích và hành trình khách hàng. Coverflow có perspective, kéo theo con trỏ, quán tính, snap, bàn phím và CTA riêng. Hai nội thất AI gốc cho loại căn một/hai phòng ngủ đã ghi prompt và hash trong catalog; không dùng ảnh tham chiếu làm asset.

Bằng chứng ở `evidence/gate-2`: desktop 1440/1920, mobile 390/360, hero và coverflow, runtime.json. Kiểm tra chuyển ảnh/hotspot/keyboard/drag/CTA và khởi động WebGL; không console error, HTTP lỗi hoặc overflow. Typecheck/lint PASS. Đã sửa lỗi SSR do module export trong phiên HMR cũ bằng kiểm tra lại trên server khởi động sạch, không che lỗi.

## Gates 3–6 — đang triển khai

Landing/coverflow, kiến trúc, không gian sống, enterprise và QA/PR còn phải nghiệm thu bằng tương tác cùng ảnh thực tế. Không đánh dấu frontend complete ở giai đoạn này.
