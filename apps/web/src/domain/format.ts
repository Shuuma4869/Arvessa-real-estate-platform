export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
export const compactMoney = (n: number) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n / 1e9)} tỷ`;
export const dateTime = (n: number | string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(n));
export function monthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
) {
  const n = years * 12,
    r = annualRate / 1200;
  return r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
}
export function csvCell(value: unknown) {
  const s = String(value ?? "");
  return `"${s.replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
}
