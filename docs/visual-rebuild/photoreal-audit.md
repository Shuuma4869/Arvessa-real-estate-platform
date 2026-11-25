# Photorealism — kiểm toán và điểm nghiệm thu

Đây là kiểm toán đầu vào ngày 18.11.2026. Tiến độ, sản phẩm và giới hạn sau sản xuất được ghi trong [hồ sơ hai cảnh flagship](photoreal-review.md); không dùng phần khảo sát công cụ bên dưới làm trạng thái hiện hành.

Ngày 18.11.2026, baseline `8eb6d2976cf156a626db73827b0926251e215feb`, branch `design/arvessa-flagship-visual-v2`, PR #1. SHA local và remote trùng nhau. Phạm vi được phép sản xuất: **The Stillwater và căn A0302**. Chưa mở rộng sang căn/dự án khác, Landing hoặc coverflow trước khi chủ dự án nghiệm thu hai cảnh. CI và tương tác không thay thế nghiệm thu mỹ thuật.

## Đối chiếu trực tiếp

Đã mở trực tiếp cả sáu PNG trong `.agent-work/visual-references/` và ảnh baseline tại `evidence/final`. Không đưa ảnh tham chiếu vào asset sản phẩm hoặc Git.

| Tham chiếu | Chênh lệch quan sát được ở baseline | Việc cần xử lý |
|---|---|---|
| REF-01 | Mặt đứng đều màu, kính giống tấm nhựa, cây thành cụm cầu; thiếu tương phản vật liệu, phản xạ bối cảnh và chi tiết cận cảnh | Model có UV, vật liệu nhiều map, kính vật lý, môi trường HDR, cây thật, ánh sáng offline; giữ riêng mesh picking 48 căn |
| REF-02 | Hai khối tòa trên nền phẳng; cảnh quan ít lớp, mặt nước phẳng, đường đi thiếu vật liệu/chi tiết | Cấu trúc cảnh quan, asset cây có silhouette tự nhiên, vật liệu nền/mặt nước, góc aerial có chiều sâu |
| REF-03 | Bố cục panel/plan đã rõ nhưng plan còn sơ đồ: nét nội thất đơn giản, chưa phải bản vẽ kiến trúc đo đạc | Dùng một layout nguồn cho phòng/cửa/camera; ghi rõ kích thước minh họa, giữ 107 m² và dữ liệu A0302 |
| REF-04 | Coverflow có tương tác nhưng ảnh AI, màu và kích thước vật thể chưa thống nhất với mô hình | Chờ hai cảnh được duyệt rồi dùng render từ cùng nguồn; chưa thay coverflow trong giai đoạn này |
| REF-05 | Đệm, giường, bàn, thiết bị tắm là khối bo cạnh; không có sợi vải/vân gỗ/normal; ánh sáng phẳng | Asset nội thất có UV và vật liệu thật, nguồn scene chung cho dollhouse và tour, kiểm tra bóng tiếp xúc và ánh sáng gián tiếp |
| REF-06 | Hero có ảnh cinematic nhưng hình học/không gian không khớp viewer | Chờ render flagship được duyệt; giữ bố cục và CTA hoạt động |

Không suy ra chất lượng motion hoặc khả năng tương tác của ảnh tham chiếu từ ảnh tĩnh. Các hành vi của ARVESSA được kiểm tra riêng.

## Nguyên nhân trong pipeline cũ

- `architectural-model.ts`: hình học Box/RoundedBox/Cylinder và cụm cầu/icosahedron cho cây. Slab, mullion, loggia và ID căn có thể giữ làm ràng buộc; mesh trang trí cần thay. Kính metalness 0,2 và opacity; nước metalness 0,38, không có normal mặt nước. Vật liệu chủ yếu chỉ có màu/roughness.
- `interior-model.ts`: mesh có UV mặc định từ primitive nhưng không có bộ texture PBR gắn với UV. Không thể gọi là pipeline UV/PBR hoàn chỉnh. Ghế, đệm, cây, rèm là khối minh họa; topology và microdetail không đến từ asset nội thất thật.
- `building-canvas.tsx`, `residence-canvas.tsx`: RoomEnvironment tổng quát, directional/ambient/hemisphere lights và shadow map; không có nguồn HDRI kiến trúc được chọn hoặc baked GI. Tối ưu on-demand, DPR, cleanup/context-loss và các controls cần giữ.
- `render-tours.mjs`: raster WebGL CubeCamera rồi chuyển equirectangular. Không có path-traced indirect lighting; cùng mesh minh họa nên 4K vẫn là minh họa. Không dùng tăng độ phân giải để giải quyết nguyên nhân này.
- `panorama-canvas.tsx`: viewer sphere và điều khiển là thật, có thể giữ; chất lượng phải đến từ scene và render nguồn mới.
- `residence-layout.ts`: phân vùng cùng nguồn cho SVG/3D, nhưng width × depth hiện là hệ tọa độ minh họa 127,68 đơn vị² cho loại 2 PN; diện tích hiển thị được phân bổ về 107 m². Khi xuất scene theo mét phải scale đồng nhất, không tự thay số liệu giao dịch.

## Công cụ và nguồn lực đã kiểm tra

- Ban đầu không tìm thấy Blender, `gltf-transform` hoặc `toktx` trong PATH; repository không có source `.blend`, `.glb`, `.gltf` hoặc HDRI chuyên dụng.
- Đã cài portable **Blender 4.5.9 LTS** từ `download.blender.org` trong `.agent-work/photoreal/tools`; SHA-256 archive khớp manifest nhà phát hành: `41da973b9bf95bb312cbeff4d1982feb13259b43c821686b9bafea4dfe5477cf`. Không thay cài đặt hệ thống.
- CPU AMD Ryzen 7 6800H, 16 luồng; RAM 15,19 GiB, trống khoảng 3,12 GiB tại lúc khảo sát. CIM bị giới hạn truy cập; thông tin CPU/RAM lấy từ Node OS, GPU từ registry và Cycles.
- **Cycles/HIP đã render thực thành công** trên AMD Radeon tích hợp: mẫu vật liệu 960×720, 96 samples, 8 bounces, AgX, denoise, 35,725 giây. Đây không phải FPS web và không phải kết quả flagship. Log báo peak bộ nhớ Blender khoảng 882,58 MB, không phải tổng RAM/VRAM hệ thống.
- GLB export có trong Blender. KTX2/Meshopt và validation phải kiểm tra riêng trước khi báo đã có. Không có công cụ tạo model 3D chuyên dụng được kết nối trong phiên; công cụ ảnh 2D không thay thế model.

## Nguồn asset và giới hạn

Poly Haven cung cấp model, texture, HDRI theo [CC0](https://polyhaven.com/license); downloader nội bộ ghi nguồn, tác giả, files hash, checksum nhà phát hành và SHA-256. Ghi credit “Powered by Poly Haven” cho pipeline dùng API. Không dùng ảnh preview của thư viện làm render ARVESSA.

Sofa hiện đại từ [GlamVelvetSofa / Khronos](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/f0920f5b32d172a30efe3f9257e965918831e6ea/Models/GlamVelvetSofa), Eric Chadwick / Wayfair, LLC, 2021, CC BY 4.0; phải giữ attribution, link giấy phép và ghi thay đổi. Không hàm ý Wayfair tài trợ ARVESSA. Các sofa cổ điển Poly Haven không phù hợp concept nên bị loại khỏi lựa chọn.

Nguồn tải và thử nghiệm đang được giữ local ignored. Chưa đề xuất nghiệm thu hai flagship. Mẫu góc vật liệu chứng minh khả năng chạy pipeline, chưa chứng minh chất lượng toàn cảnh. Render mẫu còn đá thô, thiếu bố cục nội thất hoàn chỉnh và không phải A0302; cần sửa trước khi đưa vào sản phẩm.
