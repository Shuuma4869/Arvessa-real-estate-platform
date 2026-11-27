# ARVESSA

![Logo ARVESSA](design/logo/arvessa-primary.svg)

**Architecture · Vision · Experience**  
*Luxury Architectural Digital Brand*

Nền tảng bất động sản cao cấp kết hợp khám phá không gian, hành trình người mua và CRM doanh nghiệp. Architecture tạo nền tảng; Vision định hướng quyết định; Experience nối toàn bộ hành trình sử dụng.

Đây là frontend demo gồm một ứng dụng Next.js + React + TypeScript tại `apps/web`. Workspace phát triển hiện tại là `D:\ARVESSA`; người dùng clone có thể chọn thư mục khác, ứng dụng không phụ thuộc đường dẫn này. Nhận diện **Architectural Aperture** và hướng **Architectural Atelier** kết hợp pearl, forest, bronze; các tài liệu Blue Hour cũ được giữ như lịch sử thiết kế. Bộ ảnh AI nguyên bản, ba concept so sánh và nguồn tài sản được lưu trong dự án.

Repository chính thức: [Shuuma4869/Arvessa-real-estate-platform](https://github.com/Shuuma4869/Arvessa-real-estate-platform), nhánh công bố `main`. Bắt đầu kiểm toán từ [bản bàn giao frontend](docs/frontend-handover.md) và [kiểm tra trước công bố](docs/publish-verification.md).

- [Visual Flagship Rebuild: audit, gates và bằng chứng](docs/visual-rebuild/gates.md).
- [Hai cảnh flagship và quy trình khôi phục nguồn Blender](docs/frontend-definitive/source-recovery.md). Mở `/spatial-review` để xem Stillwater và A0302. Các căn còn lại dùng mô hình nội thất theo loại căn.
- [12 panorama 4K nguyên bản](assets/residence-tours/catalog.json), dựng từ cùng mô hình nội thất của ba loại căn.
- [Ba visual directions](design/visual-concepts.html) và [lý do chọn Blue Hour](design/visual-direction.md).
- [Visual Asset Library](assets/visual-library/catalog.html): 10 ảnh gốc, prompt và 31 bản WebP, gồm crop hero riêng cho mobile.
- [Nguồn và phạm vi sử dụng ảnh](docs/visual-asset-library.md).
- [Nghiệm thu nền tảng](docs/qa-report.md) và [nghiệm thu nâng cấp thị giác](docs/visual-qa-report.md).

## Duyệt bản Frontend Definitive Edition

[Ảnh trước/sau và video tương tác](docs/frontend-definitive/review.html) · [Bản bàn giao, số đo và điều kiện nghiệm thu](docs/frontend-definitive/final-review.md)

## Chạy dự án

Cần Node.js 22.12+ và npm; môi trường kiểm thử dùng Node/npm ghi trong báo cáo QA. Không cần Docker, tài khoản dịch vụ hay biến môi trường bí mật.

Clone và chạy:

```powershell
git clone https://github.com/Shuuma4869/Arvessa-real-estate-platform.git ARVESSA
cd ARVESSA
npm --prefix apps/web ci
npm run dev
```

Nếu đã có bản clone, chạy các lệnh npm từ thư mục gốc hiện có. Không cần tạo lại dự án hoặc tự tạo `.env`.

Mở **http://127.0.0.1:3000**. Dừng bằng `Ctrl+C` ở terminal đang chạy server. Nếu cổng đã được dùng, dừng đúng server cũ hoặc chọn cổng khác:

```powershell
npm --prefix apps/web run dev -- --port 3001
```

Bản production local:

```powershell
npm run build
npm run start
```

Không chạy build trong khi đang dùng cùng thư mục `.next` để demo; dừng server trước khi build lại. Root package chuyển tiếp lệnh bằng `npm --prefix`, không cần workspace symlink trên Windows.

## Kiểm tra

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Chạy `npm run test:browser` một lần để tải Chromium Headless Shell riêng vào `.agent-work/browsers/`. E2E mặc định dùng browser sạch này, không dùng hồ sơ Chrome cá nhân. Có thể đặt `ARVESSA_BROWSER=chrome` để kiểm tra thêm bằng Chrome cài trên máy. Mở production server ở terminal riêng trước khi chạy kiểm thử; xem quy trình Windows ở cuối tài liệu. Có thể trỏ bộ kiểm thử sang cổng khác:

```powershell
$env:ARVESSA_TEST_PORT = '3001'
npm run test:e2e
Remove-Item Env:ARVESSA_TEST_PORT
```

Log, trace và HTML report nằm ở `.agent-work/`, không đưa vào Git. Bằng chứng chọn lọc để bàn giao ở `docs/qa-evidence/`. Script đo lab hiệu năng nằm trong bộ E2E; chỉ phản ánh máy và môi trường local đã ghi nhận, không phải dữ liệu Core Web Vitals ngoài thực tế.

## Trình diễn nhanh

1. Trang chủ → Khám phá → căn `A0302`; thử lọc, so sánh, gallery, tài chính và Spatial Explorer.
2. `/sign-in` → email `minhanh@example.test`, bỏ trống mật khẩu demo → chọn Buyer. OTP của quy trình signup/reset là `246810`.
3. Đặt lịch, thêm yêu thích, giữ căn và chọn kết quả thanh toán mô phỏng.
4. Chuyển Finance để đối soát, Legal để tạo hợp đồng; Manager/Admin để phê duyệt. Mọi thao tác dùng cùng dữ liệu.
5. Buyer Profile hoặc CRM Personal → **Đặt lại dữ liệu demo** → xác nhận để quay về dữ liệu ban đầu.

Chín vai trò: Buyer, Sales, Leader, Support, Legal, Finance, Manager, Company Admin, Platform Admin. [Routes, quyền và bốn walkthrough chi tiết](docs/routes-and-demo.md).

## Phạm vi và giới hạn

- Public Website, Authentication, Buyer Portal, 14 module CRM và 8 khu vực Management dùng chung layouts, components, domain và mock adapter.
- Dữ liệu liên kết gồm 3 dự án, 84 căn ban đầu, khách hàng, cơ hội, lịch hẹn, giao dịch, hợp đồng, công việc, tickets, chiến dịch và phê duyệt.
- Tương tác giữ căn có kiểm tra giá, xung đột, idempotency, countdown, hết hạn, hủy và gia hạn. Thanh toán có thành công, thất bại, chờ đối soát và hoàn demo.
- Mô hình 3D procedural hỗ trợ chọn căn, xoay/pan/zoom, lọc, ngày/đêm và bảng 2D. Carousel dùng perspective và pointer/keyboard. Âm thanh mặc định tắt.
- Authentication, phân quyền, audit, booking, thanh toán và ký hợp đồng **đều mô phỏng ở frontend**. Không thu tiền, gửi email/SMS hay lưu mật khẩu. Không có bảo mật server-side, đa tenant hoặc khóa giao dịch giữa các thiết bị.
- Dữ liệu nằm trong browser của từng origin. Đổi cổng là một vùng dữ liệu khác. Chỉ nhập thông tin giả lập. File upload chỉ giữ tên tệp; hình kiến trúc, mặt bằng và bản đồ là nghiên cứu minh họa.

[Kiến trúc và điểm tích hợp API](docs/architecture.md) · [Giới hạn và công việc tiếp theo](docs/known-limitations.md).

## Công nghệ và kiến trúc

Next.js 16.4.6 App Router, React 19.3.1, TypeScript 6.0.3; Zustand cho dữ liệu trình diễn, Zod cho validation, Three.js 0.187.0 cho WebGL, Lucide cho icon. Fonts Manrope/Cormorant Garamond được đóng gói qua npm và phục vụ local. Motion dùng CSS và chuyển camera trong Three.js. Kiểm thử dùng Vitest, Testing Library, Playwright và axe; phiên bản chính xác nằm trong `apps/web/package-lock.json`.

Năm route groups chia Public Website, Authentication, Buyer Portal, CRM Workspace và Management Console. Các feature modules dùng chung UI, domain, typed commands và mock adapter; không tách thành nhiều frontend.

## Lộ trình backend

1. Auth/session thật, tenant scope và kiểm tra quyền phía server.
2. Database transaction, giữ căn atomic, idempotency, server clock và cập nhật trạng thái qua SSE/WebSocket.
3. Payment provider sandbox, webhook xác minh, đối soát và hoàn tiền có audit bền vững.
4. Lưu trữ tài liệu theo quyền, versioning, ký điện tử và tích hợp CMS.
5. Kiểm thử đa thiết bị/trình duyệt, accessibility và đo hiệu năng người dùng thật.

Các mục này là công việc tiếp theo, chưa được triển khai trong bản frontend.

## Cấu trúc

```text
ARVESSA/
├── README.md
├── .gitignore
├── package.json
├── apps/
│   └── web/
│       ├── package.json, package-lock.json
│       ├── next.config.ts, tsconfig.json
│       ├── eslint.config.mjs, vitest.config.ts, playwright.config.ts
│       ├── public/{brand,images}/
│       ├── src/
│       │   ├── app/{(public),(auth),(buyer),(crm),(management)}/
│       │   ├── components/
│       │   ├── design-system/
│       │   ├── domain/
│       │   ├── features/{marketing,discovery,spatial,auth,buyer,reservation,crm,management}/
│       │   ├── lib/
│       │   └── services/{contracts,mocks}/
│       └── tests/{e2e}/
├── brand/{brand-overview,brand-voice,naming}.md
├── design/logo/
│   ├── logo-brief.md, logo-directions.md, logo-usage.md
│   ├── arvessa-primary.svg, arvessa-mark.svg, arvessa-monogram.svg
│   ├── arvessa-primary-inverse.svg, arvessa-mark-inverse.svg
│   └── favicon.svg
├── docs/
│   ├── repository-audit.md, architecture.md, routes-and-demo.md
│   ├── design-and-research.md, asset-register.md
│   ├── qa-report.md, visual-qa-report.md, known-limitations.md
│   ├── frontend-handover.md, publish-verification.md
│   └── qa-evidence/
├── assets/
├── packages/
├── services/
├── tests/
└── .agent-work/                 # bỏ qua trong Git
```

`packages`, `services`, `tests` ở root được bảo toàn từ nền tảng ban đầu; chưa thêm package/backend vào các thư mục này. Tests hiện hành ở `apps/web/tests`, asset được phục vụ ở `apps/web/public`; ảnh gốc và catalog nằm trong `assets/visual-library`. `.agent-work/` được tạo local khi chạy công cụ, không có trong source công bố.

## Nhận diện và quy tắc làm việc

Hướng logo chính là **Cấu trúc mở**: chữ A như nhịp kết cấu có khoảng rỗng, rõ ở giao diện số; monogram A/V là hướng phụ. Xem [brand overview](brand/brand-overview.md), [brand voice](brand/brand-voice.md), [naming](brand/naming.md) và [logo usage](design/logo/logo-usage.md).

Giữ tài liệu thiết kế gốc ở `design/`, ghi nguồn asset trong `docs/asset-register.md`, không commit secrets/dữ liệu thật/file tạm. `.agent-work/` dành cho nghiên cứu và kiểm tra tạm. Nhánh `main` dùng cho lần công bố đầu tiên; lịch sử triển khai từ `feat/arvessa-frontend` được bảo toàn bằng fast-forward.

### Quy trình E2E trên Windows

Để kiểm soát vòng đời server rõ ràng, mặc định Playwright dùng server đã mở, không tự tắt process npm trên Windows. Sau `npm run build`:

Terminal 1:

```powershell
npm --prefix apps/web run start -- --port 3002
```

Terminal 2:

```powershell
$env:ARVESSA_TEST_PORT = '3002'
npm run test:e2e
Remove-Item Env:ARVESSA_TEST_PORT
```

Dừng Terminal 1 bằng `Ctrl+C`. Trên CI có thể đặt thêm `ARVESSA_TEST_START=1` để Playwright quản lý production server; chỉ dùng khi runner hỗ trợ dọn process con. Không cần biến này để chạy demo.

Danh sách đầy đủ các file được bảo toàn và bổ sung: [file-manifest.md](docs/file-manifest.md).
