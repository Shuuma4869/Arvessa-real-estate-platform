# Báo cáo nghiệm thu frontend ARVESSA

**Bản nâng cấp thị giác mới nhất:** xem [Visual QA — Blue Hour](visual-qa-report.md). Báo cáo bên dưới ghi lại mốc nền tảng; ảnh chụp ở `qa-evidence/` được cập nhật theo bản mới, số đo và kết quả mới được phân biệt trong báo cáo Visual QA.

**FRONTEND COMPLETE — VERIFIED FOR DEMO**

Ngày nghiệm thu: **16/11/2026**. Nhánh: `feat/arvessa-frontend`. Commit triển khai: `25edbbe`. Kết luận áp dụng bản demo local và các kịch bản bên dưới; không phải xác nhận production-ready, bảo mật server-side hoặc thanh toán thật.

## Kết quả kiểm tra

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| TypeScript strict | PASS, `tsc --noEmit` | `npm run typecheck` |
| ESLint | PASS | `npm run lint` |
| Production build | PASS, 24 trang static được sinh; các route động dùng App Router | `npm run build` |
| Unit/domain | 54/54 PASS | `apps/web/tests/domain.test.ts` |
| Component | 7/7 PASS | `apps/web/tests/components.test.tsx` |
| E2E | 31/31 PASS, không retry/skip | 27 kịch bản trong vòng chính + 3 kiểm tra bổ sung + 1 kiểm tra mobile; cùng bản production |
| Dependency audit | 0 vulnerabilities tại thời điểm kiểm tra | `npm --prefix apps/web audit --json` |
| Responsive | PASS trong phạm vi viewport đã kiểm tra | 360, 390, 768, 1024, 1440, 1920 px |
| Accessibility tự động | Không phát hiện vi phạm ở các màn hình được quét | axe WCAG 2 A/AA, 2.1 AA, 2.2 AA; cả workspace sáng/tối |
| Visual review | Đã xem ảnh desktop/mobile, CRM và 3D | `docs/qa-evidence/*.png` |

Môi trường: Windows, Node **25.8.1**, npm **11.11.0**, Next.js **16.4.6**, React **19.3.1**, Playwright **1.65.1**, Chromium Headless Shell **159.0.8154.6**. E2E cuối dùng browser riêng, profile mới cho từng test, server production loopback cổng 3002. Browser này được tải vào `.agent-work/browsers`, không đưa vào Git.

Dữ liệu có thể tái tạo bằng seed và thao tác reset. Tên test, thời gian thực thi và trạng thái từng lượt được trích từ JSON reporter tại [verification.json](qa-evidence/verification.json). Vòng bổ sung không sửa mã ứng dụng sau vòng chính; chỉ mở rộng kiểm chứng các nhánh WebGL fallback, vai trò, Customer 360° và mobile booking.

## Đối chiếu acceptance gates

| Gate | Phạm vi đã kiểm chứng | Trạng thái |
|---|---|---|
| A — Public | Landing, project/detail, bộ lọc/URL/empty state/quick view/compare; carousel keyboard; canvas raycast/drag/day-night; lịch hẹn và trùng giờ | VERIFIED FOR DEMO |
| B — Buyer | Sign-in 9 roles, signup/OTP/reset, hồ sơ, yêu thích qua reload, lịch hẹn, giữ căn, payment, hợp đồng, support, phiên hết hạn | VERIFIED FOR DEMO |
| C — Business | 14 module có route; lead CRUD/convert/pipeline, Customer 360° liên kết payment; inventory, waitlist, hợp đồng, reports CSV và workflows xuyên module | VERIFIED FOR DEMO |
| D — Management | Dashboard theo vai trò, Approval Center, phê duyệt/từ chối, teams, ma trận quyền/audit, cấu hình dự án thêm tầng, CMS và settings | VERIFIED FOR DEMO |
| E — Visual & Technical | Design tokens, nhận diện nguồn, 3D/2D fallback, motion/sound, 6 viewport, axe, lab performance, production build và bộ tests | VERIFIED FOR DEMO |
| F — Handover | README, kiến trúc, roles/routes/walkthrough, QA, JSON evidence, ảnh, giới hạn và điểm tích hợp API | VERIFIED FOR DEMO |

Phạm vi triển khai: Public Website; Authentication; Buyer Portal với 8 module; CRM với 14 module; Management với 8 khu vực, cùng một ứng dụng `apps/web`. Không nhân bản frontend hoặc xóa tài sản nền tảng. Logo primary/mark/monogram gốc và ba tài liệu brand được giữ nguyên.

## Luồng nghiệp vụ đã chạy trên trình duyệt

- Landing → project → đúng property; lọc và so sánh nhiều căn, quick view, trạng thái không có kết quả.
- Chọn căn trực tiếp bằng raycast trên canvas; kéo mô hình và đổi ngày/đêm; chọn bằng bàn phím; cố tình vô hiệu WebGL để xác nhận fallback 2D.
- Buyer thêm yêu thích và reload; tạo lịch hẹn, chặn trùng; đổi hồ sơ và hội thoại hỗ trợ.
- Giữ căn → thanh toán thành công → biên nhận. Xung đột không mở checkout; hết hạn giải phóng căn; mất kết nối có recovery.
- Payment thất bại có thể thử lại; pending phải qua Finance đối soát. Gia hạn do Buyer gửi xuất hiện ở Management và chỉ có hiệu lực sau phê duyệt.
- Cọc xác nhận → Legal tạo dự thảo → cập nhật checklist/version → gửi rà soát → quản lý duyệt → Legal ký demo → Buyer thấy hợp đồng, căn chuyển Đã bán.
- Yêu cầu hoàn bị từ chối giữ nguyên khoản cọc; gửi lại và phê duyệt mới hoàn/mở căn. Unit test còn xác nhận hủy hợp đồng chờ và đóng approval phụ thuộc khi hoàn.
- Finance gửi điều chỉnh số tiền → duyệt → Buyer và reservation nhận cùng số tiền; unit test chặn yêu cầu cũ khi đã bắt đầu hợp đồng.
- Lead → customer/opportunity → thay stage; Customer 360° thấy chính khoản cọc Buyer vừa tạo.
- Buyer đăng ký waitlist → Sales đánh dấu liên hệ; admin thêm tầng tạo đúng số căn trong inventory và bảng chọn 3D.
- Form tư vấn public xuất hiện ở CRM; CMS cập nhật hero thật; báo cáo tải file CSV chứa đúng mã căn.
- Mobile 390 px hoàn tất giữ căn/thanh toán; dialog lịch hẹn vừa màn hình, Escape đóng và trả focus về nút mở.

Domain tests bổ sung transition guards, idempotency, giá cũ, policy không đủ điều kiện, duplicate/merge, ownership, expiry, approval trễ, refund/adjustment, contract version locking, CSV escaping, privacy preferences và reset.

## Responsive và accessibility

Kiểm tra overflow trên landing, discovery, CRM leads và management inventory ở cả sáu viewport. Kiểm tra nav mobile, profile, modal và booking flow ở 390 px. Bảng dữ liệu dùng vùng cuộn riêng; không gây tràn toàn trang.

Axe quét `/`, `/sign-in`, `/sign-up`, `/discover`, `/properties/A0302`, `/explorer`, `/contact`, `/crm/dashboard`, `/crm/leads`, `/crm/pipeline`, `/management/approvals` và `/crm/personal` ở theme tối. Các lỗi contrast ở nội dung phụ và menu tối đã được sửa rồi quét lại.

Có kiểm tra Tab/keyboard carousel, tên accessible cho form/dialog, Escape/focus return, confirmation, async errors, reduced-motion và sound mặc định tắt/opt-in/mute. Không đồng nhất axe PASS với chứng nhận WCAG toàn diện; chưa kiểm tra screen reader và thiết bị thật.

## Hiệu năng đo được

Ba browser context mới cho mỗi cấu hình, không cache phiên trước, DPR 1. Desktop 1440×1000 không throttle. Mobile 390×844: CPU ×4, RTT 100 ms, download 200.000 byte/s, upload 100.000 byte/s. Phép đo dùng PerformanceObserver và thao tác carousel thật.

| Cấu hình | LCP của 3 lần đo | CLS lớn nhất | Event Timing lớn nhất |
|---|---|---|---|
| Desktop local | 192 / 236 / 204 ms | 0,0222 | 80 ms |
| Mobile lab | 1236 / 1256 / 1228 ms | 0 | 88 ms |

LCP và CLS đạt mục tiêu **trong các mẫu lab này**. Event Timing là thời lượng tương tác đã quan sát, không phải INP field p75. Chưa có người dùng thật/RUM để kết luận INP hoặc Core Web Vitals ngoài thực tế. Dữ liệu gốc, thông số và long tasks ở [performance.json](qa-evidence/performance.json).

Đã loại bỏ loading boundary bao toàn public landing và animation trì hoãn ảnh hero; các workspace và màn hình cần Suspense vẫn có loading. Three.js chỉ tải ở explorer, pixel ratio giới hạn 1.5; geometry/material/renderer/controls/observer/frame được dọn khi rời trang. Không tuyên bố đã chứng minh không rò bộ nhớ bằng profiler dài hạn.

Các vòng đầu bằng Chrome cài trên máy có tài nguyên do môi trường browser chèn thêm. Vòng nghiệm thu dùng Chromium sạch; không dùng số cũ để so sánh trực tiếp mức cải thiện giữa hai môi trường.

## Bằng chứng và cách chạy lại

- [Hero desktop](qa-evidence/hero.png), [hero mobile](qa-evidence/mobile-hero.png).
- [Landing đầy đủ](qa-evidence/landing.png), [CRM](qa-evidence/crm.png), [Spatial Explorer](qa-evidence/explorer.png).
- [Danh sách kết quả](qa-evidence/verification.json), [số đo performance](qa-evidence/performance.json).
- Tests tái chạy bằng scripts trong [README](../README.md). `npm run test:browser` cài browser riêng; `npm run build`, mở `npm run start` trong một terminal rồi chạy `npm run test:e2e` ở terminal khác. Port phải trùng `ARVESSA_TEST_PORT` nếu chọn khác 3000.

Các lỗi trong vòng phát triển được sửa và kiểm tra lại; log/trace tạm được giữ trong `.agent-work/` để không làm lộn repo. Không có blocker UI nghiêm trọng còn biết trong các kịch bản nghiệm thu. Các ranh giới mock, chưa có backend, upload tên file, tài sản concept và kiểm thử thiết bị thực được liệt kê ở [known-limitations.md](known-limitations.md).
