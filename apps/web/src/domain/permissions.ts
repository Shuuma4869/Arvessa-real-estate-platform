import { Role, Scope } from "./types";
export const crmModules = [
  "dashboard",
  "leads",
  "customers",
  "pipeline",
  "inventory",
  "appointments",
  "reservations",
  "payments",
  "contracts",
  "tasks",
  "support",
  "marketing",
  "reports",
  "personal",
] as const;
export const managementModules = [
  "dashboard",
  "teams",
  "approvals",
  "inventory",
  "finance",
  "security",
  "cms",
  "settings",
] as const;
export const moduleNames: Record<string, string> = {
  dashboard: "Tổng quan",
  leads: "Khách hàng tiềm năng",
  customers: "Khách hàng 360°",
  pipeline: "Cơ hội kinh doanh",
  inventory: "Giỏ hàng bất động sản",
  appointments: "Lịch hẹn & tham quan",
  reservations: "Trung tâm giữ căn",
  payments: "Đặt cọc & thanh toán",
  contracts: "Hợp đồng & tài liệu",
  tasks: "Công việc & lịch",
  support: "Chăm sóc khách hàng",
  marketing: "Chiến dịch",
  reports: "Báo cáo & phân tích",
  personal: "Không gian cá nhân",
  teams: "Đội ngũ",
  approvals: "Trung tâm phê duyệt",
  finance: "Tài chính & pháp chế",
  security: "Bảo mật & phân quyền",
  cms: "Thương hiệu & nội dung",
  settings: "Thiết lập workspace",
  properties: "Bất động sản của tôi",
  profile: "Hồ sơ & bảo mật",
};
const access: Record<Role, string[]> = {
  buyer: [],
  sales: [
    "dashboard",
    "leads",
    "customers",
    "pipeline",
    "inventory",
    "appointments",
    "reservations",
    "tasks",
    "personal",
  ],
  leader: [
    "dashboard",
    "leads",
    "customers",
    "pipeline",
    "inventory",
    "appointments",
    "reservations",
    "tasks",
    "reports",
    "personal",
  ],
  support: [
    "dashboard",
    "customers",
    "appointments",
    "support",
    "tasks",
    "personal",
  ],
  legal: ["dashboard", "contracts", "customers", "tasks", "personal"],
  finance: ["dashboard", "payments", "customers", "reports", "personal"],
  manager: [...crmModules],
  admin: [...crmModules],
  platform: [...crmModules],
};
export function canEnter(role: Role, scope: Scope) {
  return scope === "buyer"
    ? role === "buyer"
    : scope === "crm"
      ? role !== "buyer"
      : ["leader", "manager", "admin", "platform", "finance", "legal"].includes(
          role,
        );
}
export function canModule(role: Role, scope: Scope, module: string) {
  if (!canEnter(role, scope)) return false;
  if (scope === "buyer")
    return [
      "dashboard",
      "properties",
      "appointments",
      "reservations",
      "payments",
      "contracts",
      "profile",
      "support",
    ].includes(module);
  if (scope === "crm") return access[role].includes(module);
  if (["admin", "platform", "manager"].includes(role))
    return managementModules.includes(
      module as (typeof managementModules)[number],
    );
  return (
    role === "leader"
      ? ["dashboard", "teams", "approvals"]
      : ["dashboard", "approvals", "finance"]
  ).includes(module);
}
export function canApprove(role: Role, kind: string) {
  if (["admin", "platform", "manager"].includes(role)) return true;
  return kind === "extension"
    ? role === "leader"
    : kind === "refund" || kind === "adjustment"
      ? role === "finance"
      : kind === "contract"
        ? role === "legal"
        : false;
}
export function canWrite(role: Role, entity: string) {
  if (["admin", "platform", "manager"].includes(role)) return true;
  const rights: Record<string, Role[]> = {
    leads: ["sales", "leader"],
    customers: ["sales", "leader", "support", "buyer"],
    opportunities: ["sales", "leader"],
    appointments: ["sales", "leader", "support", "buyer"],
    tasks: ["sales", "leader", "support", "legal"],
    tickets: ["support", "buyer"],
    campaigns: ["leader"],
    employees: [],
    contracts: ["legal"],
  };
  return rights[entity]?.includes(role) ?? false;
}
export const isPrivileged = (role: Role) =>
  ["manager", "admin", "platform"].includes(role);
