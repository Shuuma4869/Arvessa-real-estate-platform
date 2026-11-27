# Tiến độ bàn giao ARVESSA

| Phase | Kết quả và bằng chứng | Trạng thái |
|---|---|---|
| 0 · Khôi phục | Mốc f43b9df, sao lưu nguồn cũ, [route](route-inventory.md), [baseline](current-baseline.md). Commit 90d9687. | Đã kiểm tra |
| 1 · Nhận diện và chuyển động | Aperture, ba môi trường thị giác, điều hướng bằng bàn phím, reduced motion và menu mobile. [Hệ thiết kế](design-system.md). Commit 777baf4, ab5adaa và 40ec22c. | Đã kiểm tra tương tác |
| 2 · Sản xuất flagship | Hai cảnh Blender v2, Cycles, ảnh, nguồn đóng gói, GLB và giấy phép. [Khôi phục](source-recovery.md). Commit 381d2c4. | Đã kiểm nguồn và render; chờ duyệt mỹ thuật |
| 3 · Không gian 3D | Showroom, LOD thật, giữ căn khi đổi chế độ, tour tám phòng và fallback. [WebGL](evidence/realtime/runtime.json). Commit 777baf4. | Đã kiểm trên máy Windows |
| 4 · Trải nghiệm public | Landing, coverflow, bản đồ, tìm kiếm, xem nhanh, lưu và so sánh. [Đối chiếu sáu ảnh](visual-gap-matrix.md). Commit 777baf4. | Đã chạy desktop và mobile giả lập |
| 5 · Buyer và giao dịch | Xác minh, đổi lịch, thông báo, giữ căn, cọc, hoàn tiền và hợp đồng demo. [Kết quả theo nghiệp vụ](enterprise.md). Commit ab5adaa. | Đã kiểm trên dữ liệu mô phỏng |
| 6 · Doanh nghiệp | 14 module CRM, 8 module Management, cập nhật agenda, ràng buộc duyệt chiến dịch và điều phối theo vai trò. [Ma trận 270 lượt](evidence/module-permissions.json). Commit ab5adaa. | Đã kiểm quyền và hồi quy |
| 7 · Phủ toàn hệ thống | Mở 84 hồ sơ, ba loại căn mẫu, kiểm dữ liệu cũ, 6 GLB và số đo hiệu năng. [Kiểm căn](evidence/residences/checks.json). Commit 381d2c4, 777baf4 và ab5adaa. | Còn phép đo thiết bị thật |
| 8 · Bàn giao | Đóng gói ảnh trước/sau, video thao tác, quy trình phục hồi nguồn, hồi quy Chromium, smoke Firefox/WebKit và CI. [Báo cáo](final-review.md). | Chủ dự án duyệt RC tại PR #1 |

### 16 luồng công việc

| Luồng | Kết quả và cách kiểm |
|---|---|
| 01 · Identity | Aperture, typography, trạng thái UI, ba môi trường. [Design system](design-system.md) |
| 02 · Motion | Phím, kéo thẻ, giảm chuyển động, focus và khôi phục điều khiển. [E2E](../../apps/web/tests/e2e) |
| 03 · Landing | Ảnh lớn, hotspot thực, điểm đến dự án và chuyển góc nhìn. [Desktop](evidence/public/landing-1440.jpg) |
| 04 · Discovery | 84 căn, lọc dự án, sơ đồ theo tầng, so sánh và lưu. [Ảnh mobile](evidence/public/discover-390.jpg) |
| 05 · Blender | 2 nguồn đóng gói; 8 góc ngoại thất, cutaway, 8 panorama, 10 góc nội thất. [Phục hồi](source-recovery.md) |
| 06 · Showroom | GLB theo chất lượng, chọn căn, camera, 2D dự phòng. [Ảnh](evidence/public/showroom-1440.jpg) |
| 07 · Masterplan | Camera và nhãn tháp gắn bộ lọc, chọn B0402 xuyên route. [Mức hình học](evidence/public/inventory-lod.json) |
| 08 · Floorplan | Các layout theo số phòng ngủ, thông tin diện tích theo căn. [A0302](evidence/public/floorplan-1440.jpg) |
| 09 · Dollhouse | GLB của A0302 với chọn phòng; các căn khác dùng loại nội thất tương ứng. [Desktop](evidence/realtime/A0302-glb-1440.png) |
| 10 · Tour | Tám camera cùng cảnh và các lối chuyển theo cửa; các căn mẫu dùng panorama theo loại. [Đi thử](evidence/residences/walkthrough.webm) |
| 11 · Commerce | Mô phỏng giữ, hết hạn, cọc thành công/thất bại, đối soát, hoàn cọc và phê duyệt. [Nghiệp vụ](enterprise.md) |
| 12 · Buyer/Auth | Tài khoản demo, lịch, lưu căn, giao dịch, thông báo và tài liệu. [Dashboard](evidence/buyer-dashboard-desktop.jpg) |
| 13 · CRM | 14 module, liên kết Customer 360, pipeline, lịch cá nhân và báo cáo. [Kiểm nghiệp vụ](evidence/enterprise-workflows.json) |
| 14 · Management | 8 module, duyệt theo vai trò, điều phối, phân quyền và thiết lập. [Ma trận](enterprise.md) |
| 15 · Performance | Bốn phép đo xoay có GPU, kiểm LCP/CLS, mobile giả lập và fallback trên phần mềm. [Số đo](evidence/realtime/runtime.json) |
| 16 · Verification | Bộ test frontend, kiểm 84 hồ sơ, trình duyệt đa engine, ảnh, video, CI và checklist. [Bàn giao](final-review.md) |

[Những điểm còn cần đánh giá](blockers.md) · [Lộ trình nghiệm thu](next-actions.md)
