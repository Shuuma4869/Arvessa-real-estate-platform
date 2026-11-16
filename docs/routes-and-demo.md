# Routes và hướng dẫn trình diễn

## Bản đồ đường dẫn

| Khu vực | Routes |
|---|---|
| Public | `/`, `/discover`, `/projects/[id]`, `/properties/[id]`, `/explorer`, `/compare`, `/finance` |
| Nội dung | `/about`, `/brand`, `/contact`, `/journal`, `/journal/[id]`, `/faq`, `/privacy`, `/terms`, `/deposit-policy`, `/appointments` |
| Tài khoản | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify` |
| Giữ căn | `/reserve/[id]` |
| Buyer | `/buyer/dashboard`, `properties`, `appointments`, `reservations`, `payments`, `contracts`, `profile`, `support` |
| CRM (14 module) | `/crm/dashboard`, `leads`, `customers`, `pipeline`, `inventory`, `appointments`, `reservations`, `payments`, `contracts`, `tasks`, `support`, `marketing`, `reports`, `personal` |
| Management | `/management/dashboard`, `teams`, `approvals`, `inventory`, `finance`, `security`, `cms`, `settings` |

Tên module sau dấu phẩy giữ nguyên prefix ở đầu hàng. URL không có module chuyển về dashboard. Route không tồn tại có trang 404; sai quyền có màn hình từ chối. Tên dự án: `stillwater`, `cedar`, `horizon`. Mã căn ví dụ: `A0302`, `B0402`, `C0101`, `D0101`.

## Tài khoản demo

Mở `/sign-in`, dùng email `minhanh@example.test`, có thể để trống mật khẩu demo và chọn vai trò. Không có credential production. OTP mô phỏng cố định `246810`. Password chỉ nằm trong state của form và bị bỏ sau khi chuyển bước.

| Vai trò | Trọng tâm thao tác |
|---|---|
| Buyer | Khám phá, yêu thích, hẹn xem, giữ căn, thanh toán demo, hồ sơ, hỗ trợ |
| Sales Agent | Leads, Customer 360°, pipeline, giỏ hàng, hẹn xem, giữ căn, công việc |
| Sales Team Leader | Quản lý nhóm và duyệt gia hạn |
| Customer Support | Tickets, lịch hẹn, thông tin khách hàng trong phạm vi |
| Legal Officer | Checklist, dự thảo, rà soát và ký hợp đồng demo |
| Finance Officer | Đối soát giao dịch chờ xác minh, duyệt hoàn |
| Sales Manager | Điều hành, phê duyệt và báo cáo |
| Company Admin | Nhân sự/vai trò, CMS, thiết lập và toàn bộ module demo |
| Platform Admin | Trình bày quyền quản trị nền tảng trong cùng workspace demo |

Chuyển role ở topbar chỉ dành cho trình diễn. Buyer mở trực tiếp URL CRM vẫn bị chặn trình bày. Phiên tồn tại trong tab và hết hạn sau 60 phút. Refresh giữ dữ liệu demo; tab khác cùng origin nhận thay đổi dữ liệu, nhưng role/session của mỗi tab độc lập.

## Walkthrough 1 — Khám phá đến đặt cọc

1. Mở trang chủ; thử carousel bằng nút, kéo hoặc phím mũi tên.
2. Tìm căn ở `/discover`. Thử nhiều bộ lọc; URL cập nhật để lưu/chia sẻ. Thêm hai căn vào so sánh.
3. Mở `/explorer`, chọn tháp/tầng/căn. Kéo để xoay, cuộn hoặc pinch để zoom; dùng chuột phải để pan. Chuyển 2D khi cần.
4. Mở `A0302`, xem gallery, mặt bằng minh họa và dự tính tài chính.
5. Đăng nhập Buyer, đặt lịch tham quan rồi vào wizard giữ căn. Đọc và xác nhận điều khoản.
6. Chọn kịch bản Thông thường, gửi yêu cầu. Theo dõi countdown và mở thanh toán demo.
7. Chọn thành công, thất bại hoặc chờ đối soát. Kiểm tra cùng giao dịch ở Buyer Payments và CRM Payments.

## Walkthrough 2 — Ngoại lệ giữ căn

- Trong bước xác nhận wizard, mở “Kịch bản mô phỏng”: xung đột, hết hạn sau 5 giây, giá thay đổi, mất kết nối.
- Kết quả lỗi không tạo hold thành công. Chọn lại kịch bản thông thường để thử recovery.
- Hold thành công có nút yêu cầu gia hạn và hủy. Gia hạn xuất hiện tại Management Approvals.
- Trong danh sách giữ căn có công cụ mô phỏng hết hạn, cùng danh sách chờ không tự khóa căn.
- Với payment pending, chuyển Finance → Payments → đối soát. Khi chưa đối soát, không thể gửi thêm payment cho cùng hold.

## Walkthrough 3 — Sales đến hợp đồng

1. Sales → Leads: tạo hồ sơ giả lập mới; email trùng sẽ bị chặn. Có bước xem xét hợp nhất, giữ hồ sơ nguồn để bảo toàn lịch sử.
2. Mở lead và chuyển thành cơ hội. Đổi stage bằng kéo thả hoặc select có thể dùng bàn phím.
3. Tạo lịch hẹn; thử nhập giờ trùng để xem cảnh báo. Cập nhật kết quả tham quan và công việc tiếp theo.
4. Buyer tạo giữ căn/thanh toán; mở Customer 360° để thấy cùng chuỗi hồ sơ.
5. Legal → Contracts: tạo dự thảo từ cọc xác nhận, cập nhật ít nhất hai mục checklist bằng dấu phẩy.
6. Gửi rà soát; Manager → Approvals → duyệt/từ chối kèm lý do.
7. Legal ký mô phỏng sau khi duyệt; tình trạng căn và reservation cùng đổi.

## Walkthrough 4 — Điều hành

- Teams: sửa vai trò/đội nhóm và chuyển giao người phụ trách.
- Inventory: gửi yêu cầu giá/trạng thái; duyệt mới có hiệu lực. Cấu hình dự án cho phép thêm tầng mà không xóa căn đang tồn tại.
- Finance: xem giao dịch, đối soát, theo dõi yêu cầu hoàn và hợp đồng.
- Security: xem ma trận quyền, audit và thu hồi phiên demo hiện tại.
- CMS: cập nhật nội dung landing, dự án ưu tiên và chính sách demo. Gallery sử dụng tài nguyên đã đăng ký.
- Reports: lọc dự án/kỳ giao dịch, tương tác biểu đồ và xuất giỏ hàng CSV thực sự.
- Personal: đổi mật độ/màu workspace, dashboard widgets, sound/volume, reduced motion, lịch sử xem và thông báo.

## Đặt lại và phục hồi

Buyer Profile hoặc CRM Personal → “Đặt lại dữ liệu demo” → xác nhận. Hành động khôi phục 84 căn và fixtures ban đầu, tắt sound, xóa lịch sử giao dịch mô phỏng. Không tác động file dự án.

Khi trình duyệt từ chối localStorage, giao diện thông báo dữ liệu chỉ còn ở bộ nhớ. Không nhập dữ liệu thật để thử tính năng này. Dữ liệu ở trình duyệt dùng cho kiểm thử tự động tách khỏi tab demo của người dùng.

## Điều chỉnh cọc demo

Finance → Payments → **Đề nghị điều chỉnh cọc** → nhập số tiền và lý do → gửi. Số tiền cũ được giữ cho đến khi Finance/Manager/Admin phê duyệt ở Approval Center. Phê duyệt cập nhật đồng thời payment và reservation, ghi giá trị trước/sau vào lịch sử. Chỉ điều chỉnh khi khoản cọc đã xác nhận và chưa bắt đầu hợp đồng; yêu cầu cũ không được duyệt nếu trạng thái đã thay đổi.

Dashboard Finance, Legal và Support có chỉ số và liên kết theo công việc tương ứng. Các thẻ không thuộc quyền truy cập không dẫn đến module bị chặn.
