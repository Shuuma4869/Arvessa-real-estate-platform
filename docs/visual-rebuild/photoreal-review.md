# Hai cảnh flagship — hồ sơ kiểm tra

Cập nhật 26.11.2026; render và bộ regression chính chạy ngày 25.11.2026. **Chưa đạt nghiệm thu photorealism. Không mở rộng sản xuất.** Bản thử tại `/spatial-review` tách ảnh Cycles, mô hình GLB tương tác, mặt bằng và panorama để người xem biết rõ mình đang xem loại sản phẩm nào. Không thay tài sản của các căn khác hoặc nghiệp vụ giao dịch.

## Sản phẩm và nguồn

- Stillwater: ảnh ban ngày, giờ vàng, aerial; GLB hai tháp/sáu tầng; vùng chọn giữ nguyên 48 ID căn và liên kết chi tiết.
- A0302: dollhouse, phòng khách, bếp và panorama phòng khách 4096 × 2048; GLB có chọn phòng; mặt bằng chung nguồn với demo 2 PN, 2 phòng tắm, 107 m². Panorama chỉ có một phòng, không giả lập các phòng chưa render.
- [Pipeline và cách tái tạo](../../design/spatial/README.md), [hợp đồng dữ liệu cảnh](../../design/spatial/scene-contract.json), [nguồn và checksum assets](../../design/spatial/assets.lock.json), [credit đi cùng bản web](../../apps/web/public/spatial-flagships/CREDITS.md).
- Source local: `D:\ARVESSA\.agent-work\photoreal\flagships\Stillwater.blend` và `A0302.blend`. Giữ cả `D:\ARVESSA\.agent-work\photoreal\library` vì texture đang liên kết ngoài. `.blend` và thư viện được Git ignore; source scripts/lockfile và bản GLB/ảnh web được quản lý trong Git. Không gọi clone sạch là đã chứa file `.blend`.

Không dùng ảnh tham chiếu hoặc ảnh AI 2D để thay mô hình. Các sản phẩm mới được render từ cảnh Blender có hình học. Mặt bằng là dữ liệu demo được scale đồng nhất, không phải hồ sơ BIM/CAD thi công.

## Quy trình thực tế

Blender 4.5.9 LTS, Cycles trên HIP / AMD Radeon tích hợp; 128 samples, denoise, AgX Medium High Contrast, 10 bounces, transmission 8. Camera và thời gian render từng ảnh được ghi trong [production-report.json](../../apps/web/public/spatial-flagships/production-report.json). Không đồng nhất thời gian render với FPS web.

Thời gian Cycles của bộ đã sửa: Stillwater ngày 154,7 s, giờ vàng 177,2 s, aerial 149,4 s; A0302 phòng khách 185,2 s, bếp 149,1 s, dollhouse 62,9 s, panorama 970,4 s. Các lượt chạy tuần tự trên cùng máy; không bao gồm thời gian dựng scene và xuất GLB.

Models/textures/HDRI Poly Haven dùng CC0. Sofa GlamVelvetSofa của Eric Chadwick / Wayfair, LLC dùng CC BY 4.0, giữ attribution và ghi thay đổi. Đá slab Marble 014 của ambientCG dùng CC0, tạo bằng phương pháp procedural, không phải photoscan; archive và từng map được ghim checksum. Các tài sản gỗ, đá, vải có UV và map màu/roughness/normal; kim loại, kính và nước dùng shader vật lý. Giường, tủ bếp và thiết bị tắm còn có phần tự dựng; không gắn nhãn photoscan cho chúng.

GLB dùng Meshopt, texture WebP, GPU instancing và batching theo vật liệu. Có mức 512 px mặc định và 1024 px tùy chọn, cùng hình học. WebP giảm dung lượng truyền, không nén bộ nhớ GPU như KTX2. [verification.json](../../apps/web/public/spatial-flagships/verification.json) ghi geometry, texture và kiểm tra sau giải nén; trường `validation` trong production report là kiểm tra **GLB thô trước tối ưu**, không phải kết quả file cuối.

## Sửa lỗi hình học sau khi xem ảnh

Panorama trước sửa xuất hiện vùng kính phản xạ bất thường do thứ tự đỉnh của các khối hộp quay vào trong. Đã sửa winding, thêm kiểm tra pháp tuyến ở mỗi khối và kiểm tra thể tích dương/cạnh manifold ở ba mức bevel. Cả ba phép kiểm tra đạt. glTF Validator không phát hiện vấn đề này vì file vẫn hợp lệ về định dạng. Hai scene, bảy ảnh và bốn GLB được xuất lại từ hình học đã sửa; ảnh lỗi được giữ để đối chiếu trong bảng trước/sau. Không dùng kết quả E2E để kết luận kính hoặc vật liệu đạt chất lượng mỹ thuật.

## Tài nguyên xuất

| Model | GLB 512 px | GLB 1024 px | Tam giác trong scene | Texture nhúng 512 / 1024 |
|---|---:|---:|---:|---:|
| Stillwater | 18,74 MB | 24,60 MB | 1.755.067 | 0,72 / 6,58 MB |
| A0302 | 6,00 MB | 11,80 MB | 373.390 | 0,54 / 6,35 MB |

MB ở bảng là 1.000.000 byte. Geometry gồm các instance. Chỉ số tam giác/khung của Three.js cao hơn vì tính các lượt render; không dùng nó thay số tam giác nguồn. Ước lượng texture RGBA + mipmaps ở mức 512 px là 34,67 MiB và 41,33 MiB; mức 1024 px là 138,67 và 165,33 MiB. Đây là phép tính kích thước, **không phải VRAM đo được**, không gồm HDRI, shadow, framebuffer hoặc render target.

Source `.blend`: Stillwater 76.794.330 byte; A0302 77.582.734 byte. [Manifest nguồn và model](evidence/photoreal/source-manifest.json) có SHA-256 và số liệu chính xác. Cả bốn GLB sau giải nén được validator báo 0 errors, 0 warnings; GPU instancing vẫn cần kiểm tra bằng trình duyệt vì validator không hỗ trợ kiểm tra đầy đủ extension này.

HDRI web 512 × 256, 377.187 byte; source Cycles giữ bản 2K. Chế độ cân bằng dùng alpha blending có phản xạ cho kính/nước để tránh thêm lượt render khúc xạ; chế độ chi tiết giữ transmission. Đây là khác biệt chất lượng có chủ đích giữa hai chế độ, không phải thay mô hình bằng ảnh.

## Đối chiếu trực tiếp với tham chiếu

| Tiêu chí | Thay đổi quan sát được so với baseline | Khoảng cách còn lại |
|---|---|---|
| REF-01: hình học, vật liệu, ánh sáng showroom | Mặt đứng có chiều sâu, khung kính, lan can, mái che; vật liệu gỗ/đá có map; Cycles có phản xạ và bóng gián tiếp | Kiến trúc vẫn lặp lại, nội thất nhìn qua kính ít biến thể; WebGL sáng và phẳng hơn Cycles, chưa có bối cảnh showroom tinh tế như tham chiếu |
| REF-02: aerial/masterplan | Hai tháp có sân, đường lát, bể nước thật và cây nguồn thư viện; aerial cùng scene với ảnh phối cảnh | Thiếu bối cảnh đô thị, đường giao thông và cảnh quan nhiều tầng; cây GLB mất mật độ lá sau LOD; nền ngoài khu đất còn sơ lược |
| REF-05: dollhouse và nội thất | Sofa, ghế, bàn, cây có UV/chất liệu nguồn; cùng bố trí phòng giữa dollhouse, GLB và panorama; góc dollhouse Cycles và GLB được nâng để thấy hai giường | Phòng ngủ, bồn rửa và thiết bị tắm còn đơn giản; bếp đã có slab liền tấm và đèn dưới tủ nhưng tủ trên vẫn tối; trang trí thiếu độ tự nhiên; cận cảnh chưa đạt tham chiếu |
| Bố cục và tương tác | Chế độ xem được ghi nhãn, chọn trực tiếp căn/phòng, bố cục desktop/mobile riêng | Chất lượng tương tác không bù được hạn chế nội thất/vật liệu. Ảnh tĩnh tham chiếu không chứng minh được hành vi hoặc hiệu năng của website tham chiếu |

Ảnh trước nằm trong [evidence/final](evidence/final), ảnh ứng dụng mới trong [evidence/photoreal](evidence/photoreal). [Bảng trước/sau](evidence/photoreal/comparison.html) phân biệt render offline với screenshot GLB. Sáu ảnh tham chiếu của người dùng vẫn ở `.agent-work/visual-references`, không đưa vào tài sản sản phẩm hoặc repository.

## Hiệu năng và screenshot thực tế

Lượt đo ngày 26.11.2026 dùng Ryzen 7 6800H, 16 luồng, 15,19 GiB RAM, AMD Radeon tích hợp qua ANGLE/D3D11, Chromium headless 159.0.8154.6. Cycles và E2E đã kết thúc trước khi đo. Mỗi lượt xoay có 1 giây làm nóng rồi khoảng 5 giây lấy mẫu khoảng cách frame; không dùng GPU timer query.

| Cảnh / viewport | Canvas thực | FPS đo | p95 frame | GLB giải mã + đưa vào scene | Render khung đầu trả về |
|---|---:|---:|---:|---:|---:|
| Stillwater / desktop 1440 × 1000 | 1036 × 714 | 60,01 | 18,0 ms | 768 ms | 1.600 ms |
| A0302 / desktop 1440 × 1000 | 1036 × 714 | 60,00 | 18,0 ms | 222 ms | 677 ms |
| Stillwater / viewport 390 × 844 | 350 × 350 | 60,00 | 17,9 ms | 444 ms | 596 ms |
| A0302 / viewport 390 × 844 | 350 × 350 | 60,01 | 18,1 ms | 99 ms | 257 ms |

Tất cả dùng mức cân bằng 512 px, DPR 1, localhost. Viewport nhỏ dùng **cùng máy Windows**, không phải điện thoại thật. Các lần xem sau có thể dùng cache trình duyệt. Thời gian render đầu là khi `renderer.render()` trả về, không phải thời điểm pixel được trình bày. Không suy ra hiệu năng trên mạng công cộng, thiết bị di động hoặc mức 1024 px từ bảng này.

Trong lượt xoay, Stillwater ghi 68 draw calls / 1.755.643 tam giác mỗi khung; A0302 38 / 373.486. Các số này phụ thuộc lượt render và khác screenshot đầu có tính cả shadow pass. Hai scene không tăng bộ đếm render khi đứng yên. Chuyển mức 1024 px tải được ở cả hai scene; chưa benchmark mức này. Không có lỗi page/HTTP hoặc tràn ngang trong lượt chụp.

Raycast đổi lựa chọn Stillwater từ A0302 sang A0401 và A0302 từ phòng khách sang phòng ngủ 1. Có 14 screenshot mới gồm ảnh Cycles, GLB desktop/mobile, mức chi tiết và panorama. Một lượt truy cập local ghi LCP 332 ms, CLS 0; đây không phải field data. [runtime.json](evidence/photoreal/runtime.json) lưu số đo gốc, renderer và phương pháp tái chạy nằm trong pipeline README.

## Kiểm thử bộ đã sửa

Typecheck, lint và production build đạt; 64/64 unit/component và 42/42 E2E đạt trong 230 giây, không skipped/flaky. Sau khi nâng góc camera GLB A0302 ngày 26.11, build và lint file thay đổi đạt; ba bài flagship chạy lại đều đạt trong 42,6 giây. Bộ E2E gồm 39 luồng đã có và 3 bài flagship; giữ expect 12 giây/test 45 giây. Bao phủ orbit, lựa chọn căn/phòng, context recovery, panorama keyboard/mobile cùng Buyer, CRM, Management, booking/payment và phân quyền. [checks.json](evidence/photoreal/checks.json) ghi kết quả; ảnh ứng dụng và phép đo browser là lớp kiểm chứng riêng.

## Giới hạn và tài nguyên cần bổ sung

1. Cần scene kiến trúc do nghệ sĩ archviz hoàn thiện: chi tiết giao tiếp vật liệu, mái/cảnh quan, bối cảnh đô thị và quy hoạch tương ứng Stillwater. Model phải được cấp phép sửa và phân phối trong ứng dụng web; ảnh render có quyền sử dụng thương mại là chưa đủ để phân phối GLB.
2. Cần bộ giường, tủ, bếp, thiết bị vệ sinh cao cấp có UV/PBR và quyền phân phối model. Đá mặt bàn đã đổi sang slab; hình học bồn rửa, phụ kiện và chi tiết cabinetry vẫn cần hoàn thiện. Chỉ mua/tải khi đã kiểm tra giấy phép của từng tài sản.
3. Cần LOD cây bảo toàn tán lá, tối ưu kính và shadow trên web; xem xét baked GI/lightmap và KTX2. Không tăng polygon hoặc texture đơn thuần rồi gọi là photorealistic.
4. Máy hiện tại RAM khoảng 15,19 GiB và GPU tích hợp, nên render các cảnh tuần tự. GPU rời nhiều VRAM sẽ giúp tăng tốc thử ánh sáng và sample; bản thân phần cứng không giải quyết chất lượng bố cục hay asset.
5. Cần đo trên điện thoại thật và mạng có giới hạn băng thông. Viewport 390 px trên máy Windows không phải benchmark điện thoại.

Đề bài bổ sung tài sản nên giao thành hai gói: (a) scene Stillwater giữ đúng 2 tháp × 6 tầng × 4 ID căn, thêm cấu kiện mặt đứng và cảnh quan có tỷ lệ; (b) scene A0302 giữ topology 107 m², hoàn thiện giường/chăn, cabinetry, slab và phụ kiện. Mỗi gói phải giao `.blend` cùng texture, manifest quyền phân phối, bản render kiểm tra và GLB có LOD. Đây là đề xuất sản xuất, chưa thuê hoặc mua tài sản.

Nguồn CC0 hiện dùng có thể tiếp tục bổ sung đồ nội thất từ [thư viện Poly Haven](https://polyhaven.com/models/furniture). Tuy nhiên, ví dụ [Gothic Bed 01](https://polyhaven.com/a/GothicBed_01) tuy có giấy phép CC0 nhưng không phù hợp ngôn ngữ nội thất hiện đại của A0302; không chọn chỉ vì miễn phí. Chưa xác minh được bộ kiến trúc có sẵn vừa khớp Stillwater vừa cho phép phân phối GLB, nên phương án kiến trúc đặt dựng cần yêu cầu quyền sửa và phân phối rõ ràng trong thỏa thuận.

Chỉ sau khi chủ dự án nghiệm thu hai cảnh mới nâng cấp các dự án/căn hộ khác, Landing, coverflow và toàn bộ tour. PR giữ mở; không merge `main`. Kết quả kỹ thuật và hạn chế thị giác đều phải được giữ trong hồ sơ này.
