import { Appointment, Role } from "./types";

const pending = "Chờ xác nhận";
const confirmed = "Đã xác nhận";
const checkedIn = "Đã check-in";
const complete = "Đã hoàn thành";
const cancelled = "Đã hủy";

export function appointmentStatuses(role: Role, current?: string): string[] {
  if (!current) return role === "buyer" ? [pending] : [pending, confirmed];
  if (current === pending)
    return role === "buyer"
      ? [pending, cancelled]
      : [pending, confirmed, cancelled];
  if (current === confirmed)
    return role === "buyer"
      ? [confirmed, cancelled]
      : [confirmed, checkedIn, cancelled];
  if (current === checkedIn && role !== "buyer") return [checkedIn, complete];
  return [current];
}

export function appointmentStatus(
  role: Role,
  previous: Appointment | undefined,
  requested: string | undefined,
  date: string,
  propertyId: string,
  customerId: string,
  staff: string,
) {
  const status = requested || previous?.status || pending;
  if (!appointmentStatuses(role, previous?.status).includes(status))
    throw new Error("Không thể chuyển lịch hẹn sang trạng thái này.");
  const changed =
    previous &&
    (Date.parse(previous.date) !== Date.parse(date) ||
      previous.propertyId !== propertyId ||
      previous.customerId !== customerId ||
      previous.staff !== staff);
  if (changed && ![pending, confirmed].includes(previous.status))
    throw new Error("Lịch đã đóng hoặc check-in. Hãy tạo lịch mới.");
  if (changed && role === "buyer" && status === confirmed) return pending;
  return status;
}
