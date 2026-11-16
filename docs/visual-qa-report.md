# ARVESSA — Blue Hour / Visual QA

**FRONTEND COMPLETE — VERIFIED FOR DEMO** · Kiểm thử 16/11/2026; hoàn tất bàn giao 17/11/2026.

Workspace: `D:\ARVESSA`. Nhánh `feat/arvessa-frontend`. Kế thừa mốc `ad51a92`; không khởi tạo lại repo, không sửa bản nguồn cũ trên ổ C.

## Bản nâng cấp

- Ba concept có thể so sánh trong [visual-concepts.html](../design/visual-concepts.html); chọn Blue Hour / Luminous Waterfront.
- Tám ảnh AI nguyên bản, 25 WebP tối ưu, prompt và nguồn được ghi trong [thư viện](visual-asset-library.md). Logo, brand line và font được kế thừa.
- Hero kiến trúc, navigation kính, carousel có phối cảnh, gallery và sơ đồ tổng mặt bằng có hotspot. Sơ đồ mở đúng bộ lọc tháp trong explorer.
- Property detail, login/register, Buyer Portal, CRM và Management dùng cùng token mới. Bảng nghiệp vụ dùng bề mặt đặc; giữ dark mode và các tùy chọn đã có.
- Three.js có vật liệu kính, environment reflection, bóng đổ, ánh sáng ngày/đêm và ba góc camera. Chọn tầng/căn, raycast, orbit, keyboard và fallback 2D vẫn hoạt động. Render giới hạn 30 FPS, DPR tối đa 1,5; dừng vẽ khi tab ẩn, giải phóng tài nguyên khi unmount.
- Motion phản hồi chuyển ảnh, hover và camera; giảm chuyển động theo hệ điều hành lẫn tùy chọn ứng dụng. Không video/sound tự phát.

## Kết quả kiểm thử

| Hạng mục | Kết quả |
| --- | --- |
| TypeScript | PASS; kiểm tra riêng và trong build |
| Lint | PASS |
| Production build | PASS, giữ nguyên route groups và các route nghiệp vụ |
| Unit/component | 61/61 PASS |
| E2E | 35 kịch bản có kết quả cuối PASS; xem cách chạy bên dưới |
| Responsive | Không tràn ngang ở 360, 390, 768, 1024, 1440, 1920 px trong bộ test |
| Accessibility tự động | Các lượt quét cuối không có vi phạm; public, auth, CRM, management, dark mode, project, brand và menu mobile |
| Runtime review | 18 lượt chụp route/viewport, không pageerror, ảnh hỏng hoặc tràn ngang |

Vòng chính: 31/35 PASS, phát hiện LCP mobile cao, tương phản giá chưa đủ và selector test tháp quá chặt. Sau khi sửa: 4/4 kịch bản bị ảnh hưởng PASS. Sau tinh chỉnh ánh sáng/bóng đổ: chạy lại 5/5 kịch bản 3D và accessibility mở rộng, đều PASS. Thay đổi cuối chỉ chỉnh chiều cao mặt bằng để bỏ khoảng trống thừa trên mobile; build lại và kiểm tra ảnh dự án desktop/mobile. Không dùng retry tự động để che lỗi. [verification.json](qa-evidence/visual/verification.json) ghi từng lượt và kết quả cuối của 35 kịch bản.

Các luồng hồi quy gồm đặt cọc/thanh toán thành công và thất bại, hết hạn giữ căn, hoàn tiền/phê duyệt, hợp đồng, CRM lead/pipeline, CMS, chín vai trò, Customer 360, lưu tùy chọn, mobile booking, camera, chọn căn và WebGL fallback. Lớp ánh xạ ảnh không reset dữ liệu đã lưu.

## Hiệu năng lab

Production loopback, Chromium Headless Shell 159, ba cold context cho mỗi cấu hình, DPR 1. Mobile: 390 × 844, CPU chậm 4 lần, RTT 100 ms, tải xuống 200.000 B/s.

| Chỉ số | Desktop | Mobile mô phỏng |
| --- | --- | --- |
| LCP | 200–288 ms | 1.884–1.920 ms |
| CLS | Khoảng 0,027 | 0 |

Giữ ngưỡng LCP ≤ 2.500 ms và CLS ≤ 0,1. Bản crop hero riêng giúp mobile tải khoảng 64 KB, giữ hình rõ khi hiển thị dọc. [Số đo đầy đủ](qa-evidence/performance.json). Đây là số đo local; không phải INP thực tế hay xác nhận hiệu năng trên mọi thiết bị.

## Đánh giá hình ảnh

Đã mở ứng dụng và xem screenshot thực tế của hero, trang dự án, căn hộ, auth, buyer, CRM, Kanban, management và explorer. Có bản desktop và mobile trong [bảng bằng chứng](qa-evidence/visual/index.html).

Các chỉnh sửa sau review: hero mobile dùng crop đúng tỷ lệ thay vì phóng lớn thumbnail; tách CTA khỏi thẻ 3D; tăng tương phản giá; thêm bóng đổ để mô hình đọc rõ khối; mặt bằng tự co chiều cao theo kích thước màn hình. Với carousel/thẻ căn trên mobile, lưu thêm ảnh viewport sau cuộn để kiểm tra quá trình tải ảnh và vẽ trên màn hình, không chỉ dựa vào ảnh toàn trang.

## Giới hạn

Ảnh AI và mô hình procedural là concept, không phải hiện trạng, mô hình BIM hoặc bản vẽ thi công. Chưa có video/360 và chưa kiểm tra iOS/Android vật lý, Safari/Firefox hay screen reader thật. Axe và viewport mô phỏng không thay thế đánh giá accessibility với người dùng. Backend, xác thực và thanh toán thật vẫn nằm ngoài phạm vi frontend demo.
