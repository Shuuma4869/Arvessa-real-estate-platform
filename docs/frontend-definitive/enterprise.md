# Buyer, CRM và Management

Ngày 27/11/2026, Chromium đã mở trực tiếp 30 route bằng từng vai trò trên bản production local. Cả 270 lượt đều đúng phạm vi dự kiến. 118 lượt mở được workspace và 152 lượt hiển thị màn hình giới hạn quyền. [Kết quả từng route](evidence/module-permissions.json)

## Buyer và hành trình giao dịch

| Khu vực | Thao tác đã kiểm tra | Kết quả quan sát |
|---|---|---|
| Đăng ký, đăng nhập, xác minh | Thử mật khẩu không hợp lệ, xác minh mã demo và truy cập bằng chín vai trò | Dữ liệu hồ sơ được giữ sau xác minh. Vai trò dẫn tới đúng workspace. |
| Dashboard | Mở màn hình của buyer trên desktop và mobile | Có liên kết khám phá căn đang quan tâm, chỉ số yêu thích, lịch hẹn, giữ căn và cọc. |
| My Properties, Favorites | Lưu căn từ trang chi tiết, tải lại, so sánh và lọc discovery | Căn yêu thích còn trong thư viện. So sánh giữ đúng lựa chọn. |
| Appointments | Đặt lịch, thử đặt cùng giờ, dời lịch đã xác nhận rồi đổi sang sales để duyệt | Dời lịch trả về chờ xác nhận. Kết quả duyệt hiện lại trong danh sách của buyer. |
| Reservations | Tạo yêu cầu, thử xung đột, ngoại tuyến, hết hạn và gia hạn | Có phản hồi theo từng tình huống. Duyệt gia hạn thay đổi hạn giữ. Hết hạn giải phóng căn. |
| Payments | Thử thất bại, thanh toán lại, chờ đối soát, điều chỉnh và hoàn tiền | Buyer, Finance và Customer 360 đọc chung giao dịch. Chỉ số tiền đã được duyệt mới được cập nhật. |
| Contracts | Tạo dự thảo sau cọc, sửa phiên bản, trình duyệt và ký demo | Buyer thấy tiến trình của chính hồ sơ giao dịch. |
| Profile, Security | Sửa thông tin, đổi tùy chọn và mô phỏng hết phiên | Các lệnh chỉnh hồ sơ bảo toàn nhân viên phụ trách và ghi chú CRM. Tùy chọn có hiệu lực sau tải lại. |
| Support | Gửi tin vào hội thoại rồi mở lại | Tin nhắn gắn đúng ticket và khách hàng. |
| Notifications | Buyer dời lịch, sales duyệt, buyer mở chuông | Timeline hiển thị sự kiện gắn với lịch của khách. Sự kiện cũ thiếu mã người thao tác vẫn xác định được qua quan hệ hồ sơ. |

Mục yêu thích thuộc **Bất động sản của tôi**. Các thao tác phiên, đặt lại mật khẩu và quyền riêng tư thuộc **Hồ sơ & bảo mật**. Chuông thông báo dùng chung ở thanh trên. Kịch bản đăng ký đã được chạy bằng Chromium. Hai màn hình quên và đặt lại mật khẩu có trong mã nguồn, chưa nằm trong tập 26 E2E ghi dưới đây.

## CRM Workspace

| Module | Kiểm tra chức năng |
|---|---|
| Dashboard | Đăng nhập theo từng vai trò, kiểm tra route đích và quyền mở module. |
| Leads | Tạo lead từ tư vấn công khai và từ CRM, chặn email trùng, chuyển đổi thành cơ hội. |
| Customer 360 | Mở khách có giao dịch và đối chiếu khoản cọc ở Buyer Payments. |
| Pipeline | Chuyển giai đoạn sau khi tạo cơ hội. Kiểm tra yêu cầu lý do khi mất cơ hội, điều kiện có cọc khi chốt và bảo toàn giai đoạn khi sửa thông tin. |
| Inventory | Kiểm tra 84 mã duy nhất khi khởi tạo, đồng bộ giỏ hàng sau giữ căn, hết hạn, hoàn tiền và thay đổi cấu hình dự án. |
| Appointments | Kiểm tra trùng giờ theo nhân viên hoặc khách, quy trình xác nhận, dời lịch, check-in và hoàn tất. |
| Reservations | Chạy luồng giữ, xung đột, hết hạn, chờ, hủy và gia hạn có bước phê duyệt. |
| Payments | Thử kết quả thất bại, chờ đối soát, xác nhận, điều chỉnh và hoàn cọc. |
| Contracts | Rà soát checklist, lưu phiên bản, duyệt và ký hợp đồng. Kiểm tra hồ sơ phụ thuộc khi hoàn cọc. |
| Tasks | Hoàn tất công việc từ agenda cá nhân và đối chiếu trạng thái trong bảng công việc. |
| Support | Ghi và đọc lại hội thoại từ Buyer. Unit test xác minh liên kết ticket. |
| Marketing | Tạo chiến dịch, gửi duyệt, phê duyệt ở Management và đọc lại trạng thái. Unit test kiểm tra khóa sửa, xóa và sửa tiếp khi chiến dịch bị trả về. |
| Reports | Chọn The Stillwater và kỳ bảy ngày, tải CSV giỏ hàng. Tệp có 48 dòng căn, đúng mã dự án ở cả 48 dòng. |
| Personal | Trực tiếp xử lý công việc và lịch hẹn, kiểm tra timeline cá nhân cùng thiết lập âm thanh, màu sắc, chuyển động và hết phiên. |

## Management Console

| Module | Kiểm tra chức năng |
|---|---|
| Dashboard | Mở tổng quan quản lý với sáu vai trò được vào. Kiểm tra các vai trò còn lại qua URL trực tiếp. |
| Teams | Chuyển hồ sơ từ Linh Trần qua Quang Phạm, mở CRM Appointments và kiểm tra nhân viên mới của A0302. Lệnh chuyển giao từ chối toàn bộ thay đổi nếu người nhận bận và giữ nhân sự của lịch đã kết thúc. |
| Approvals | Kiểm tra duyệt, từ chối và gửi lại yêu cầu hoàn tiền. Kiểm tra gia hạn, hợp đồng, nội dung chiến dịch và điều chỉnh cọc. |
| Inventory | Kiểm tra thay đổi số tầng của dự án, bảo toàn các căn đã giao dịch và quy trình phê duyệt thay đổi giá. |
| Finance | Đối soát khoản chờ, điều chỉnh cọc sau duyệt và kiểm tra số tiền xuất hiện phía buyer. |
| Security | Kiểm tra số hàng của ma trận CRM và Management khi đổi không gian. Bảng nhật ký có thời gian, vai trò, hành động và mã hồ sơ. |
| CMS | Chỉnh nội dung trong Management và kiểm tra nội dung mới trên trang chủ. |
| Settings | Đổi tên tổ chức, lưu, mở lại trang và đọc giá trị đã lưu. |

## Chín vai trò

| Vai trò | CRM được mở | Management được mở |
|---|---|---|
| Buyer | Có tám route riêng trong Buyer Portal | Không có |
| Sales | Dashboard, leads, customers, pipeline, inventory, appointments, reservations, tasks, personal | Không có |
| Team Leader | Như Sales, thêm reports | Dashboard, teams, approvals |
| Customer Support | Dashboard, customers, appointments, support, tasks, personal | Không có |
| Legal | Dashboard, contracts, customers, tasks, personal | Dashboard, approvals, finance |
| Finance | Dashboard, payments, customers, reports, personal | Dashboard, approvals, finance |
| Sales Manager | Cả 14 module | Cả 8 module |
| Company Admin | Cả 14 module | Cả 8 module |
| Platform Admin | Cả 14 module | Cả 8 module |

Quyền thao tác được kiểm tra lại khi chạy lệnh. Ví dụ Sales không thể đối soát, buyer chỉ sửa hồ sơ của mình, Legal duyệt hợp đồng, Team Leader duyệt gia hạn và Finance duyệt điều chỉnh hoặc hoàn cọc. Quyền được mô phỏng trong trình duyệt. Web Locks điều phối ghi trên các tab khi trình duyệt hỗ trợ. Môi trường chưa có thanh toán thật, chữ ký pháp lý, phân quyền phía máy chủ hay bảo đảm đồng thời giữa các thiết bị.

## Bằng chứng

- **62/62 unit test** trong `domain.test.ts` và `enterprise.test.ts`, gồm tám ca cho lịch hẹn, chuyển giao, hồ sơ, thông báo, tính toàn vẹn của cơ hội, duyệt chiến dịch và dữ liệu khởi tạo.
- **26/26 Playwright E2E** được chọn từ `enterprise.spec.ts`, `workflows.spec.ts` và `extended.spec.ts` trên Chromium ở cổng 3043. Tập này gồm ba ca mới cho agenda, ma trận quyền và lịch đi qua Buyer → CRM → Buyer.
- **Bốn kiểm tra trên trình duyệt** cho xuất CSV theo dự án, duyệt chiến dịch, bàn giao lịch và lưu cấu hình. [Kết quả ghi từ trình duyệt](evidence/enterprise-workflows.json)
- **Sáu screenshot** ở 1440 × 960 và 390 × 844. Chiều rộng nội dung bằng chiều rộng viewport ở cả sáu lần đo. Ma trận phân quyền cuộn ngang bên trong bảng trên điện thoại. [Số đo và tên ảnh](evidence/enterprise-views.json)
- Buyer Dashboard trên [desktop](evidence/buyer-dashboard-desktop.jpg) và [mobile](evidence/buyer-dashboard-mobile.jpg).
- CRM Personal trên [desktop](evidence/crm-personal-desktop.jpg) và [mobile](evidence/crm-personal-mobile.jpg).
- Management Security trên [desktop](evidence/management-security-desktop.jpg) và [mobile](evidence/management-security-mobile.jpg).
