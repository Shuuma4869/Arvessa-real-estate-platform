"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { workspaceActivity } from "@/domain/workspace-activity";
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
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobile) return;
    const trigger = menuButton.current;
    const media = window.matchMedia("(max-width: 800px)");
    const fold = () => {
      if (!media.matches) setMobile(false);
    };
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
    };
    closeButton.current?.focus();
    media.addEventListener("change", fold);
    window.addEventListener("keydown", dismiss);
    return () => {
      media.removeEventListener("change", fold);
      window.removeEventListener("keydown", dismiss);
      trigger?.focus();
    };
  }, [mobile]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setMobile(false);
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
  const activity = notifications
    ? workspaceActivity(data, session).slice(0, 8)
    : [];
  const normalize = (value: string) =>
    value
      .trim()
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replaceAll("đ", "d");
  const query = normalize(q);
  const searchResults = modules.filter((m) =>
    normalize(moduleNames[m]).includes(query),
  );
  const properties = query
    ? data.properties.filter((p) => normalize(p.id).includes(query)).slice(0, 5)
    : [];
  return (
    <div
      className={`workspace ${collapsed ? "collapsed" : ""} ${mobile ? "mobile-open" : ""}`}
    >
      {mobile && (
        <button
          className="workspace-scrim"
          aria-label="Đóng điều hướng"
          tabIndex={-1}
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        className="workspace-sidebar"
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile || undefined}
        aria-label={mobile ? "Điều hướng workspace" : undefined}
        onKeyDown={(event) => {
          if (!mobile || event.key !== "Tab") return;
          const items = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "a[href], button",
            ),
          ).filter((el) => el.getClientRects().length);
          const first = items[0],
            last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
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
            ref={closeButton}
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
                aria-current={moduleKey === m ? "page" : undefined}
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
      <div className="workspace-content" inert={mobile || undefined}>
        <header className="workspace-topbar">
          <div className="actions">
            <button
              className="icon-button"
              ref={menuButton}
              aria-controls="workspace-navigation"
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
              aria-label="Tìm chức năng hoặc mã căn"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tên chức năng hoặc mã căn…"
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
            {properties.map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                onClick={() => setSearch(false)}
              >
                {p.name} · {p.area} m²
              </Link>
            ))}
            {!properties.length && !searchResults.length && (
              <p role="status">Chưa tìm thấy kết quả cho “{q.trim()}”.</p>
            )}
          </div>
        </Modal>
      )}
      {notifications && (
        <Modal title="Thông báo demo" onClose={() => setNotifications(false)}>
          {data.preferences.notifications ? (
            activity.length ? (
              <Timeline events={activity} />
            ) : (
              <p>Chưa có hoạt động mới trong phiên demo.</p>
            )
          ) : (
            <p>Bạn đã tắt thông báo trong tùy chọn.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
