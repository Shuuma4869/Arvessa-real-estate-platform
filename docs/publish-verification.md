# Kiểm tra nguồn trước công bố GitHub

Ngày kiểm tra: **17/11/2026** (Asia/Saigon). Repository đích: [Shuuma4869/Arvessa-real-estate-platform](https://github.com/Shuuma4869/Arvessa-real-estate-platform). Tài liệu này ghi kiểm tra local trước push; kết quả đồng bộ remote được xác nhận riêng sau push, không suy ra từ QA local.

## Nguồn và lịch sử

Workspace `D:\ARVESSA`, Git root cùng đường dẫn. Đầu lượt: working tree sạch, nhánh `feat/arvessa-frontend`, HEAD `ae57d39040480871625e3844f286ef891eacff13`, chưa có remote. Bốn commit kế thừa: `d8f9ee8`, `25edbbe`, `ad51a92`, `ae57d39`. `main` local ở commit nền tảng, là tổ tiên của HEAD. Repository đích được kiểm tra public/default `main`, dung lượng 0, danh sách nhánh và `git ls-remote` trống trước khi chuẩn bị công bố.

Lần công bố chỉ cập nhật README, bàn giao, báo cáo, manifest và `.gitignore`. Không thay đổi mã frontend, dependency, lockfile, logo hoặc asset. Dự kiến chuyển `main` bằng fast-forward sau commit bàn giao, không reset/rebase/force-push. Giữ nguyên danh tính tác giả/committer trong lịch sử Git; danh tính Git là metadata công khai khi publish.

## Kiểm toán nội dung

- Quét toàn bộ blob reachable qua mọi local ref: 229 blob, trong đó 165 blob văn bản; rà soát tên file nhạy cảm và nội dung, không chỉ staged diff. 337 Git objects ở mốc kiểm tra nền.
- Không có Gitleaks/TruffleHog cài sẵn. Script kiểm tra mẫu private keys, GitHub/AWS/Google/OpenAI/Slack credentials, JWT, URL chứa user/password, và gán key/token/password trực tiếp. Không ghi giá trị nghi vấn vào log. Quét thêm commit metadata và staged files không có phát hiện. Không phát hiện mẫu bí mật; không có `.env`, key, dependency hoặc build cache được theo dõi.
- Đọc fixtures và luồng auth: email `.test`, số liên hệ/khách hàng, giá và giao dịch là dữ liệu giả lập. OTP `246810` là mã demo công khai. Ảnh QA đã chọn lọc là bằng chứng giao diện với dữ liệu demo, không phải screenshot desktop chứa tài khoản thật. Không có tài liệu khách hàng thật được xác định trong nguồn.
- Giữ 8 ảnh AI gốc, 25 WebP, SVG/logo/favicon và tài liệu nguồn. Có 35 file trong `apps/web/public`; toàn bộ được đối chiếu blob Git với bản xuất sạch (chuẩn hóa CRLF/LF theo Git). Cả 35 asset trả HTTP 200 và SHA-256 khớp tệp trong bản build sạch. Fonts đến từ npm lockfile; 3D và âm thanh được tạo bằng mã.
- Blob lớn nhất trong cả lịch sử: `docs/qa-evidence/landing.png`, 4.269.444 byte. Không có blob từ 100 MiB; chưa cần LFS. Không xóa hoặc giảm chất lượng asset.
- `.agent-work/` được ignore toàn bộ, bỏ theo dõi `.gitkeep` rỗng nhưng giữ tệp local. Lịch sử cũ chỉ có placeholder rỗng này, không có AI notes/log/browser/cache. Không viết lại lịch sử chỉ để loại placeholder.
- Không push `node_modules`, `.next`, logs, scratch, caches, trace/video/screenshot tạm, local backup hay credential. Bằng chứng nghiệm thu được giữ trong `docs/qa-evidence` có chủ đích.

Giới hạn: kiểm tra mẫu không chứng minh tuyệt đối không có bí mật hoặc dữ liệu riêng tư; không có entropy scan, xác minh credential với provider hoặc OCR tự động. Không dùng kết quả này như chứng nhận an ninh production.

## QA từ nguồn Git sạch

Xuất `git archive HEAD` vào thư mục tạm bị ignore, cài dependency bằng đúng lockfile. Không sao chép `node_modules`, `.next` hoặc asset bị ignore từ workspace. Browser binary riêng được tái sử dụng từ cache kiểm thử; ứng dụng không phụ thuộc cache đó.

| Kiểm tra | Kết quả thực tế |
|---|---|
| `npm --prefix apps/web ci` | PASS, 460 packages |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS, 54 domain + 7 component = 61 tests |
| `npm run build` | PASS, 24 trang static và các routes dynamic |
| Production runtime | Server riêng tại loopback cổng 3027 |
| `npm run test:e2e` | PASS, 35/35, một lượt, không retry/skip |
| GitHub Actions | Không có workflow trong nguồn; không tuyên bố CI PASS |

Chi tiết tên test, môi trường, asset integrity và số đo lab: [publish-verification.json](qa-evidence/publish-verification.json). Cả 135 file `apps/web` của bản đã kiểm thử khớp blob Git nguồn sau chuẩn hóa CRLF/LF. Git archive trên Windows có thể áp dụng CRLF; đây không phải thay đổi nội dung. Thay đổi sau QA chỉ là tài liệu và quy tắc ignore.

E2E gồm workflows đa vai trò, booking/payment/expiry/refund/contract/approvals, signup/OTP, CMS, Customer 360°, responsive/axe, carousel, raycast 3D, camera/day-night/reduced motion và fallback WebGL. Performance chỉ là lab local, không có dữ liệu người dùng thật. Script cũ ghi ngày baseline 16/11 trong payload performance; ngày chạy lần này là 17/11 theo `startTime` đổi sang Asia/Saigon, được ghi rõ trong JSON bàn giao.

`npm ci` cảnh báo ESLint 9.39.5 deprecated. Lint vẫn PASS; dependency được giữ nguyên để không mở rộng phạm vi publish. Chưa test thiết bị thật, Safari/Firefox hoặc production backend. Xem [known-limitations](known-limitations.md).

## Bàn giao

[Frontend handover](frontend-handover.md) tập hợp kiến trúc, route map, modules, demo roles, clean clone, simulations, visual/3D và thứ tự review. Sau push cần đối chiếu SHA local/main/remote, tree/assets/README, working tree và trạng thái Actions. Không dùng tài liệu chuẩn bị này thay bằng chứng push thực tế.
