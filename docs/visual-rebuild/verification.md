# ARVESSA — Visual Flagship Rebuild / kiểm chứng

Ngày kiểm chứng local: 17–18.11.2026 (Asia/Saigon). Workspace `D:\ARVESSA`, branch `design/arvessa-flagship-visual-v2`, kế thừa `main` tại `6ff0e721ad261cbaa6c21f68945f2055b86129b1`. Không tạo repository hay frontend thứ hai.

## Kết quả local

| Kiểm tra | Kết quả |
|---|---|
| TypeScript | PASS |
| ESLint | PASS |
| Production build | PASS, các route public/auth/buyer/CRM/management |
| Unit/component | 64/64 PASS |
| Playwright E2E | 39/39 PASS sau render recovery, 0 skipped, 0 flaky, 0 unexpected; 191,0 giây |
| Lịch sử review | Lượt 38/38 và 4/4 flagship trước đây được giữ trong evidence; lượt mới nhất chạy toàn suite 39 test |
| Nghiệp vụ | Buyer, 14 CRM modules, 8 Management modules, 9 vai trò; giữ căn, expiry/conflict, payment success/fail/pending/offline, hoàn tiền, đối soát, hợp đồng, phê duyệt |
| 3D | Raycast chọn kính có kiểm tra che khuất; tháp/tầng/căn; camera presets; drag; ngày/đêm; 2D fallback |
| Căn hộ | Ba layout, số PN/phòng tắm, diện tích không chồng lấn; dollhouse orbit; panorama nhìn quanh, chuyển phòng, context-loss fallback |
| Accessibility | Axe trên public/auth/workspace/brand và chế độ mặt bằng; bàn phím và reduced motion |

Lượt E2E đầu tiên phát hiện test click canvas bị nhãn tháp che, fixture căn 3 PN sai ID, và hai test contrast ở Landing. Đã sửa thao tác con trỏ thực, fixture A0304 và màu chữ; chạy lại bốn test rồi chạy toàn bộ 38 test PASS. Không hạ ngưỡng contrast, không bỏ test và không thay engine nghiệp vụ để qua kiểm thử.

Review screenshot cuối phát hiện nút tháp đang chọn có chữ trắng trên nền nhạt và toast lưu xuất hiện khi chỉ xem căn. Đã sửa contrast selected state, giữ dữ liệu view nhưng không phát notice mới, thêm test masterplan active. Cả bốn test flagship chạy lại PASS. Đã capture 41 ảnh cuối ở năm viewport; bộ masterplan/floorplan được chụp lại sau sửa. Các ảnh có thể xem tại `evidence/final`, kết quả từng viewport ở `runtime.json` và `review-fixes.json`.

Môi trường local: Windows, Node 25.8.1, npm 11.11.0, Chromium Headless Shell 159.0.8154.6. Một browser worker. Production loopback ở cổng 3037. Không khẳng định tương đương thiết bị iOS/Android thật hoặc Safari/Firefox.

## Đối chiếu sáu tham chiếu

| Ref | Kết quả thực | Bằng chứng cuối |
|---|---|---|
| REF-01 Spatial showroom | Hai tháp có slab/loggia/kính/lam/đồ ban công/vườn mái; điều khiển camera và chọn căn | `evidence/final/showroom-1440.webp`, `showroom-390.webp` |
| REF-02 Masterplan | Scene tổng thể WebGL, nhãn tháp, counts, chọn tháp/căn và mở Explorer đúng query | `evidence/final/masterplan-1440.webp`, `masterplan-390.webp` |
| REF-03 Editorial floorplan | Panel forest, thông số căn, plan 1/2/3 PN có nội thất, chọn phòng, pan/zoom | `evidence/final/floorplan-1440.webp`, `floorplan-390.webp` |
| REF-04 Coverflow | Năm thẻ perspective độc lập; drag có quán tính/snap, bàn phím, CTA từng dự án/căn | `evidence/final/coverflow-1440.webp`, `coverflow-390.webp` |
| REF-05 Dollhouse / 360 | Nội thất geometry thật; 12 panorama 4K từ cùng model; hotspot và minimap chuyển phòng | `evidence/final/dollhouse-1440.webp`, `tour-1440.webp`, bản mobile tương ứng |
| REF-06 Cinematic landing | Hero editorial, ba cảnh ảnh gốc, hotspot, câu chuyện kiến trúc, living, tiện ích và hành trình | `evidence/final/landing-1440.webp`, `landing-390.webp` |

Ảnh tham chiếu chỉ dùng để đối chiếu; không dùng làm asset sản phẩm và không đưa vào Git. Hình học có phong cách mô hình kiến trúc, chưa đạt độ chân thực như scan nội thất hay render offline ray tracing trong một số ảnh tham chiếu. Chất lượng tương tác được kiểm tra riêng với chất lượng hình ảnh; không dùng test PASS để tuyên bố độ chân thực tương đương ảnh ref.

## Hiệu năng

Ba browser context mới cho mỗi profile; DPR 1. Desktop 1440×1000, không throttle. Mobile 390×844: CPU ×4, RTT 100 ms, download 200.000 B/s. Số đo ở [performance.json](../qa-evidence/performance.json).

| Profile | LCP các lượt (ms) | CLS |
|---|---|---|
| Desktop local | 180 / 176 / 180 | 0,0524 |
| Mobile lab | 1848 / 1820 / 1784 | < 0,0001 |

Đây là lab local, không phải field p75/INP người dùng thật. WebGL tải theo nhu cầu; scene tòa nhà merge geometry theo vật liệu, giới hạn DPR/shadow cho mobile, ngừng vẽ khi không đổi camera/state hoặc tab ẩn. Đo scene Stillwater: 141 draw calls, 207.316 triangles, 48 inventory pickers. Chưa kiểm chứng FPS trên điện thoại thật.

## Tài sản và phạm vi

Logo Aperture có primary/horizontal/stacked, mark, favicon, social, nền sáng/tối và black/white. Hai concept khác được giữ tại `/brand`. Font local có dấu Việt; wordmark outline, có giấy phép font nguồn.

10 ảnh AI gốc / 31 WebP trong thư viện; thêm 12 PNG panorama gốc / 12 WebP tour. Catalog ghi nguồn, prompt (ảnh AI), camera (panorama), kích thước và SHA-256. Script `apps/web/scripts/render-tours.mjs` tái tạo panorama từ code gốc, không lấy panorama bên ngoài.

Không thay seed, mock transaction engine, role matrix hoặc storage contract. `.agent-work`, dependencies, build cache và tài liệu tham chiếu vẫn bị ignore. Không push hay merge vào `main` trong quá trình này.

## CI và bàn giao

### Khắc phục tải render trên CI — 18.11.2026

Lượt Ubuntu đầu tiên đạt 37/39 E2E. Hai bài 3D hết ngân sách 45 giây; trace ghi nhận riêng `mouseMove` 12 bước mất 40,94 giây ở showroom và 8 bước mất 10,19 giây ở dollhouse. Không có lỗi nghiệp vụ trong lượt này. [Run lỗi và artifact gốc](https://github.com/Shuuma4869/Arvessa-real-estate-platform/actions/runs/44071084770) được giữ để đối chiếu.

Đã cache shadow atlas cho scene có hình học/ánh sáng cố định, bỏ raycast hover khi đang kéo orbit, và chỉ vẽ lại dollhouse/panorama khi camera, phòng, kích thước hoặc texture thay đổi. Scene ngày/đêm vẫn được dựng lại với bóng tương ứng. Không giảm độ phân giải panorama, không thay mô hình bằng ảnh, không tăng timeout hoặc bỏ assertion để qua kiểm thử.

Sau sửa: typecheck, lint, build và **39/39 E2E local PASS** trong 191 giây. Kiểm tra riêng showroom/dollhouse/tour ở 1440 và 390 px xác nhận bộ đếm render đứng yên khi không thao tác, tăng sau đổi camera/phòng hoặc nhấn phím, rồi dừng lại. Sáu screenshot và `runtime.json` ở [render-recovery](evidence/render-recovery) ghi nhận không runtime error/overflow. Số render là bằng chứng ngừng vẽ khi idle, không phải số đo FPS trên điện thoại thật.

Workflow `frontend.yml` chạy npm ci, typecheck, lint, unit, build và toàn suite Playwright trên Ubuntu/Node 24. Browser cache đặt trong work directory bị ignore; report/trace lưu artifact bảy ngày. Cấu hình dựa trên tài liệu chính thức [checkout](https://github.com/actions/checkout) và [setup-node](https://github.com/actions/setup-node).

[PR #1](https://github.com/Shuuma4869/Arvessa-real-estate-platform/pull/1) mở vào `main`; xem [CI trên commit mới nhất](https://github.com/Shuuma4869/Arvessa-real-estate-platform/pull/1/checks). CI chạy cả 39 E2E, gồm test masterplan bổ sung. PR được giữ draft trong thời gian xác minh và chỉ chuyển ready sau khi checks đạt. Không tự merge.

Lần push source đã xác minh SHA local/remote trùng nhau; `main` vẫn ở baseline `6ff0e721ad261cbaa6c21f68945f2055b86129b1`. Kiểm tra 215 đường dẫn thay đổi không phát hiện credential, file môi trường, `.agent-work` hoặc ảnh tham chiếu được đưa lên repository.
