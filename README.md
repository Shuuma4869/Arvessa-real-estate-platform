# ARVESSA

**Architecture · Vision · Experience**  
*Luxury Architectural Digital Brand*

ARVESSA là định hướng cho một nền tảng bất động sản cao cấp, kết hợp trải nghiệm số với CRM doanh nghiệp. Thương hiệu đặt chất lượng không gian, khả năng nhìn dài hạn và trải nghiệm sử dụng vào cùng một hệ thống.

## Trạng thái

Dự án đang ở bước xây dựng nền tảng thương hiệu và khám phá nhận diện. Chưa có ứng dụng chạy, công nghệ được chốt hay dịch vụ được triển khai. Ba SVG trong `design/logo/` là bản concept đầu tiên, chưa phải bộ nhận diện chính thức.

Repo Git đã được khởi tạo trên nhánh `main`, chưa có commit. Nội dung tạm trong `.agent-work/` được bỏ qua theo `.gitignore`.

## Cấu trúc

```text
ARVESSA/
├── README.md
├── .gitignore
├── docs/
│   └── .gitkeep
├── design/
│   └── logo/
│       ├── logo-brief.md
│       ├── logo-directions.md
│       ├── logo-usage.md
│       ├── arvessa-primary.svg
│       ├── arvessa-mark.svg
│       └── arvessa-monogram.svg
├── brand/
│   ├── brand-overview.md
│   ├── brand-voice.md
│   └── naming.md
├── assets/
│   └── .gitkeep
├── apps/
│   └── .gitkeep
├── packages/
│   └── .gitkeep
├── services/
│   └── .gitkeep
├── tests/
│   └── .gitkeep
└── .agent-work/
    └── .gitkeep
```

| Thư mục | Vai trò |
| --- | --- |
| `docs/` | Tài liệu sản phẩm, kiến trúc hệ thống và các quyết định kỹ thuật khi phát sinh. |
| `design/` | Nghiên cứu thiết kế, bản thiết kế gốc và hướng dẫn sử dụng. |
| `brand/` | Định vị, giọng thương hiệu và quy tắc tên gọi. |
| `assets/` | Tài nguyên đã duyệt để đưa vào sản phẩm; chưa sao chép logo concept vào đây. |
| `apps/` | Các ứng dụng triển khai độc lập khi bắt đầu phát triển. |
| `packages/` | Mã dùng chung giữa các ứng dụng. |
| `services/` | Dịch vụ nghiệp vụ và tích hợp phía máy chủ. |
| `tests/` | Kiểm thử tích hợp và hành trình xuyên ứng dụng; kiểm thử đơn vị đặt cạnh mã nguồn. |
| `.agent-work/` | Nghiên cứu, bản nháp và kết quả kiểm tra tạm; Git bỏ qua nội dung, trừ `.gitkeep`. |

## Bắt đầu từ đâu

1. Đọc [tổng quan thương hiệu](brand/brand-overview.md), [giọng thương hiệu](brand/brand-voice.md) và [quy tắc tên gọi](brand/naming.md).
2. Đọc [đề bài logo](design/logo/logo-brief.md) và [ba hướng concept](design/logo/logo-directions.md).
3. Mở các SVG trực tiếp bằng trình duyệt hoặc công cụ vector. Đối chiếu [hướng dẫn sử dụng](design/logo/logo-usage.md) trước khi đưa vào mockup.

## Nguyên tắc làm việc

- Chỉ thêm thư mục khi có nội dung và người phụ trách rõ ràng.
- Chốt phạm vi sản phẩm trước khi chọn framework hoặc tạo ứng dụng mẫu.
- Giữ bản thiết kế gốc ở `design/`; tài nguyên đã duyệt mới được xuất sang `assets/`.
- Không commit khóa truy cập, cấu hình bí mật, dữ liệu khách hàng hay file tạm của AI.
- Đặt mọi nghiên cứu và thử nghiệm tạm trong `.agent-work/`. `.gitkeep` chỉ giữ thư mục trong Git.
- Khi bắt đầu viết mã, bổ sung hướng dẫn cài đặt, chạy và kiểm thử theo công nghệ thực tế.

## Bước tiếp theo

Đánh giá concept trên website, dashboard và CRM; tinh chỉnh hình học, khoảng cách chữ và khả năng đọc ở kích thước nhỏ. Sau khi duyệt nhận diện, xuất bộ màu, bản âm/dương và icon theo nền tảng. Đồng thời xác định hành trình sản phẩm đầu tiên để xây kiến trúc ứng dụng.
