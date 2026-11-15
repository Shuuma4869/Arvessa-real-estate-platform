"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ChartNoAxesCombined,
  Building2,
  CalendarDays,
  Bookmark,
  Wallet,
  Files,
  ListTodo,
  Headphones,
  Megaphone,
  ChartColumn,
  Settings,
  ShieldCheck,
  Paintbrush,
  PanelLeftClose,
  Search,
  Bell,
  LogOut,
  ArrowUpRight,
  X,
  ChevronRight,
} from "lucide-react";
import { useDemo } from "@/services/store";
import { Role, roles, roleNames, Scope } from "@/domain/types";
import {
  canEnter,
  canModule,
  crmModules,
  managementModules,
  moduleNames,
} from "@/domain/permissions";
import { brand } from "@/lib/brand";
import { Modal, Loading, LinkButton, Timeline } from "./ui";
const icons: Record<string, typeof Users> = {
  dashboard: LayoutDashboard,
  leads: Users,
  customers: Users,
  pipeline: ChartNoAxesCombined,
  inventory: Building2,
  appointments: CalendarDays,
  reservations: Bookmark,
  payments: Wallet,
  contracts: Files,
  tasks: ListTodo,
  support: Headphones,
  marketing: Megaphone,
  reports: ChartColumn,
  personal: Settings,
  teams: Users,
  approvals: ShieldCheck,
  finance: Wallet,
  security: ShieldCheck,
  cms: Paintbrush,
  settings: Settings,
  properties: Building2,
  profile: Settings,
};
const buyerModules = [
  "dashboard",
  "properties",
  "appointments",
  "reservations",
  "payments",
  "contracts",
  "profile",
  "support",
];
export function WorkspaceShell({
  scope,
  children,
}: {
  scope: Scope;
  children: ReactNode;
}) {
  const { data, session, ready, login, logout } = useDemo();
  const path = usePathname(),
    router = useRouter(),
    moduleKey = path.split("/")[2] || "dashboard";
  const [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [search, setSearch] = useState(false),
    [notifications, setNotifications] = useState(false),
    [q, setQ] = useState("");
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  if (!ready)
    return (
      <main id="main">
        <Loading />
      </main>
    );
  if (!session)
    return (
      <main id="main" className="error-page">
        <p className="eyebrow">DEMO SESSION</p>
        <h1>
          Không gian dành riêng
          <br />
          cho phiên đăng nhập.
        </h1>
        <p>
          Đăng nhập demo để tiếp tục. Dữ liệu trước đó vẫn được giữ trên trình
          duyệt.
        </p>
        <LinkButton href={`/sign-in?next=${encodeURIComponent(path)}`}>
          Đăng nhập demo
        </LinkButton>
      </main>
    );
  if (
    !canEnter(session.role, scope) ||
    !canModule(session.role, scope, moduleKey)
  )
    return (
      <main id="main" className="error-page">
        <ShieldCheck size={40} />
        <h1>Quyền truy cập giới hạn.</h1>
        <p>
          Vai trò {roleNames[session.role].toLowerCase()} không được mở khu vực
          này trong demo.
        </p>
        <LinkButton
          href={`/${session.role === "buyer" ? "buyer" : "crm"}/dashboard`}
        >
          Về không gian của tôi
        </LinkButton>
      </main>
    );
  const modules = (
    scope === "buyer"
      ? buyerModules
      : scope === "crm"
        ? crmModules
        : managementModules
  ).filter((m) => canModule(session.role, scope, m));
  const title =
    scope === "buyer"
      ? "BUYER PORTAL"
      : scope === "crm"
        ? "SALES WORKSPACE"
        : "MANAGEMENT CONSOLE";
  const searchResults = modules.filter((m) =>
    moduleNames[m].toLocaleLowerCase("vi").includes(q.toLocaleLowerCase("vi")),
  );
  return (
    <div
      className={`workspace ${collapsed ? "collapsed" : ""} ${mobile ? "mobile-open" : ""}`}
    >
      <aside className="workspace-sidebar">
        <Link href="/" aria-label="ARVESSA — Trang chủ">
          <img
            src={
              data.preferences.theme === "dark"
                ? collapsed
                  ? "/brand/arvessa-mark-inverse.svg"
                  : brand.inverse
                : collapsed
                  ? brand.mark
                  : brand.primary
            }
            className="logo"
            alt="ARVESSA"
            width="200"
            height="40"
          />
        </Link>
        <div className="actions">
          <span className="workspace-label">{title}</span>
          <button
            className="icon-button mobile-workspace-toggle"
            aria-label="Đóng menu"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav aria-label="Điều hướng workspace">
          {modules.map((m) => {
            const Icon = icons[m] || Settings;
            return (
              <Link
                key={m}
                className={moduleKey === m ? "active" : ""}
                href={`/${scope}/${m}`}
                onClick={() => setMobile(false)}
                title={moduleNames[m]}
              >
                <Icon />
                <span className="nav-label">{moduleNames[m]}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          {canEnter(session.role, "management") && (
            <Link
              href={
                scope === "management"
                  ? "/crm/dashboard"
                  : "/management/dashboard"
              }
            >
              <ShieldCheck size={16} />
              <span>
                {scope === "management"
                  ? "Sales Workspace"
                  : "Management Console"}
              </span>
            </Link>
          )}
          <Link href="/">
            <ArrowUpRight size={16} />
            <span>Website ARVESSA</span>
          </Link>
          <p className="fine-print nav-label" style={{ paddingInline: 14 }}>
            Dữ liệu mô phỏng.
            <br />
            Chưa có bảo mật server-side.
          </p>
        </div>
      </aside>
      <div className="workspace-content">
        <header className="workspace-topbar">
          <div className="actions">
            <button
              className="icon-button"
              aria-label="Thu gọn hoặc mở menu"
              onClick={() => {
                if (window.innerWidth < 801) setMobile(!mobile);
                else setCollapsed(!collapsed);
              }}
            >
              <PanelLeftClose size={18} />
            </button>
            <button className="search-trigger" onClick={() => setSearch(true)}>
              <Search size={17} />
              <span>Tìm trong không gian…</span>
              <kbd>⌘ K</kbd>
            </button>
          </div>
          <div className="actions">
            <span className="demo-label">DEMO</span>
            <select
              aria-label="Chuyển vai trò demo"
              value={session.role}
              onChange={(e) => {
                const role = e.target.value as Role;
                login(role);
                router.push(
                  `/${role === "buyer" ? "buyer" : scope === "management" && canEnter(role, "management") ? "management" : "crm"}/dashboard`,
                );
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {roleNames[r]}
                </option>
              ))}
            </select>
            <button
              className="icon-button"
              aria-label="Thông báo"
              onClick={() => setNotifications(true)}
            >
              <Bell size={18} />
            </button>
            <div className="user-avatar" title={session.name}>
              {session.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <button
              className="icon-button"
              aria-label="Đăng xuất demo"
              onClick={() => {
                logout();
                router.push("/sign-in");
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main id="main" className="workspace-main">
          <div className="workspace-breadcrumb">
            <span>ARVESSA</span>
            <ChevronRight size={12} />
            <span>
              {scope === "buyer"
                ? "Không gian của tôi"
                : scope === "crm"
                  ? "Sales Workspace"
                  : "Management"}
            </span>
            <ChevronRight size={12} />
            <span>{moduleNames[moduleKey]}</span>
          </div>
          <div className="workspace-heading">
            <div>
              <h1>{moduleNames[moduleKey]}</h1>
              <p>
                {scope === "buyer"
                  ? "Hành trình của bạn, trong cùng một không gian."
                  : "Thông tin rõ ràng. Công việc tiếp nối."}
              </p>
            </div>
            <span className="demo-label">
              CHẾ ĐỘ TRÌNH DIỄN · FRONTEND ONLY
            </span>
          </div>
          {children}
        </main>
      </div>
      {search && (
        <Modal title="Tìm trong không gian" onClose={() => setSearch(false)}>
          <label className="search-field" style={{ marginBottom: 20 }}>
            <Search size={20} />
            <input
              autoFocus
              aria-label="Tìm moduleKey hoặc mã căn"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Module hoặc mã căn…"
            />
          </label>
          <div className="command-results">
            {searchResults.map((m) => (
              <Link
                key={m}
                href={`/${scope}/${m}`}
                onClick={() => setSearch(false)}
              >
                {moduleNames[m]}
              </Link>
            ))}
            {q &&
              data.properties
                .filter((p) => p.id.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 5)
                .map((p) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    onClick={() => setSearch(false)}
                  >
                    {p.name} · {p.area} m²
                  </Link>
                ))}
          </div>
        </Modal>
      )}
      {notifications && (
        <Modal title="Thông báo demo" onClose={() => setNotifications(false)}>
          {data.preferences.notifications ? (
            <Timeline
              events={data.audit
                .filter((a) =>
                  session.role === "buyer" ? a.actor === "buyer" : true,
                )
                .slice(0, 8)
                .map((a) => ({
                  at: a.at,
                  actor: a.actor,
                  text: `${a.action} · ${a.recordId || "Thiết lập demo"}`,
                }))}
            />
          ) : (
            <p>Bạn đã tắt thông báo trong tùy chọn.</p>
          )}
          {!data.audit.length && <p>Chưa có hoạt động mới trong phiên demo.</p>}
        </Modal>
      )}
    </div>
  );
}
