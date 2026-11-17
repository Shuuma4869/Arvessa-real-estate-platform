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

## Gate 3 — Kiến trúc / đã kiểm chứng tương tác

Thay stack hộp bằng scene gốc có slab, loggia, kính, mullion, rèm, đồ ban công, pergola, vườn mái, cây, hồ và đường dạo. Hình học tĩnh merge theo vật liệu; 48 vùng kính của Stillwater gắn đúng ID inventory. Raycast kiểm tra phần che khuất, hover có thông tin căn, nhãn tháp chọn được, filter tháp/tầng/căn đồng bộ URL. Góc phối cảnh/mặt đứng/aerial, ngày/đêm, kéo/zoom/pan và fallback 2D giữ lựa chọn. Masterplan dùng lại scene thật với chế độ aerial, không dùng ảnh thay mô hình.

Đã capture desktop/mobile tại `evidence/gate-3`. Scene đo 141 draw calls và 207.316 triangles trong phiên capture; mobile DPR giới hạn 1 và shadow 1024. Rendering dừng khi camera/state đứng yên và tab ẩn. Chưa dùng các con số draw calls này để tuyên bố FPS trên thiết bị thật.

## Gate 4 — Không gian sống / đã kiểm chứng tương tác

Ba layout theo 1/2/3 PN; loại 1 PN có một phòng tắm, 2/3 PN có hai. SVG có nội thất, nhãn diện tích, chọn phòng, zoom và pan. Một nguồn dữ liệu phòng dùng cho SVG, dollhouse và camera panorama; kiểm thử phát hiện phòng chồng lấn hoặc tổng diện tích sai. Dollhouse có geometry nội thất, orbit/zoom, raycast và camera focus theo phòng.

12 panorama 4K 2:1 gốc đã render bằng CubeCamera từ cùng nội thất, bốn điểm nhìn mỗi loại căn. Viewer sphere WebGL thực có drag/touch/phím, zoom, chuyển phòng, minimap, reset/fullscreen và fallback khi mất context/tải ảnh lỗi. Có PNG nguồn, WebP, hash và script tái tạo ở `assets/residence-tours`. Đây là mô hình kiến trúc minh họa, không phải scan photoreal hoặc walkthrough có vật lý.

`evidence/gate-4` có 2D/dollhouse/tour desktop và mobile; không pageerror/HTTP lỗi/overflow. Đã sửa số phòng tắm, tương phản panel và góc camera sau xem screenshot. Gallery AI được phân biệt rõ với hình học mô hình.

## Gate 5 — Enterprise / đã kiểm chứng

Preview căn theo loại phòng được dùng trong CRM inventory và ReservationCard, đồng thời xuất hiện trong Buyer và Customer 360 qua component dùng chung. Link mở đúng hồ sơ 2D/3D/360. Không sửa engine giao dịch, seed, permission matrix hoặc storage contract. Bảng dữ liệu giữ bề mặt rõ nét; brand line không được thêm vào các hàng dữ liệu.

## Gate 6 — Local PASS / CI và PR

Typecheck, lint, production build và 64 unit/component tests đã PASS. Toàn suite 38 E2E PASS, không skipped/flaky. Sau review cuối đã sửa màu nút tháp đang chọn và bỏ toast cho thao tác tự ghi nhận lượt xem; bổ sung một test masterplan, chạy lại cả bốn test flagship PASS (suite hiện có 39 test). 41 screenshot trên 1440/1920/768/390/360, không lỗi runtime/overflow; ảnh masterplan/floorplan được capture lại sau chỉnh sửa. Chi tiết ở [verification](verification.md).

Đã mở [PR #1](https://github.com/Shuuma4869/Arvessa-real-estate-platform/pull/1) vào `main`. [Checks của commit mới nhất](https://github.com/Shuuma4869/Arvessa-real-estate-platform/pull/1/checks) chạy toàn suite 39 E2E trên Ubuntu/Node 24. Trạng thái remote được lấy từ checks thực tế, không suy ra từ kết quả local. Không tự merge vào main.
