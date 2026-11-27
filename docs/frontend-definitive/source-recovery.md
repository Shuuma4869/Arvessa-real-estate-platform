# Khôi phục cảnh và sản xuất lại

Dùng Blender 4.5.9 LTS. Bản portable có thể mở trực tiếp tại D:\ARVESSA\.agent-work\definitive\portable-sources. Manifest ghi SHA-256 riêng cho file làm việc và file đóng gói. Lần mở lại ghi nhận A0302 có 748 object, 48 ảnh nhúng; Stillwater có 4.289 object, 44 ảnh nhúng. Cả hai đều có 0 thư viện ngoài.

- [Manifest A0302](evidence/restore-A0302.json)
- [Manifest Stillwater](evidence/restore-Stillwater.json)
- [Nguồn và giấy phép](../../apps/web/public/spatial-flagships/CREDITS.md)
- [Danh sách asset có checksum](../../design/spatial/assets.lock.json)

Để kiểm checksum, chạy `Get-FileHash -Algorithm SHA256 <đường-dẫn-file-blend>` rồi so với `archiveSha256`. File GLB và WebP đi cùng Git. Hai bản Blender đóng gói nặng khoảng 673 MB cộng lại, nằm trên ổ D của workspace. Để phục hồi từ máy khác khi ổ này mất dữ liệu, cần một bản sao ngoài máy hoặc dựng lại theo recipe. Lần kiểm hiện tại mở lại bản đóng gói trên cùng máy.

### Dựng lại từ đầu

Làm theo [quy trình nguồn v1](../../design/spatial/README.md) để tải asset, xuất hợp đồng layout và dựng hai cảnh nền. Mở PowerShell tại gốc repository. Python dùng NumPy và Pillow để tạo góc nhìn rectilinear từ panorama.

```powershell
$blender = '.agent-work/photoreal/tools/blender-4.5.9-windows-x64/blender.exe'
& $blender -b --python-exit-code 1 -P design/spatial/finish-apartment.py
& $blender -b --python-exit-code 1 -P design/spatial/render-room-tour.py
& $blender -b --python-exit-code 1 -P design/spatial/render-saved-view.py -- .agent-work/definitive/interior-v2/A0302.blend --cpu
python design/spatial/publish-room-tour.py
& $blender -b --python-exit-code 1 -P design/spatial/export-web.py -- A0302 .agent-work/definitive/interior-v2/A0302.blend
node design/spatial/optimize-web.mjs --models-only --scene=A0302 --source-dir=.agent-work/definitive/interior-v2
node design/spatial/lightweight.mjs A0302 .agent-work/definitive/interior-v2
node design/spatial/verify-web.mjs
```

Xem [quy trình ngoại thất](spatial-production.md) để dựng và render Stillwater. Đầu vào phòng, vị trí camera và các cửa nối dùng cùng hệ tọa độ. Đọc [thông số và thời gian từng góc](evidence/room-tour.json) trước khi đổi camera. Dùng [quy trình kiểm nguồn đóng gói](../../design/spatial/verify-source-recovery.py) để đóng gói rồi mở lại bản mới. Kết quả có thể chênh lệch theo phiên bản Blender, driver và thiết bị render.
