# Visual Flagship Rebuild — Gate 0

17/11/2026 · Baseline `main@6ff0e721ad261cbaa6c21f68945f2055b86129b1`, local và GitHub khớp. Working tree sạch trước khi tạo `design/arvessa-flagship-visual-v2`. Giữ nguyên một Next.js app ở `D:\ARVESSA`.

Đã đọc toàn bộ Master Prompt mới và xem trực tiếp sáu ảnh REF-01–06 cùng contact sheet. Bản ảnh gốc chỉ ở `.agent-work/visual-references`, bị ignore; không được phân phối trong sản phẩm hoặc PR. `REFERENCE_GUIDE.md` chưa được tìm thấy trong bộ file cung cấp; mô tả ID trong Master Prompt và sáu ảnh gốc là cơ sở đối chiếu, không tự giả định có nội dung guide khác.

## Bằng chứng hiện trạng

Chạy production baseline tại cổng 3017, chụp 20 viewport screenshots (1440/1920/390/360): landing, coverflow, project, explorer, property. [Runtime record](evidence/before/runtime.json): không pageerror hoặc horizontal overflow trong 16 lượt route. Bộ nghiệp vụ baseline đã có 61 unit/component và 35 E2E PASS tại chính commit này; đây không phải kết quả nghiệm thu cho bản rebuild.

| ID | Quan sát ảnh tham chiếu / hành vi cần có | Bằng chứng hiện tại | Gap cụ thể | Triển khai và tiêu chí kiểm chứng |
|---|---|---|---|---|
| REF-01 | Mô hình kiến trúc là vật thể trung tâm; kính, loggia, mái, ánh sáng và bóng đọc rõ; control nổi và panel căn | [Explorer 1440](evidence/before/explorer-1440.webp), [390](evidence/before/explorer-390.webp) | Heading chiếm gần nửa viewport; tòa bị cắt ở mép dưới. Mặt đứng xanh phẳng và phiến sàn lặp, ít chiều sâu; chưa có showroom composition | Scene toàn khu có landscape/plinth, cửa lõm/ban công/mullion/pergola, chọn tower/floor/unit. Camera và picking phải đổi scene/data thật; screenshot toàn mô hình trong viewport |
| REF-02 | Phối cảnh tổng thể, nhiều tòa trong cảnh quan, labels, lọc và điều hướng từ tòa tới căn | [Project 1440](evidence/before/project-1440.webp), [390](evidence/before/project-390.webp) | Masterplan hiện là hai nút chữ A/B trong CSS; không có vị trí 3D, phối cảnh hoặc trạng thái căn trong cảnh | Masterplan dùng cùng scene 3D và inventory. Chỉ giữ đúng 2 tháp Stillwater theo dữ liệu, thêm pavilion/cảnh quan không giả làm căn. Chọn B phải lọc đúng B; tầng/căn cập nhật URL |
| REF-03 | Bố cục editorial, mặt bằng sắc, label phòng/hướng và các lựa chọn không gian | [Property 1440](evidence/before/property-1440.webp), [360](evidence/before/property-360.webp) | Mọi loại căn dùng `residence-plan.svg` 2 phòng; thừa disclosure mà chưa giải quyết khác biệt topology; không room selection/pan/zoom | Model layout 1/2/3 phòng theo data, tổng diện tích tham khảo map về căn; 2D SVG có room focus/zoom/pan, liên kết dollhouse và tour |
| REF-04 | 5 card theo trục chiều sâu, mặt kính và ánh sáng, nội dung card đọc được, kéo có quán tính/snap | [Coverflow 1440](evidence/before/coverflow-1440.webp), [390](evidence/before/coverflow-390.webp) | Card hiện rất rộng và gần phẳng; chỉ 3 project, không có giá/diện tích cho residence; swipe chỉ ngưỡng pointerup, không follow drag | 5 card thật với perspective/rotateY/z-depth và drag tracking, momentum/snap, keyboard; chỉ card active chứa focusable CTA. Mỗi item dẫn đúng project/căn |
| REF-05 | Dollhouse có phòng, đồ nội thất, ánh sáng, mini plan; camera/room tour thực | [Property 1920](evidence/before/property-1920.webp) | Chưa có dollhouse hoặc panorama, gallery không thể thay thế chức năng này | Geometry nội thất dùng chung layout; chọn phòng/roof cutaway/camera. Render panorama 2:1 từ chính scene, bốn điểm nhìn living/kitchen/bedroom/loggia, viewer sphere thật + hotspots. Nếu render không đạt phải ghi blocker |
| REF-06 | Hero editorial sáng/tối cân bằng, hình ảnh chiếm vị trí có chủ đích, hotspot/gallery scene và CTA | [Landing 1440](evidence/before/landing-1440.webp), [360](evidence/before/landing-360.webp) | Ảnh nền tốt nhưng overlay navy chiếm toàn cảnh; logo A phổ thông; cùng ảnh Stillwater lặp hero/card/property. Teaser kiến trúc là CSS giả lập | Pearl/forest/bronze art direction, editorial hero nhiều scene có hotspot, gallery theo không gian, model preview thực lazy-load; 7 phân cảnh thay cho chuỗi grid. LCP/reduced motion giữ budget |

## Quyết định thiết kế

**Architectural Atelier**: pearl ấm, forest sâu, bronze tinh tế, màu tự nhiên của cảnh thay cho phủ teal toàn trang. Display Cormorant Garamond có dấu Việt, UI Manrope; giữ font local và thang kích thước responsive. Logo cần một hình học khoảng rỗng có bản sắc thay cho chữ A với thanh ngang. Ba concept và specimen được dựng bằng SVG/HTML, chọn bằng kiểm tra 16/24 px, nền sáng/tối và ứng dụng thực.

Tách trạng thái nghiệm thu thành: đã có UI, đã hoạt động, đã kiểm tra trực quan. Build/test PASS không tự suy ra chất lượng flagship. Mọi gate có ảnh và hành vi được thực hiện, bất kỳ điểm chưa đạt phải giữ trạng thái chưa đạt.

## Asset map

| Phạm vi | Asset / nguồn dự kiến | Ràng buộc |
|---|---|---|
| Brand | Vector gốc ba concept + lockups | Không dùng font text chưa outline trong wordmark, không sao chép ref |
| Stillwater / exterior | AI concept gốc hiện có + procedural site scene mới | 2 tháp, 6 tầng, 4 căn mỗi tầng; không bịa inventory |
| Unit 1BR / 2BR / penthouse | 2 ảnh AI nội thất bổ sung, penthouse hiện có | Phân biệt rõ loại căn; ảnh chỉ concept, không thay floorplan |
| Rooms / dollhouse | Geometry và vật liệu procedural nguyên bản | Cùng room graph với SVG plan |
| Tour 360 | Panorama 2:1 render từ model nội thất | 4 view cùng concept, không dùng crop ảnh thường hoặc CSS giả |
| Buyer/CRM/Management | Preview ảnh/mặt bằng theo căn | Không thay state machine, permissions hoặc seed nghiệp vụ để tạo ảnh |

## Gates tiếp theo

1. Brand/specimen và visual system.
2. Landing/coverflow và asset integration.
3. Architectural scene/masterplan và hierarchy picking.
4. Floorplan/dollhouse/panorama viewer.
5. Enterprise refinement và cross-module QA.
6. Full regression, performance, evidence, Actions và PR; không merge main.
