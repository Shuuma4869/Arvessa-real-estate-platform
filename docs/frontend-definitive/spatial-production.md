# The Stillwater · Sản xuất ngoại thất

Cảnh Stillwater gồm hai tháp, mỗi tháp sáu tầng với bốn căn mỗi tầng. Hai tháp cùng chia sẻ sân nước dài, hiên ngoài trời và dải vườn phía nam. Tọa độ chọn từng căn lấy từ 48 ô kính có mã trong cảnh nguồn. Script dừng nếu một ô kính lệch vị trí quá 0,1 mm so với dữ liệu đang dùng trên web.

## Những thay đổi thấy được trên mô hình

- Mặt đứng có khung đá cao hai tầng, đổi bên theo tầng và theo tháp. Lam đồng xoay trên hai mặt hồi tạo bóng sâu khác nhau. Khối phòng sinh hoạt trên mái lùi khỏi mép sàn, có cửa kính, cột và mái đua. Pergola ngoài trời nằm phía đối diện.
- Mái đón có lớp đá sáng, trần gỗ và nẹp đồng. Hai trụ bo đầu giới hạn khoảng dừng trước cửa. Lan can tầng trệt mở tại trục vào. Bốn bậc nối sàn gỗ ngoài trời với hành lang, vách gỗ và quầy lễ tân. Tên tháp là chữ nổi trên bia đá riêng.
- Ba chòi nghỉ kết hợp ghế băng và lam che. Dải ghế vườn bo góc chạy song song bờ nước. Hai hàng cây giúp đọc hướng đường tiếp cận. Phần đường và các khối nhà ngoài ranh là bối cảnh giả định. Chúng không có mã căn.
- Kiểm tra ảnh thử phát hiện bóng tròn của nguồn sáng diện tích lặp lại trong kính và ghế dài chắn bậc vào sảnh A. Ở bản chỉnh, đèn hắt vào mặt tường trong căn, đĩa đèn phụ không xuất hiện trong phản xạ kính và ghế chuyển sang bên cạnh lối vào.

## Góc chụp

| Ảnh | Nội dung cần đọc |
| --- | --- |
| Day | Nhịp đứng của hai tháp, sâu hiên và tỷ lệ mặt nước |
| Golden | Góc từ phía tây, bóng đổ dọc mặt đứng, quan hệ giữa hai mái đón |
| Night | Ánh sáng hắt trong căn, ánh sáng vào sảnh và phản xạ dưới hồ |
| Aerial | Mái, pergola, biên sân và đường tiếp cận |
| Entrance | Chiều sâu trục vào tháp A, chữ đắp nổi, trụ và bậc đá |
| Landscape | Góc ngang tầm mắt dọc theo mặt nước và đường đi |
| Facade | Mối nối khung đá, lam che nắng, kính và tay vịn |
| Showroom | Mô hình cùng nguồn đặt trên bệ trưng bày riêng, chụp dưới đèn studio |

Máy ảnh, vị trí đích, tiêu cự, cấu hình ánh sáng, chất lượng mẫu và giới hạn nhiễu nằm trong `design/spatial/render-exterior-atelier.py`. Cảnh được dựng bằng Blender 4.5.9 LTS, render Cycles với AgX và khử nhiễu. Bộ thử dùng khung 744 × 496, tối đa 12 mẫu. Bộ giao dùng 1600 × 1068, tối đa 80 mẫu cho sáu góc, 112 mẫu cho sảnh và ban đêm. Adaptive sampling có thể kết thúc sớm ở các điểm ít nhiễu. Log từng ảnh ghi thiết bị và thời gian đo.

## Tái tạo trên Windows

Chạy từ thư mục gốc ARVESSA. Quy trình cần thư viện trong `.agent-work/photoreal/library` và nguồn v1 trong `.agent-work/photoreal/flagships`.

```powershell
$blender = '.\.agent-work\photoreal\tools\blender-4.5.9-windows-x64\blender.exe'
& $blender -b --python-exit-code 1 -P design/spatial/stillwater-atelier.py
& $blender -b --python-exit-code 1 -P design/spatial/render-exterior-atelier.py -- draft
& $blender -b --python-exit-code 1 -P design/spatial/render-exterior-atelier.py -- final
& $blender -b --python-exit-code 1 -P design/spatial/export-web.py -- Stillwater .agent-work/definitive/exterior-v2/Stillwater.blend
node design/spatial/optimize-web.mjs --source-dir=.agent-work/definitive/exterior-v2 --scene=Stillwater --models-only
node design/spatial/publish-exterior-atelier.mjs
```

Khi nguồn v1 chưa có, khôi phục thư viện từ `design/spatial/assets.lock.json` theo `design/spatial/README.md` và chạy `build-exterior.py` để dựng cảnh gốc. Bản dựng mới lưu ở `.agent-work/definitive/exterior-v2/Stillwater.blend`. Hash bản sao lưu v1 được đối chiếu trước khi mở nguồn. Các texture ngoài tệp được kiểm tra trước khi lưu và trước khi chụp. Khi chạy lại một góc riêng, thêm tên ảnh sau `draft` hoặc `final`, ví dụ `final entrance`. Mỗi ảnh gắn với SHA-256 của cảnh dùng để chụp.

## Tài sản và quyền sử dụng

Khung đá, mái đón, trụ, bia chỉ dẫn, quầy sảnh, lam, ghế vườn, bể nước và bệ trưng bày được mô hình hóa trong dự án. Gỗ sồi, đá, đất cỏ, cây jacaranda, cây chậu và bầu trời HDRI dùng thư viện Poly Haven CC0. Từng tác giả, URL, phiên bản và checksum nằm trong `design/spatial/assets.lock.json`. Sofa GlamVelvetSofa do Eric Chadwick / Wayfair, LLC cung cấp theo CC BY 4.0. Các bản phân phối có ghi công, mô tả việc thay tỷ lệ, vị trí và tối ưu GLB trong `apps/web/public/spatial-flagships/CREDITS.md`. Ảnh tham khảo chỉ dùng để đánh giá bố cục.

Đối chiếu ngày 27/11/2026, Poly Haven cho phép phân phối lại mô hình, vật liệu và HDRI. Hồ sơ mô hình sofa xác nhận tác giả, chủ sở hữu và giấy phép. CC BY 4.0 cho phép sửa đổi, phân phối với ghi công và mô tả thay đổi. [Điều khoản Poly Haven](https://polyhaven.com/license) · [Hồ sơ gốc của sofa](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/f0920f5b32d172a30efe3f9257e965918831e6ea/Models/GlamVelvetSofa/README.md#legal) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Đối chiếu mỹ thuật

Ở REF-01, một tòa nhà chiếm tâm khung hình và nền phòng trưng bày hiện rõ theo chiều sâu. Góc showroom của Stillwater cho thấy đủ hai tháp và sân nước trên bệ, ánh sáng tách được mép mái và khung ban công. Chất liệu nền trưng bày còn phẳng, tán lá và mặt mái lặp lại khi nhìn gần. Người duyệt có thể so tiếp góc mặt đứng và sảnh ngang tầm mắt để kiểm tra độ dày chi tiết.

Ở REF-02, công trình chính nằm trong mạng đường, sân chơi và cảnh quan khá dày. Bản aerial của Stillwater tách được hai lõi tháp, đường phía đông và trục sân nước. Mật độ cây, công trình xung quanh và chuyển tiếp từ sân lát ra ranh đất còn đơn giản. Hồ sơ hiện có chưa cung cấp khảo sát địa hình, công trình lân cận hay lịch trồng cây. Cần dữ liệu vị trí thật và thêm họ cây có quyền phân phối trực tiếp dưới dạng mô hình để phát triển phần này.

Các ảnh, mô hình và kết quả kiểm thử được dùng cho buổi duyệt. Quyết định nghiệm thu mỹ thuật thuộc người phụ trách sản phẩm.

## Kết quả đo và kiểm tra

Tám bản giao 1600 × 1068 chiếm tổng cộng 1.706.592 byte WebP. Máy AMD Radeon(TM) Graphics hoàn tất 8 lần render Cycles qua HIP trong 1.289,92 giây cộng dồn. Góc showroom mất 78,98 giây. Góc sảnh dùng 112 mẫu mất 239,28 giây. Đây là thời gian render offline đo được. [Log từng góc và checksum](evidence/stillwater-render-log.json)

| Tài sản Stillwater | Dung lượng |
| --- | ---: |
| GLB cao | 26.664.104 byte |
| GLB cân bằng | 20.809.368 byte |
| GLB nhẹ | 18.707.860 byte |
| Nguồn Blender đã đóng gói | 391.512.889 byte |

Bản Blender đóng gói mở lại thành công với 4.289 đối tượng, 44 ảnh nhúng và 0 thư viện Blender ngoài. Bản dành cho mạng chậm vẫn cần tải hơn 18 MB để xoay mô hình. [Biên bản khôi phục](evidence/restore-Stillwater.json)

Trong Chromium 159, cả tám nút đổi ảnh tải và giải mã đúng bản WebP trên khung 1440 × 960 và 390 × 844. Đã kiểm tra trạng thái nút đang chọn và chiều rộng trang sau 16 lần chọn. Không ghi nhận lỗi trang, lỗi tải tài nguyên hoặc tràn ngang. [Kết quả kiểm tra trình duyệt](evidence/stillwater-gallery-check.json)

[Bộ 8 góc render](evidence/stillwater-editorial-plates.webp) · [So sánh trước và sau](evidence/stillwater-before-after.webp) · [Sảnh trên desktop](evidence/stillwater-web-1440.jpg) · [Sa bàn trên mobile](evidence/stillwater-web-390.jpg)
