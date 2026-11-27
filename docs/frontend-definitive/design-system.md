# Nhận diện và tương tác

Mảng public dùng nền ngà, chữ xanh rừng và tiêu đề serif cỡ lớn. Dấu Aperture và khoảng trống quanh wordmark dành chỗ cho tên ARVESSA ngay cả trên thanh điều hướng hẹp. Brand line **Architecture · Vision · Experience** xuất hiện ở các điểm giới thiệu thương hiệu. Nội dung tiếng Việt dài được kiểm ở màn 390 px trong hero, thẻ dự án và các bảng thao tác.

Showroom lấy mô hình làm tâm. Panel thông tin cho biết căn hoặc phòng đang chọn trước khi khách mở bước tiếp theo. Thanh điều khiển riêng cho ảnh render, camera, chất lượng, 2D và 3D. Trên điện thoại, ưu tiên diện tích chạm và hiển thị thông tin bên dưới canvas. Trạng thái phòng dùng chung giữa mặt bằng và tour A0302.

Trong Buyer, CRM và Management, chữ sans-serif, nhãn trạng thái và thứ tự tab phục vụ đọc dữ liệu và thao tác liên tiếp. Menu thu gọn cô lập vùng focus, Escape trả người dùng về nút mở. Tìm kiếm chấp nhận từ khóa tiếng Việt bỏ dấu. Tín hiệu hoạt động chỉ hiển thị sự kiện phù hợp với vai trò.

Nền của mỗi nhóm thẻ lấy ba sắc độ từ ảnh dự án. Lớp nền được vẽ bằng gradient tĩnh để giảm chi phí làm mờ toàn khung trong lúc chuyển thẻ. Coverflow hỗ trợ kéo, phím mũi tên, Home/End và CTA trên thẻ đang chọn. Các quy tắc reduced-motion ở stylesheet chung giảm chuyển động trang trí. Canvas được render theo thay đổi camera khi đứng yên. Khi WebGL không khả dụng, người dùng vẫn chọn được căn bằng điều khiển 2D.

[Styles của flagship](../../apps/web/src/design-system/flagship.css) · [Public](../../apps/web/src/features/marketing/public-spatial.css) · [Workspace](../../apps/web/src/components/workspace-shell.tsx) · [Kiểm thử tương tác](../../apps/web/tests/e2e)
