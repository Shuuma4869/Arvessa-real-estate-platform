# Bàn giao kiểm toán frontend ARVESSA

Ngày chuẩn bị: 17/11/2026. **ARVESSA — Architecture · Vision · Experience**. Mục tiêu: kiểm toán độc lập frontend hiện có trước khi quyết định nâng cấp. Không xem bản demo này là hệ thống production.

## Điểm bắt đầu

- [README](../README.md): clean clone, cài đặt, development, production, dừng server và tests.
- [Kiến trúc](architecture.md): các tầng mã, dữ liệu, commands và điểm thay mock adapter.
- [Route map, chín vai trò, walkthrough](routes-and-demo.md).
- [Giới hạn](known-limitations.md), [QA nền tảng](qa-report.md), [QA thị giác](visual-qa-report.md), [QA trước publish](publish-verification.md).

## Kiến trúc và phạm vi

Một ứng dụng `apps/web`, năm route groups `(public)`, `(auth)`, `(buyer)`, `(crm)`, `(management)`. Root scripts chuyển tiếp bằng `npm --prefix`, không cần npm workspace symlink. Next.js App Router/React/TypeScript strict; Zustand, Zod, Three.js; Vitest/Testing Library/Playwright/axe. Mã nghiệp vụ đi từ feature → typed command → mock engine → browser store; domain giữ types, permissions và state transitions.

| Khu vực | Modules và luồng đã triển khai |
|---|---|
| Public | Landing, khám phá/lọc URL, dự án, căn hộ, so sánh, tài chính, gallery/masterplan, 3D, liên hệ, hẹn xem, journal và trang thương hiệu/chính sách |
| Authentication | Đăng nhập, đăng ký, OTP, quên/reset mật khẩu và session demo |
| Buyer | Dashboard, properties, appointments, reservations, payments, contracts, profile, support |
| CRM | Dashboard, leads, customers/Customer 360°, pipeline, inventory, appointments, reservations, payments, contracts, tasks, support, marketing, reports, personal |
| Management | Dashboard, teams, approvals, inventory, finance, security, CMS, settings |

Route chi tiết và module keys nằm trong [routes-and-demo.md](routes-and-demo.md). Điểm kiểm tra chính: `/discover`, `/projects/stillwater`, `/properties/A0302`, `/explorer?project=stillwater&unit=A0101`, `/reserve/A0302`, `/buyer/dashboard`, `/crm/dashboard`, `/management/approvals`.

## Simulation và dữ liệu

Seed gồm ba dự án, 84 căn và hồ sơ giả lập; không có dữ liệu khách hàng thật. Store được lưu theo browser/origin. Giữ căn có idempotency, xung đột, giá thay đổi, hết hạn, gia hạn, hủy; payment hỗ trợ thành công/thất bại/chờ đối soát, hoàn và điều chỉnh cọc qua phê duyệt. Contract có checklist, review, version và ký mô phỏng. Các module dùng cùng trạng thái demo.

Đăng nhập bằng `minhanh@example.test`, mật khẩu demo có thể để trống; OTP `246810`. Vai trò: buyer, sales, leader, support, legal, finance, manager, admin, platform. Đổi role tại topbar. Đây là điều khiển trình diễn, không phải quyền server. Reset tại Buyer Profile hoặc CRM Personal. Chỉ nhập dữ liệu giả lập.

## Visual, motion và 3D cần đọc

- Logo SVG sáng/tối và favicon: `design/logo`, bản phục vụ trong `apps/web/public/brand`.
- Tokens và visual layer: `src/design-system`; hướng Blue Hour ghi ở [visual-direction](../design/visual-direction.md).
- 8 ảnh AI gốc, 25 WebP và prompts/hashes: [catalog](../assets/visual-library/catalog.html), [nguồn tài sản](visual-asset-library.md). Ảnh là concept, không phải ảnh hiện trạng dự án.
- `features/spatial/building-canvas.tsx`: mô hình procedural từ tower/floor/unit, raycast, OrbitControls, camera presets, ngày/đêm, vật liệu/ánh sáng/bóng, giới hạn DPR/FPS và cleanup. Không có GLB bị thiếu; mô hình được dựng bằng mã. Có bảng 2D/fallback khi WebGL không khả dụng.
- `features/marketing/carousel.tsx`, `project-visuals.tsx`, `design-system/visual.css`: carousel perspective, hotspots, gallery/dialog và motion. Có reduced motion. Âm thanh tổng hợp bằng Web Audio, mặc định tắt; không cần tệp audio ngoài.
- Fonts đóng gói trong dependencies theo lockfile, không cần tải từ Google Fonts khi chạy. `lib/visual-assets.ts` ánh xạ ảnh demo cũ sang ảnh mới mà không reset dữ liệu.

## Cách tái hiện QA

Clone `main` theo README, chạy `npm --prefix apps/web ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Tải browser bằng `npm run test:browser`, mở `npm run start` ở terminal riêng rồi chạy `npm run test:e2e`; dừng server bằng Ctrl+C. Không build lên `.next` của server đang chạy. Windows là môi trường đã kiểm chứng; chưa tuyên bố macOS/Linux/Safari/Firefox đã được test.

Bộ E2E kiểm tra booking/payment/expiry, refund và điều chỉnh cọc, legal/approval, chín vai trò, lead→Customer 360°, CMS, signup/OTP, offline, đồng bộ tab, responsive/a11y, carousel, WebGL raycast/2D fallback, camera presets/reduced motion, masterplan và persistence. Số lượng và kết quả chạy mới nhất ghi trong [publish-verification](publish-verification.md); báo cáo cũ được giữ theo mốc để đối chiếu.

## Ranh giới và ưu tiên review

Không có backend/database thật, auth production, tenant isolation, thanh toán, email/SMS, upload blob hay ký số thật. Role/session/guard/audit ở client có thể bị sửa bằng DevTools. Web Locks chỉ phối hợp cùng origin, không khóa giữa các thiết bị. Giá/chính sách là giả lập; ảnh, vị trí, mặt bằng và 3D không dùng làm hồ sơ xây dựng hoặc pháp lý.

Reviewer nên ưu tiên transition invariants, concurrency/idempotency, phạm vi role, lỗi/recovery, hydration/persistence, khả năng dùng bàn phím và cleanup WebGL. Hiệu năng hiện chỉ là lab local; chưa có field p75/RUM, thiết bị thật hoặc chứng nhận WCAG. Backend và nâng cấp tính năng nằm ngoài lần publish này.
