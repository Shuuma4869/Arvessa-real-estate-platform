# Giới hạn đã biết và bước tích hợp tiếp theo

## Ranh giới bản demo

Frontend chạy local; toàn bộ hồ sơ và chính sách là giả lập. Role switch không phải authentication, localStorage không phải cơ sở dữ liệu có kiểm soát truy cập. Người dùng có thể sửa dữ liệu bằng DevTools. Audit hiện phục vụ trình diễn, không chống sửa đổi. Không dùng ứng dụng này để thu tiền, ký hợp đồng hoặc xử lý dữ liệu khách hàng thật.

Web Locks và idempotency chỉ phối hợp các tab cùng browser/origin. Chưa có tính nhất quán giao dịch đa người dùng, clock server, webhook payment, email/SMS, SSO, MFA thật, phân tách tenant hoặc backend triển khai. Session demo hết hạn ở client sau 60 phút.

## Mức độ mô phỏng

- Signup cập nhật hồ sơ Buyer cố định trong demo; chưa tạo nhiều tài khoản độc lập. OTP cố định, mật khẩu không lưu. Các vai trò nhân viên có dữ liệu giả lập.
- Upload kiểm tra loại/kích thước và lưu tên tệp để thử flow. Không upload blob lên server, không có lưu trữ tài liệu thật. Biên nhận/hợp đồng chỉ là bản xem trước, không có giá trị kế toán/pháp lý.
- Phối cảnh AI, mặt bằng SVG và mô hình 3D procedural phục vụ demo; ảnh AI không phải hiện trạng, mặt bằng và vị trí schematic không có độ chính xác xây dựng/địa lý. Three.js phản ánh số tháp/tầng/căn của dữ liệu; hình khối và vật liệu chưa phải mô hình BIM. Dùng motion CSS và chuyển camera thay cho video tự phát. Tour 360 dùng panorama 4K 2:1 dựng từ mô hình nội thất, không phải ảnh chụp hiện trạng; có ba loại căn và bốn điểm nhìn cho mỗi loại. Chưa phải mô hình scan/BIM hay trải nghiệm đi bộ tự do có vật lý.
- CMS chỉnh tiêu đề, mô tả, thứ tự dự án ưu tiên, ảnh đã đăng ký và chính sách; chưa phải CMS nội dung tổng quát. Chưa có asset upload hoặc trình soạn layout.
- Cấu hình dự án cho phép thêm tầng trong tháp hiện hữu, giữ các căn đang có; không tái cấu trúc/xóa tháp đang giao dịch.
- Financial indicators chỉ lấy từ fixtures/giao dịch demo. Reports xuất CSV giỏ hàng; không xuất báo cáo kế toán hoặc hợp đồng PDF.
- SaaS Settings trình bày một workspace; gói dịch vụ và trạng thái tenant không kết nối billing thật.

## Phạm vi kiểm chứng

Kiểm thử tự động dùng Chrome trên Windows và nhiều kích thước viewport, không thay thế kiểm tra thiết bị iOS/Android thật, Safari/Firefox, screen reader hoặc người dùng có nhu cầu tiếp cận khác nhau. Axe không phải chứng nhận tuân thủ WCAG toàn diện.

Đo hiệu năng local không có dữ liệu mạng thực tế hay field p75. Event Timing trong phiên lab chỉ là chỉ báo tương tác, không được quảng bá là INP thực tế của toàn bộ người dùng. Xem số đo và điều kiện cụ thể trong báo cáo QA.

## Thứ tự phát triển tiếp

1. Backend auth/session, phân quyền và tenant scope trên mọi request; schema/validation và chính sách bảo vệ dữ liệu.
2. Database transaction, idempotency, version token, reservation locking và server time. Push cập nhật tình trạng/giá qua SSE hoặc WebSocket.
3. Payment provider sandbox, webhook có xác minh, đối soát và refund có audit bền vững.
4. Lưu trữ tài liệu với quyền truy cập, scanning, versioning và e-signature provider; pháp chế phê duyệt nội dung thật.
5. Bổ sung tài sản dự án đã được chủ sở hữu duyệt; đo RUM, test đa trình duyệt/thiết bị, đánh giá accessibility với người dùng.

Các tích hợp này chưa nằm trong frontend demo và không được báo là đã triển khai.
