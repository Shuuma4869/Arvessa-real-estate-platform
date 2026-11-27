# ARVESSA — nguồn hai cảnh flagship

**Chờ nghiệm thu mỹ thuật.** Hai nguồn Blender riêng thuộc The Stillwater và A0302. Những căn còn lại dùng nội thất mẫu theo số phòng ngủ. [Bản giao Definitive Edition](../../docs/frontend-definitive/final-review.md).

## Cảnh hiện hành

Quy trình dưới đây khôi phục nguồn v1. Để tái tạo Stillwater đang trình diễn, dùng [tài liệu sản xuất ngoại thất](../../docs/frontend-definitive/spatial-production.md) sau khi có nguồn v1. Tài liệu ghi tám góc máy, phiên bản mô hình, bộ thử và bản giao.

## Tái tạo nguồn v1

Chạy từ root repository. Ứng dụng web chỉ cần các file đã xuất trong `apps/web/public/spatial-flagships`; không cần Blender hoặc Python để xem bản demo.

```powershell
npm --prefix apps/web ci
npm --prefix design/spatial ci
python design/spatial/setup-blender.py
python design/spatial/fetch-assets.py
node design/spatial/export-contract.mjs
$blender = '.agent-work/photoreal/tools/blender-4.5.9-windows-x64/blender.exe'
& $blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python design/spatial/verify-geometry.py
& $blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python design/spatial/build-exterior.py -- day golden aerial
& $blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python design/spatial/build-interior.py -- living kitchen dollhouse panorama
& $blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python design/spatial/export-web.py -- Stillwater
& $blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python design/spatial/export-web.py -- A0302
& $blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python design/spatial/prepare-environment.py
node design/spatial/optimize-web.mjs
node design/spatial/verify-web.mjs
```

Windows x64, Blender 4.5.9 LTS được ghim SHA-256. `production.reset()` chọn HIP nếu có GPU AMD tương thích; máy khác cần chọn backend Cycles được hỗ trợ. Các phép đo chỉ áp dụng cho máy ghi trong báo cáo, không phải cam kết hiệu năng cho mọi máy.

Trang `/spatial-review` mặc định tải vật liệu 512 px (`*-balanced.glb`); người xem có thể chọn 1024 px. Hai mức giữ cùng hình học và vùng chọn. `--models-only` chỉ xuất model, `--images-only` chỉ cập nhật ảnh/HDRI/report. `verify-web.mjs` kiểm tra cả bốn GLB và giải nén Meshopt trước khi kiểm tra tangent. Các thông báo “unsupported extension” của validator không phải chứng nhận GPU instancing; bước chạy viewer thực tế vẫn bắt buộc.

Để chỉnh riêng góc dollhouse từ scene đã lưu trên máy HIP, chạy `render-saved-view.py` bằng Blender như các script trên. Script này không sửa source `.blend`; nó bỏ các đối tượng cutaway/context và dùng cùng camera cao 22 m như bản dựng chính. Chạy lại `optimize-web.mjs --images-only` để cập nhật ảnh web.

Không chạy đồng thời các scene nặng trên máy RAM 16 GB. File tải có checksum; một file có sẵn sai checksum sẽ làm script dừng, không bị ghi đè. Không có thông tin đăng nhập hoặc API trả phí.

## Tái kiểm tra trong ứng dụng

Sau khi build và mở production server, có thể chụp lại bằng chứng bằng Playwright đã cài cho `apps/web`:

```powershell
$env:ARVESSA_TEST_PORT = '3038' # đổi theo cổng server đang chạy
$env:ARVESSA_BENCHMARK_HARDWARE = '1'
node design/spatial/capture-review.mjs
```

Trên Windows, lựa chọn hardware dùng ANGLE/D3D11 và `--ignore-gpu-blocklist`; renderer thực được ghi trong JSON. Bỏ biến này để dùng cấu hình mặc định của trình duyệt. Script ghi đè có chủ đích bộ screenshot/report tại `docs/frontend-definitive/evidence/realtime`, kiểm tra raycast, hai mức vật liệu và overflow. Không chạy đồng thời với Cycles hoặc benchmark khác. FPS là khoảng cách thời gian giữa các frame trong lượt xoay 5 giây sau 1 giây làm nóng; không phải GPU timer query. Viewport mobile vẫn dùng cùng máy desktop.

`loadMs` kết thúc khi GLB đã giải mã và đưa vào scene. `firstFrameMs` kết thúc khi lần gọi render đầu chứa model trả về; không phải thời gian tải mạng công cộng hoặc phép đo trình bày pixel của màn hình. LCP/CLS là một lượt local, không phải field data. Công cụ không chấm đạt/chưa đạt mỹ thuật.

HDRI web là bản float HDR 512 × 256 từ cùng nguồn 2K, giảm chi phí tạo bản đồ phản xạ PMREM lúc tải lạnh. HDRI dùng trong Cycles giữ nguyên. Đây là tối ưu thời gian thực, không phải cải thiện chất lượng ảnh offline.

Chế độ cân bằng dùng alpha blending có phản xạ môi trường cho kính/nước; chế độ chi tiết giữ screen-space transmission. Hai chế độ đều là hình học 3D, có thể xoay/chọn, và không tương đương path tracing. LOD Stillwater giảm riêng chậu, đất trong chậu và thân cây ở góc nhìn tổng thể; không áp dụng mức giảm đó vào nội thất A0302 hoặc source Cycles.

## Nguồn và cấu trúc

- `assets.lock.json`: URL nguồn, tác giả, giấy phép, số byte và SHA-256 từng file. Poly Haven dùng thêm checksum nhà phát hành. **Powered by Poly Haven**.
- `fetch-assets.py`: tải lại đúng các source assets trong lockfile. `setup-blender.py` chỉ cài công cụ portable trong cache.
- `export-contract.mjs` → `scene-contract.json`: xuất từ seed và `residence-layout.ts`, kiểm tra 48 căn và A0302 107 m² / 2 PN. Không thay ID, giá hoặc trạng thái căn.
- `production.py`: vật liệu, UV theo mét, import asset có UV, camera, ánh sáng và phép đo render.
- `build-exterior.py`: 2 tháp × 6 tầng × 4 căn; chi tiết mặt đứng, mặt nước có chiều sâu, sân vườn và cây có texture. Sofa được đặt trong các căn nhìn qua kính.
- `build-interior.py`: duy nhất A0302, cửa/phòng dùng topology chung; sofa, ghế, bàn và cây nhập từ nguồn được cấp phép. Giường, tủ, bếp, thiết bị tắm và trang trí còn là mô hình tự dựng, cần chủ dự án xem xét chất lượng cận cảnh.
- `export-web.py`: tạo bản cutaway và LOD cho web, giữ source Cycles; texture tối đa 1024 px, batch kiến trúc theo vật liệu, chia sẻ mesh cho cây.
- `optimize-web.mjs`: kiểm tra GLB nguồn bằng Khronos Validator; dedup, GPU instancing, WebP quality 95 và Meshopt; sinh và sửa tangent suy biến, kiểm tra lại bản giải nén bằng `verify-web.mjs`. Ảnh render chuyển WebP quality 92. WebP giảm dung lượng truyền, **không** phải nén texture GPU như KTX2.

File `.blend`, PNG gốc, HDRI/model nguồn và log ở `.agent-work/photoreal/`, được giữ local và Git ignore. Hai source scene nằm tại `flagships/Stillwater.blend` và `flagships/A0302.blend`; texture ngoài nằm trong `library/`. Cần giữ cả thư mục library hoặc chạy fetch trước khi mở source. Không commit các bản render thử hoặc bộ cài Blender. Bản clone sạch có GLB/ảnh web; source offline được tái lập bằng các lệnh trên.

Hệ tọa độ: Blender `(x, -z, height)` từ layout; GLB xuất Y-up thành `(x, height, z)`. Tỷ lệ đồng nhất `sqrt(107/(11.2×11.4))`. Đây là diện tích và mặt bằng minh họa, không phải BIM/CAD đã đo đạc. Các ảnh và panorama dùng cùng scene; dollhouse bỏ trần và hai tường ngoài để nhìn vào phòng. Light bổ trợ cutaway chỉ dùng cho ảnh dollhouse, không tồn tại trong panorama.

## Giấy phép

Models/textures/HDRI Poly Haven: [CC0](https://polyhaven.com/license). Tác giả và nguồn chi tiết ở lockfile. Không dùng ảnh preview trên website Poly Haven.

Đá mặt bàn/backsplash/vanity: [Marble 014, ambientCG](https://ambientcg.com/view?id=Marble014), [CC0](https://docs.ambientcg.com/license/). Đây là vật liệu PBR tạo bằng phương pháp procedural, không phải photoscan. Lockfile ghim archive ZIP và từng map Color/Roughness/NormalGL; downloader chỉ lấy các thành viên đã khai báo, không mở file `.blend` đi kèm archive.

`verify-geometry.py` kiểm tra khối hộp có thể tích dương và cạnh manifold ở ba mức bevel. `box()` cũng kiểm tra pháp tuyến hướng ra ngoài cho từng khối được dựng. Kiểm tra này bắt lỗi khúc xạ do winding đảo mà glTF Validator không phát hiện như lỗi định dạng; vẫn cần xem trực tiếp kính trong ảnh render.

**GlamVelvetSofa**, © 2021 Wayfair, LLC; Eric Chadwick. Nguồn [Khronos glTF Sample Assets, commit f0920f5](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/f0920f5b32d172a30efe3f9257e965918831e6ea/Models/GlamVelvetSofa), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Thay đổi: vị trí, tỷ lệ, tối ưu geometry/texture và export; giữ vật liệu velvet xanh. Không hàm ý tác giả hoặc Wayfair tài trợ ARVESSA. Attribution cũng có trên trang `/spatial-review` và đi cùng asset xuất.

Asset gỗ/đá/vải có albedo, roughness và normal. Vải cream dùng normal/roughness nguồn với albedo nhuộm trơn; kim loại, kính, nước và sơn dùng shader vật lý riêng. Không khẳng định mọi vật liệu đều là photoscan. HDRI ban ngày và hoàng hôn được ghi trong source; Cycles 128 samples, denoise, AgX Medium High Contrast, 10 bounces, transmission 8. Các thời gian render được ghi ngay sau mỗi lần render.

Tham khảo kỹ thuật: [Blender 4.5 texture coordinates](https://docs.blender.org/manual/en/4.5/render/shader_nodes/input/texture_coordinate.html), [glTF Transform CLI](https://gltf-transform.dev/cli), [Khronos Validator](https://github.com/KhronosGroup/glTF-Validator). Các kết quả validator, E2E hoặc FPS không thay thế nghiệm thu thị giác.

## Tương tác trên trình dựng phần mềm

Canvas Building Explorer và flagship nhận diện renderer WebGL thực qua `WEBGL_debug_renderer_info`. Chỉ với SwiftShader/llvmpipe/softpipe, độ phân giải canvas giảm tạm về tối đa DPR 0,65 khi kéo/xoay, rồi về DPR đầy đủ sau khi OrbitControls dừng thay đổi 240 ms. Geometry, texture, ánh sáng và ảnh Cycles giữ nguyên. Máy có GPU phần cứng không áp dụng chế độ này. Đây là đánh đổi độ nét trong lúc chuyển động để giữ phản hồi, không phải cải thiện photorealism.

Hai bài raycast/exterior kiểm tra canvas trở về DPR 1 sau khi kéo trong viewport test. Có thể tái lập WebGL phần mềm bằng Chromium `--use-gl=angle --use-angle=swiftshader`, theo [tài liệu Chromium](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/swiftshader.md). Không tăng timeout hoặc bỏ assertion để che độ trễ.

Explorer dùng damping theo thời gian giữa các frame để quán tính không kéo dài trên trình dựng chậm. Khôi phục độ phân giải vẫn phải vượt qua assertion; không giữ canvas ở mức thấp để làm bài kiểm thử đạt.
