# ARVESSA — không gian sống 360°

12 panorama equirectangular 4096 × 2048, bốn điểm nhìn (khách, bếp, phòng ngủ chính, loggia) cho mỗi loại căn 1/2/3 phòng ngủ. Không dùng ảnh tham khảo hoặc panorama bên thứ ba. Các PNG là bản render gốc; WebP dùng trong ứng dụng ở `apps/web/public/images/tours`.

Nguồn hình học: `residence-layout.ts` và `interior-model.ts`. Cùng dữ liệu phòng dùng cho SVG 2D, dollhouse và vị trí camera tour. Mặt bằng phân bổ diện tích minh họa theo diện tích căn; không phải hồ sơ bàn giao. AI concept trong gallery có vai trò moodboard, không được dùng thay panorama.

Tái tạo từ `apps/web` sau khi cài browser Playwright:

```sh
node scripts/render-tours.mjs
```

Script chạy renderer WebGL cô lập bằng Playwright, CubeCamera sáu hướng, chuyển cubemap sang sphere 2:1, lưu PNG và WebP. Không tải asset từ mạng. `catalog.json` ghi kích thước, camera, SHA-256, byte size và nguồn. Ghi đè các bản render có cùng tên khi chủ động chạy lại script.

Viewer thật có look-around chuột/chạm/phím, FOV zoom, hotspot đổi panorama, minimap, trước/sau, đặt lại và fullscreen. Không mô phỏng chuyển động đi bộ tự do. Trường hợp WebGL không có, mất context hoặc tải ảnh thất bại sẽ quay về mặt bằng 2D.
