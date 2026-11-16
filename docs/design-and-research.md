# Định hướng thiết kế và nguồn tham khảo

## Quyết định thiết kế

Public dùng bố cục editorial, hình kiến trúc nguyên bản, khoảng thở rộng và typography có tương phản. CRM dùng Manrope, nền sáng, nhãn trạng thái và mật độ dữ liệu rõ. Giữ nguyên tên **ARVESSA** và **Architecture · Vision · Experience**; không lặp brand line trong bảng dữ liệu.

Cormorant Garamond và Manrope được cài local bằng Fontsource, hỗ trợ tiếng Việt. Logo nguồn từ bước nền tảng không bị sửa hình học; thêm bản Ivory trên nền tối, mark đảo và favicon có nền đặc. Đây là nhận diện concept đủ dùng cho demo, chưa có kết luận pháp lý về quyền độc quyền.

| Token | Giá trị / ứng dụng |
|---|---|
| Ivory | `#F5F2EA`, nền public |
| Paper | `#FFFDF8`, panel/form |
| Forest | `#172F28`, CTA và workspace |
| Ink | `#172523`, nội dung và logo |
| Bronze | `#72542E`, chữ nhấn đã tăng độ đậm so với màu nghiên cứu ban đầu |
| Muted | `#535E56`, nội dung phụ |
| Motion | 160 / 260 / 650 ms; cubic-bezier(.22,1,.36,1) |

Sound mặc định tắt; Web Audio tạo âm sine ngắn, không cần tải asset ngoài. Không phát khi hover. Tùy chọn mute dừng oscillator đang chạy. CSS `prefers-reduced-motion` và tùy chọn riêng giảm animation. 3D không tự xoay.

## Nguồn đã đọc

Nghiên cứu phục vụ quyết định thiết kế và kỹ thuật, không sao chép asset, source code hay nhận diện của bên thứ ba.

- [Vide Infra — Springs](https://videinfra.com/work/springs): tham khảo cách nối câu chuyện không gian với thông tin dự án; áp dụng nhịp editorial, không dùng tài sản của trang.
- [Vinode](https://vinode.io/): tham khảo luồng khám phá tòa/căn liên kết CRM; ARVESSA dùng procedural geometry và fixture riêng.
- [Pipedrive](https://www.pipedrive.com/): tham khảo tổ chức công việc quanh pipeline, dữ liệu và bước tiếp theo.
- [Awwwards](https://www.awwwards.com/) và [MotionSites](https://motionsites.ai/): xem tổng quan hướng trình bày architectural/3D. Không dùng template tải sẵn.
- [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation): kiểm tra framework hiện hành; đồng thời đọc tài liệu `next/dist/docs` đi kèm phiên bản cài đặt.
- [Three.js](https://threejs.org/): lựa chọn engine 3D, mô hình dựng nguyên bản và quản lý vòng đời tài nguyên.
- [Motion](https://motion.dev/): tham khảo gesture/transition. Không cài thêm vì CSS transition, pointer events và Three.js đã đủ cho phạm vi demo.
- [WAI-ARIA modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): dùng native dialog, focus return và bàn phím.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): cơ sở kiểm tra labels, focus, tương phản, touch target và motion.
- [Web Vitals](https://web.dev/articles/vitals): phân biệt đo local với dữ liệu người dùng thực; không xem một lần đo lab là chứng nhận đạt Core Web Vitals.
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): ranh giới trách nhiệm server cho kiểm soát truy cập thật.

Các gallery Behance/Dribbble/Lapa và framework khác trong đề bài không được dùng làm dependency hoặc nguồn asset. Tập trung vào các nguồn trên để giữ ngôn ngữ ARVESSA nhất quán.

## Dependency

Stack chính: Next.js, React, TypeScript, Zustand, Zod, Three.js, Lucide; CSS tokens viết trực tiếp. Không cài đồng thời GSAP/Motion/Tailwind/shadcn khi chưa cần, giảm trùng chức năng. Kiểm thử dùng Vitest, Testing Library, Playwright và axe-core.

Các thư viện chính dùng MIT; Lucide dùng ISC; font dùng SIL OFL. File package lock giữ phiên bản chính xác. Dependency minimatch của công cụ lint được override lên bản đã sửa cảnh báo DoS; kiểm tra lại lint/build/tests sau thay đổi. Không có mã hoặc ảnh tải từ nguồn không rõ quyền sử dụng.
