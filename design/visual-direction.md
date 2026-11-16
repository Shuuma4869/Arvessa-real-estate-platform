# ARVESSA — ba hướng thị giác

Ngày 16/11/2026. Kế thừa logo, typography và toàn bộ luồng nghiệp vụ.

| Concept | Ánh sáng & hình ảnh | Màu chủ đạo | Nhịp giao diện | Quyết định |
| --- | --- | --- | --- | --- |
| 01 · Blue Hour / Luminous Waterfront | Mặt nước xanh, đá sáng, cửa kính phản chiếu hoàng hôn | Ocean #102633, Teal #087C83, Pearl #F7F8F7, Champagne #D1A46B | Hero điện ảnh, navigation kính nhẹ, phần nội dung thoáng | **Chọn**: thể hiện kiến trúc và trải nghiệm số rõ nhất |
| 02 · Pearl Atelier | Ánh sáng ban ngày, sân vườn, vật liệu tự nhiên | Pearl #F7F8F7, Slate #304653, Sand #E6C4A7 | Editorial sáng, ảnh lớn, nhiều khoảng thở | Đẹp và dễ đọc; dùng nguyên tắc này cho khu vực nghiệp vụ |
| 03 · Sunset Residence | Chiều ấm trên biển, silhouette kiến trúc | Midnight #16232E, Clay #AA6A50, Sand #E6C4A7 | Tương phản mạnh, nhịp chậm, cảm giác nghỉ dưỡng | Giữ làm concept so sánh; sắc ấm dễ lấn át kiến trúc |

Xem `visual-concepts.html` để so sánh bố cục và màu trực tiếp. Chỉ triển khai một hệ nhận diện, không thêm bộ chọn ba theme vào sản phẩm.

## Nguyên tắc triển khai

- Public: màu ocean, ảnh nguyên bản, lớp kính chỉ ở navigation và các điểm điều khiển; chữ đọc được trên lớp phủ có tương phản.
- CRM/Management: nền pearl, bề mặt trắng đục, bảng có đường phân cách rõ; teal cho hành động, champagne chỉ là điểm nhấn.
- Buyer: ảnh vừa đủ và trạng thái giao dịch rõ ràng. Giữ dark mode tùy chọn đã có.
- 3D là mô hình Three.js tương tác; ảnh AI là phối cảnh concept, không thay thế mô hình hay mặt bằng.
- Motion phản hồi hover, focus, chuyển ảnh, đổi góc nhìn; không trì hoãn hero/LCP, không tự phát âm thanh, không chạy hiệu ứng vô hạn.
- `prefers-reduced-motion` và tùy chọn giảm chuyển động trong ứng dụng đều được tôn trọng.

## Tham khảo

- [MotionSites AI](https://www.motionsites.ai/lesson/build-animated-website-with-ai): nhịp chuyển cảnh và phân lớp; không sao chép prompt hay bố cục.
- [Lumé Residences trên Behance](https://www.behance.net/gallery/225936565/Lum-Residences-Real-Estate-Website-Design): cách kết hợp ảnh kiến trúc và nội dung biên tập.
- [Santal Architecture — The First The Last](https://thefirstthelast.agency/work/santal-architecture): 3D phải giúp đọc kiến trúc và tương tác có mục đích.

Các nguồn chỉ dùng tham khảo hướng thẩm mỹ. Không tải ảnh, logo, mã nguồn hoặc mô hình của bên thứ ba.
