# Nguồn tài nguyên hình ảnh

## Bộ minh họa The Stillwater

Các file dưới đây được dựng mới bằng SVG cho dự án ARVESSA, không dùng ảnh chụp, mô hình, texture, font nhúng hoặc tài nguyên tải từ bên thứ ba. Có thể chỉnh sửa và phân phối cùng mã nguồn demo ARVESSA. Đây là tài sản minh họa của bản demo, không phải bằng chứng về một dự án bất động sản có thật.

| Tệp tại `apps/web/public/images/` | Nội dung | Phạm vi sử dụng |
| --- | --- | --- |
| `residence-exterior.svg` | Hai tháp A/B, mỗi tháp sáu tầng, mỗi tầng bốn nhịp căn; vật liệu đá ấm, kính, ban công và mặt nước. | Hero, trang dự án The Stillwater, thẻ bất động sản thuộc dự án. |
| `residence-interior.svg` | Phòng khách có cửa kính lớn, nội thất trung tính, tầm nhìn về sân vườn. | Concept nội thất của The Stillwater; không coi là danh mục bàn giao. |
| `residence-courtyard.svg` | Sân vườn nhiệt đới, hồ cảnh quan và pavilion. | Tiện ích chung của cùng dự án minh họa. |
| `residence-plan.svg` | Mặt bằng căn hai phòng ngủ, phòng khách, bếp, phòng tắm và loggia. | Sơ đồ minh họa; kích thước không dùng để tính giá bán hoặc thi công. |

## Quy ước tích hợp

- Tất cả ảnh có `viewBox`, kích thước gốc và mô tả truy cập. Khi nhúng qua `<img>`, thêm `alt` phù hợp với ngữ cảnh; không dựa vào `title` trong SVG.
- Dùng chiều rộng/chiều cao hoặc `aspect-ratio` cố định để hạn chế dịch chuyển bố cục. Hero dùng tỷ lệ 8:5, mặt bằng dùng tỷ lệ 4:3.
- Hero được tải ưu tiên; ảnh phía dưới màn hình dùng `loading="lazy"`.
- Không gán bộ nội thất này cho một dự án khác như thể đó là ảnh thực tế. Có thể dùng làm minh họa danh mục nếu ghi rõ ngữ cảnh.
- Không có địa chỉ, chủ đầu tư, quyền sở hữu hoặc cam kết pháp lý thực nào được thể hiện qua hình ảnh.

## Giới hạn

Hình ảnh là minh họa vector kiến trúc có chủ đích, không phải ảnh chụp hay render vật lý chính xác. Mô hình 3D tương tác của ứng dụng được dựng riêng từ dữ liệu demo; hình minh họa không thay thế các thông số trong dữ liệu nguồn. Bộ ảnh không chứa video hoặc tour 360°. Kiểm tra cú pháp XML thành công khi tạo; việc kiểm tra crop và bố cục phải được thực hiện trong giao diện tích hợp.
