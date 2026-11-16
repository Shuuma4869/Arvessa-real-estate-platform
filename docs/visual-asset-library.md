# ARVESSA Visual Asset Library

Ngày 16/11/2026 · Hướng chọn: Blue Hour / Luminous Waterfront.

## Nguồn và phạm vi sử dụng

Tám ảnh được tạo bằng **công cụ image_gen tích hợp**, trong phiên làm việc này, từ prompt riêng cho ARVESSA. Không gọi API ngoài, không tải ảnh stock hoặc tài sản của website tham khảo. Không có watermark, logo hay nhãn hiệu của bên thứ ba trong ảnh đã chọn.

Đây là ảnh AI concept, không phải ảnh chụp bất động sản có thật. Không gắn số liệu đầu tư, quyền sở hữu, chất lượng bàn giao hay xác nhận pháp lý vào ảnh. Việc sử dụng đầu ra tuân theo điều khoản của dịch vụ tạo ảnh; thư viện không tuyên bố độc quyền và không được gán giấy phép stock/Creative Commons chưa có căn cứ.

`assets/visual-library/catalog.json` lưu prompt, kích thước gốc, SHA-256 và dung lượng từng biến thể. Bản PNG nguyên gốc nằm tại `assets/visual-library/originals/`; ứng dụng chỉ tải WebP trong `apps/web/public/images/library/`.

## Danh mục

| Asset | Vai trò | Dùng trong sản phẩm |
| --- | --- | --- |
| stillwater-blue-hour | Hai khối nhà bên mặt nước, ánh sáng xanh và đá sáng | Hero, The Stillwater, login, property preview |
| cedar-courtyard | Kiến trúc sân trong, gỗ cedar và vườn | Cedar House, carousel, property preview Cedar |
| horizon-coast | Kiến trúc ven biển, khoảng hiên và hồ bơi | Horizon Bay, carousel, property preview Horizon |
| stillwater-penthouse | Nội thất dọc, đá travertine, sofa và mặt nước | Gallery The Stillwater, nghiên cứu nội thất |
| stillwater-pool | Hồ bơi, pergola, chỗ ngồi và vườn | Tiện ích The Stillwater, signature section, buyer journey imagery |
| duplex-study | Không gian thông tầng, cầu thang và ánh sáng | Journal; Brand Presentation, không đưa vào giỏ hàng |
| villa-study | Villa hiện đại với hồ bơi và vườn | Brand Presentation; thư viện nghiên cứu, không đưa vào giỏ hàng |
| tower-study | Nhịp đứng, kính và tầng mái xanh | Brand Presentation; nghiên cứu tháp cao tầng, không đưa vào giỏ hàng |

Xem [catalog trực quan](../assets/visual-library/catalog.html) và [ba concept](../design/visual-concepts.html).

## Kiểm soát tính nhất quán

Chung ngôn ngữ đá sáng, kính xanh, khung bronze và cảnh quan có tiết chế. Ba dự án có ảnh riêng. Chỉ The Stillwater có bộ interior/pool bổ sung; Cedar và Horizon không mượn nội thất hay tiện ích của dự án khác.

Ảnh là nghiên cứu hình khối; chi tiết và số tầng trong ảnh AI không phải dữ liệu kiểm kê. Số tháp/tầng/căn chính xác lấy từ dữ liệu demo và mô hình Three.js sinh trực tiếp từ dữ liệu đó. Mặt bằng SVG giữ nhãn concept, không gọi là bản vẽ thi công. Hồ sơ, trạng thái và tùy chỉnh của người dùng vẫn được giữ; lớp trình bày ánh xạ ảnh SVG mặc định cũ sang thư viện mới mà không reset localStorage.

## Tuyển chọn và tối ưu

Đã xem trực tiếp cả tám ảnh: đường đứng, vật liệu, ánh sáng, bố cục và vùng đặt chữ phù hợp để dùng trong demo. Ảnh tháp cao tầng chỉ là nghiên cứu tỷ lệ và nhịp mặt đứng, không minh họa cho ba dự án thấp tầng. Không xác nhận độ chính xác kỹ thuật của hình học AI.

Mỗi ảnh có WebP rộng 480 / 800 / tối đa 1600 px, không phóng lớn bản gốc. Hai ảnh dọc gốc rộng 1024 px; `srcset` khai báo kích thước thực. Hero desktop khoảng 131 KB; mobile dùng crop dọc 456 × 866 px, khoảng 64 KB, lấy từ cùng bản gốc và chọn bằng `<picture>`. Tổng cộng 25 WebP. Ảnh dưới màn hình dùng lazy loading, có kích thước để giữ bố cục. Không có video tự chạy hoặc tải mô hình 3D trên trang chủ; motion nhẹ dùng CSS, 3D chỉ tải khi vào explorer.

SVG logo gốc, icon mark, monogram, favicon và hai phiên bản sáng/tối được kế thừa. Các phối cảnh SVG đời đầu vẫn được lưu để truy vết, không bị xóa.
