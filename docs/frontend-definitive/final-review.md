# ARVESSA · Frontend Definitive Edition

**Release Candidate để chủ dự án duyệt.** Bản giao nối hành trình từ chọn dự án và căn hộ đến tham quan, giữ căn, đặt cọc mô phỏng và xử lý hồ sơ ở CRM/Management. Hai cảnh có nguồn kiến trúc riêng là The Stillwater và A0302. [Phòng duyệt trước/sau](review.html) · [Checklist nghiệm thu](next-actions.md)

### Chạy demo

Từ PowerShell tại `D:\ARVESSA`, dùng Node 24 và npm.

```powershell
npm --prefix apps/web ci
npm --prefix apps/web run build
npm --prefix apps/web run start -- --port 3045
```

Mở `http://localhost:3045/`, chọn `/spatial-review` để đổi render/GLB, hoặc `/properties/A0302` để đi qua tám phòng. Vào `/sign-in` để chọn vai trò demo. Để chạy kiểm thử trình duyệt từ terminal thứ hai, đặt `$env:ARVESSA_TEST_PORT='3045'`, cài trình duyệt theo [workflow](../../.github/workflows/frontend.yml) vào `.agent-work/browsers`, rồi chạy `npm --prefix apps/web run test:e2e`. Đổi engine bằng `ARVESSA_E2E_ENGINE`. Lệnh độc lập kiểm toàn bộ căn là `node apps/web/scripts/verify-residences.mjs`.

### Phạm vi và bằng chứng

Một ứng dụng Next.js + TypeScript tại `apps/web` dùng route groups cho Public, Auth, Buyer, CRM và Management. Các lệnh nghiệp vụ có kiểu dữ liệu, đi qua mock service và state machine giữ căn. Dữ liệu mô phỏng lưu theo trình duyệt, có xử lý phiên bản cũ và phiên bản chưa hỗ trợ. [Kiến trúc](../architecture.md) · [Route](route-inventory.md)

| Phạm vi | Kết quả |
|---|---|
| Public và không gian | 3 dự án, 84 hồ sơ mở trực tiếp. Stillwater giữ 48 vị trí tương tác. Chuyển từ B0402 trong masterplan sang Explorer vẫn đúng căn. [Dữ liệu LOD](evidence/public/inventory-lod.json) |
| A0302 | 107 m², tầng 3 tháp A, hai phòng ngủ và hai phòng tắm. Tám camera trong cùng cảnh Blender, mười góc nội thất và một cutaway; đã đi qua hotspot ở từng camera trong Chromium. 83 căn khác dùng nội thất mẫu theo số phòng ngủ. [Kiểm 84 căn](evidence/residences/checks.json) · [Ảnh và thông số](evidence/room-tour.json) |
| Stillwater | Tám ảnh 1600 × 1068, hai tháp, sảnh vào, cảnh quan và mặt nước. 16 lượt đổi ảnh desktop/mobile giải mã đúng WebP. [Nguồn, thời gian và ảnh trước/sau](spatial-production.md) |
| Vận hành | 9 vai trò, 14 module CRM và 8 module Management; kiểm 270 cặp vai trò/route, 118 được vào và 152 bị giới hạn. Xuất đúng 48 dòng CSV Stillwater, kiểm duyệt campaign, chuyển lịch A0302 và giữ thiết lập khi đổi màn. [Ma trận](enterprise.md) |
| Trợ năng | Điều hướng phím, reduced motion, focus menu, tình huống mất WebGL và chọn căn qua 2D nằm trong E2E. Đã kiểm reflow ở 390 và 640 CSS px trên bốn trang, 22 lượt Tab/Shift+Tab trong menu mobile và Escape trả focus về nút mở. [Biên bản keyboard](evidence/keyboard-reflow.json). VoiceOver/TalkBack trên thiết bị vật lý còn mở. |
| Nguồn và quyền | Blender 4.5.9 LTS, Cycles, glTF Transform, Meshopt, Poly Haven/ambientCG CC0 và GlamVelvetSofa CC BY 4.0. Hai bản Blender đóng gói đã mở lại. [Manifest và phục hồi](source-recovery.md) |

### Hiệu năng quan sát

Chromium 159 headless chạy trên Ryzen 7 6800H và GPU AMD Radeon qua D3D11. Mỗi mẫu xoay khoảng 5 giây. Số bộ nhớ texture là ước lượng; số tam giác và draw call do renderer báo cho khung đã đo.

| Cảnh · tier | Canvas | FPS | Frame p95 | Từ bắt đầu tải đến khung đầu | Draw call | Tam giác |
|---|---:|---:|---:|---:|---:|---:|
| Stillwater · balanced | 1036 × 714 | 60,00 | 18 ms | 1.972 ms | 77 | 1.991.928 |
| Stillwater · light | 350 × 350 | 60,01 | 18 ms | 638 ms | 77 | 1.440.267 |
| A0302 · balanced | 1036 × 714 | 60,01 | 18 ms | 671 ms | 40 | 425.824 |
| A0302 · light | 350 × 350 | 60,00 | 17,9 ms | 196 ms | 40 | 207.784 |

Viewport nhỏ dùng cùng GPU máy bàn. Stillwater nhẹ vẫn tải 18,71 MB; bản cao 26,66 MB. A0302 từ 4,75 đến 12,82 MB. Bản đồ chọn căn riêng giảm từ 207.316 xuống 119.300 tam giác và vẫn nhận đủ 48 căn. Các số này phụ thuộc camera, thiết bị, cache và đường truyền. [Raw WebGL](evidence/realtime/runtime.json) · [Sáu mẫu LCP, CLS và độ trễ sự kiện](../qa-evidence/performance.json) · [Kết quả kiểm GLB](../../apps/web/public/spatial-flagships/verification.json)

Ở ba lượt tải nguội mỗi cấu hình, LCP desktop nằm trong khoảng 248–264 ms. Mobile giả lập đạt 1844–1860 ms. Sau khi thay lớp blur toàn cảnh bằng gradient lấy màu từ ảnh và bỏ làm mờ sau từng thẻ đang xoay, p75 của các sự kiện được ghi trên desktop đổi từ 464 ms xuống 224 ms. Đây là số đo lab cho hai thao tác đổi thẻ, có ngưỡng ghi 16 ms và chưa có INP từ khách truy cập thực. [So sánh hai lượt chạy](evidence/coverflow-timing.json)

### Kiểm thử và quyết định phát hành

Typecheck, lint, build production và 72 test unit/component đã chạy ở máy Windows. Suite Chromium có 50 bài với một worker. Firefox và WebKit mỗi engine đã chạy bốn luồng gồm discovery, lưu căn, quyền chín vai trò và quy trình đặt cọc đến hợp đồng. Workflow Linux kiểm lại mã nguồn được đề xuất để nhập vào main. [PR #1 và trạng thái CI theo commit](https://github.com/Shuuma4869/Arvessa-real-estate-platform/pull/1/checks)

Lịch sử triển khai từ f43b9df trên nhánh `design/arvessa-flagship-visual-v2` có trong [tracker chín phase và 16 luồng](implementation-tracker.md). Khi cần định danh bản giao, chạy `git rev-parse HEAD` rồi đối chiếu headRefOid của PR. [Trạng thái thực thi](execution-state.json)

Phần cần chủ dự án quyết định là mức hoàn thiện hình ảnh so với sáu ảnh gốc, đặc biệt độ biến thiên cây xanh, kính, đồ đạc hai phòng ngủ và hai phòng tắm. Cần điện thoại vật lý cho kiểm nhiệt, bộ nhớ và trợ năng cảm ứng. [Đối chiếu hình](visual-gap-matrix.md) · [Các điều kiện còn mở](blockers.md)
