# Sử dụng logo ARVESSA

**Hệ thống v2 — Architectural Aperture (17/11/2026).** Biểu tượng cổng không gian và ngưỡng chuyển tiếp thay concept A v0.1. Wordmark Cormorant Garamond 600 đã chuyển toàn bộ thành path, tracking và tỷ lệ riêng; nguồn font SIL OFL kèm `wordmark-font-license.txt`. Mark là hình học gốc, không khẳng định đã đăng ký hoặc kiểm tra độc quyền nhãn hiệu.

SVG primary/horizontal sáng–tối dùng khung 640×128; stacked 360×250; mark 96×96; social 512×512. SVG có title/desc, không ảnh nhúng, external URL, script hoặc phụ thuộc font. Website/Authentication dùng primary; dashboard/CRM dùng primary hoặc mark ở rail; favicon dùng tile riêng; app/social dùng mark trên nền forest. Brand line đặt thành text độc lập để đọc được ở mobile, không ép vào favicon.

Clearspace tối thiểu bằng 1/4 bề rộng mark. Mark tối thiểu 16 px với biến thể favicon; mark độc lập ưu tiên 24 px. Horizontal tối thiểu 160 px, stacked 120 px. Không kéo méo, xoay hoặc đặt logo sáng trên nền sáng. Có bản inverse cho nền tối. Kiểm tra kích thước 16/24/32/48/96 và đổi nền trong `/brand`.

**Các hướng dẫn v0.1 bên dưới là hồ sơ kế thừa, không dùng để chọn asset mới.** Bản cũ có thể xem trong lịch sử Git trước rebuild.

## Chọn đúng bản

| File | Nội dung | Mục đích |
| --- | --- | --- |
| `arvessa-primary.svg` | Mark A + wordmark ARVESSA; khung 640 × 128. | Website, thanh điều hướng rộng, tài liệu giới thiệu. |
| `arvessa-mark.svg` | Mark A độc lập; khung 128 × 128. | Thanh điều hướng thu gọn, favicon, cơ sở dựng app icon. |
| `arvessa-monogram.svg` | Nghiên cứu A/V; khung 128 × 128. | Mockup thương hiệu phụ, chưa dùng làm dấu chính trong sản phẩm. |

Các file có nền trong suốt, màu Obsidian `#172523`, không nhúng font, ảnh hay liên kết ngoài. SVG primary không chứa brand line. Wordmark là path; giữ tên ARVESSA trong nhãn truy cập của giao diện.

## Khoảng trống và kích thước

- Giữ khoảng trống ngoài khung SVG ít nhất bằng **1/4 chiều cao mark đang hiển thị**. Không để chữ, nút hay đường viền xâm phạm khoảng này.
- Primary: bắt đầu ở **240 px chiều rộng** trên màn hình; nếu thiếu chỗ, chuyển sang mark. Giữ đúng tỷ lệ 5:1.
- Mark: dùng **24–32 px** trong thanh điều hướng; 16 px chỉ dành cho favicon và cần xem ở đúng tỷ lệ hiển thị.
- Monogram: thử từ **48 px**; chưa dùng ở 16–32 px do nhịp chữ phức tạp hơn.
- Những mốc trên dùng CSS px. Kiểm tra thêm ở màn hình mật độ cao và trong bối cảnh thực tế trước khi duyệt.

## Theo điểm chạm

| Điểm chạm | Cách dùng |
| --- | --- |
| **Website** | Primary trên nền sáng, chiều rộng gợi ý 240–300 px. Header di động có thể chuyển sang mark. Brand line đặt thành dòng chữ riêng trong hero hoặc footer, không ép vào header hẹp. |
| **Dashboard** | Primary ở vùng thương hiệu khi thanh bên mở rộng; mark 24–32 px khi thu gọn. Không dùng logo như watermark phía sau biểu đồ hoặc số liệu. |
| **CRM** | Giữ cùng mark và màu với dashboard. “CRM” là nhãn sản phẩm đặt riêng, không ghép vào path logo. Ưu tiên diện tích cho tìm kiếm, danh sách và thao tác. |
| **Favicon** | Dùng mark; kiểm tra tại 16 và 32 px trên nền tab sáng/tối. Bản SVG hiện tại phù hợp nền sáng; cần thêm nền sáng cố định hoặc phiên bản thích ứng trước khi triển khai trên tab tối. Khi cần, xuất PNG/ICO từ bản đã duyệt. |
| **App icon** | Dùng mark giữa nền Ivory đặc. Bắt đầu với vùng an toàn 20% ở mỗi cạnh, sau đó điều chỉnh theo mask và yêu cầu của nền tảng. Không đưa wordmark hay brand line vào icon. |

## Màu và nền

- Dùng các SVG hiện có trên nền trắng hoặc Ivory `#F5F2EA`.
- Trên nền Obsidian, tạo bản đảo màu Ivory từ nguồn vector; ba SVG hiện có chưa bao gồm phiên bản này.
- Trên ảnh, đặt logo trong một vùng nền đặc đủ tách biệt; không đặt trực tiếp lên vùng nhiều chi tiết.
- Muted Brass `#A58B60` là màu nhấn nghiên cứu, không phải màu mặc định của logo hay chữ giao diện.
- Kiểm tra độ rõ của logo bằng mắt ở kích thước sử dụng. Chữ và thành phần thao tác đi kèm phải được kiểm tra tương phản riêng.

## Brand line và truy cập

Giữ nguyên **Architecture · Vision · Experience**. Khi đặt cạnh hoặc dưới logo, dùng chữ giao diện dễ đọc, từ 12 px để thử; nếu không đủ không gian thì bỏ dòng phụ. Không tự dịch hay rút thành ba chữ cái trong lockup.

Với ảnh logo có ý nghĩa, dùng `alt="ARVESSA"`. Nếu logo là liên kết về trang chủ, đặt tên truy cập “ARVESSA — Trang chủ” cho liên kết và tránh để trình đọc màn hình đọc trùng. Logo trang trí cạnh tên thương hiệu đã có thì dùng alt rỗng. Không dựa riêng vào phần tử `title` bên trong SVG khi nhúng qua thẻ ảnh.

## Không thay đổi tùy ý

Không kéo giãn, nghiêng, xoay, thêm bóng hoặc đổi khoảng cách giữa mark và wordmark. Không đổi mỗi chữ một màu. Không cắt mất phần chân hay đỉnh mark. Không dùng monogram thay primary mà chưa có quyết định thiết kế thống nhất.

## Trước khi phát hành

Duyệt hình học và kerning; thử logo trong cả năm điểm chạm; hoàn thiện phiên bản sáng/tối và xuất tài nguyên đúng nền tảng. Chỉ đưa bản đã duyệt vào `assets/`. Các SVG hiện tại phục vụ khám phá nhận diện và mockup.

## Tích hợp frontend · 16/11/2026

Giữ hình học bản gốc. Bổ sung `arvessa-primary-inverse.svg`, `arvessa-mark-inverse.svg` cho nền tối và `favicon.svg` dạng mark trên nền đặc. Bản phục vụ ứng dụng ở `apps/web/public/brand/`; favicon được khai báo trong metadata App Router và phục vụ ở `/brand/favicon.svg`.

Landing, Authentication, About và Brand Presentation có brand line **Architecture · Vision · Experience**. Workspace chỉ dùng primary hoặc mark trong sidebar, không lặp brand line ở bảng CRM. Ảnh nguồn SVG được đặt width/height để ổn định layout; không đổi tỷ lệ, thêm gradient hoặc hiệu ứng vào wordmark.

Các phiên bản hiện phục vụ demo local. Việc phát hành thương mại vẫn cần duyệt nhận diện cuối cùng và kiểm tra tương đồng logo.
