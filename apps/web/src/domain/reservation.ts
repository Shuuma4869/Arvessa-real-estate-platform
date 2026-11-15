import { ReservationStatus } from "./types";
export const transitions: Record<ReservationStatus, ReservationStatus[]> = {
  HOLD_REQUESTED: ["HOLD_CONFLICT", "TEMPORARILY_HELD"],
  HOLD_CONFLICT: [],
  TEMPORARILY_HELD: [
    "HOLD_EXPIRED",
    "HOLD_CANCELLED",
    "EXTENSION_REQUESTED",
    "PAYMENT_PENDING",
  ],
  EXTENSION_REQUESTED: ["TEMPORARILY_HELD", "HOLD_CANCELLED", "HOLD_EXPIRED"],
  PAYMENT_PENDING: [
    "PAYMENT_FAILED",
    "PAYMENT_VERIFICATION",
    "DEPOSIT_CONFIRMED",
    "HOLD_EXPIRED",
  ],
  PAYMENT_FAILED: [
    "PAYMENT_PENDING",
    "HOLD_CANCELLED",
    "HOLD_EXPIRED",
    "EXTENSION_REQUESTED",
  ],
  PAYMENT_VERIFICATION: ["DEPOSIT_CONFIRMED", "PAYMENT_FAILED"],
  DEPOSIT_CONFIRMED: ["CONTRACT_PENDING", "HOLD_CANCELLED"],
  CONTRACT_PENDING: ["CONTRACT_COMPLETED", "HOLD_CANCELLED"],
  CONTRACT_COMPLETED: [],
  HOLD_EXPIRED: [],
  HOLD_CANCELLED: [],
};
export const activeStatuses: ReservationStatus[] = [
  "HOLD_REQUESTED",
  "TEMPORARILY_HELD",
  "EXTENSION_REQUESTED",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
  "PAYMENT_VERIFICATION",
  "DEPOSIT_CONFIRMED",
  "CONTRACT_PENDING",
  "CONTRACT_COMPLETED",
];
export const expirableStatuses: ReservationStatus[] = [
  "TEMPORARILY_HELD",
  "EXTENSION_REQUESTED",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
];
export function transition(from: ReservationStatus, to: ReservationStatus) {
  if (!transitions[from].includes(to))
    throw new Error(`Không thể chuyển từ ${from} sang ${to}.`);
  return to;
}
export const remainingSeconds = (expiresAt: number, now: number) =>
  Math.max(0, Math.ceil((expiresAt - now) / 1000));
export const statusNames: Record<string, string> = {
  AVAILABLE: "Còn trống",
  HELD: "Đang giữ",
  RESERVED: "Đã đặt cọc",
  SOLD: "Đã bán",
  HOLD_REQUESTED: "Đang yêu cầu",
  HOLD_CONFLICT: "Xung đột giữ căn",
  TEMPORARILY_HELD: "Đang giữ căn",
  HOLD_EXPIRED: "Hết hạn giữ căn",
  HOLD_CANCELLED: "Đã hủy",
  EXTENSION_REQUESTED: "Chờ duyệt gia hạn",
  PAYMENT_PENDING: "Đang xử lý mô phỏng",
  PAYMENT_FAILED: "Thanh toán mô phỏng thất bại",
  PAYMENT_VERIFICATION: "Chờ đối soát",
  DEPOSIT_CONFIRMED: "Đã xác nhận cọc demo",
  CONTRACT_PENDING: "Đang làm hợp đồng",
  CONTRACT_COMPLETED: "Hoàn tất hợp đồng demo",
  SUBMITTED: "Đã gửi yêu cầu",
  FAILED: "Thất bại",
  VERIFICATION: "Chờ xác minh",
  CONFIRMED: "Đã xác nhận demo",
  REFUND_REQUESTED: "Chờ duyệt hoàn",
  REFUNDED: "Đã hoàn mô phỏng",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};
