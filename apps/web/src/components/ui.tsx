"use client";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import {
  X,
  ArrowUpRight,
  LoaderCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { statusNames } from "@/domain/reservation";
import { useDemo } from "@/services/store";
import { sound } from "@/lib/sound";
export function Button({
  children,
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`button ${className}`}
      {...props}
      onClick={(e) => {
        sound("click");
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
export function LinkButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const text = String(children);
  return (
    <span
      className={`badge ${["AVAILABLE", "CONFIRMED", "APPROVED", "DEPOSIT_CONFIRMED", "Đã xác nhận", "Đã ký demo"].includes(text) ? "positive" : ["FAILED", "HOLD_CONFLICT", "HOLD_EXPIRED", "REJECTED"].includes(text) ? "negative" : ""}`}
    >
      {statusNames[text] || children}
    </span>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title = "Chưa có dữ liệu",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-mark">A</span>
      <h3>{title}</h3>
      <p>{children || "Thay đổi bộ lọc hoặc tạo hồ sơ đầu tiên để bắt đầu."}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" />
      Đang tải không gian…
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef(onClose);
  closing.current = onClose;
  useEffect(() => {
    const d = ref.current;
    const active = document.activeElement as HTMLElement;
    d?.showModal();
    return () => {
      d?.close();
      active?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? "wide" : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        closing.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closing.current();
      }}
    >
      <div className="dialog-inner">
        <header>
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Đóng" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
export function Action({
  label,
  action,
  confirm = false,
  className = "secondary",
  disabled = false,
}: {
  label: string;
  action: () => Promise<unknown>;
  confirm?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false);
  const execute = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      sound("confirmation");
      setOpen(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể thực hiện. Vui lòng thử lại.",
      );
      sound("warning");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Button
        className={className}
        disabled={busy || disabled}
        onClick={() => (confirm ? setOpen(true) : void execute())}
      >
        {busy ? <LoaderCircle size={16} className="spin" /> : null}
        {label}
      </Button>
      {!open && error && (
        <span role="alert" className="error-text">
          {error}
        </span>
      )}
      {open && (
        <Modal title="Xác nhận thao tác" onClose={() => setOpen(false)}>
          <p>Bạn muốn thực hiện “{label}” trên dữ liệu demo?</p>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <div className="actions">
            <Button className="secondary" onClick={() => setOpen(false)}>
              Quay lại
            </Button>
            <Button disabled={busy} onClick={() => void execute()}>
              Xác nhận
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Notice() {
  const notice = useDemo((s) => s.notice),
    notify = useDemo((s) => s.notify);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => notify(""), 5000);
    return () => clearTimeout(t);
  }, [notice, notify]);
  return notice ? (
    <div role="status" className="toast">
      <span>{notice}</span>
      <button aria-label="Đóng thông báo" onClick={() => notify("")}>
        <X size={16} />
      </button>
    </div>
  ) : null;
}
export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchText,
  onSelect,
}: {
  rows: T[];
  columns: Column<T>[];
  searchText: (row: T) => string;
  onSelect?: (row: T) => void;
}) {
  const [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [order, setOrder] = useState("asc");
  const filtered = rows
    .filter((r) =>
      searchText(r).toLocaleLowerCase("vi").includes(q.toLocaleLowerCase("vi")),
    )
    .sort((a, b) =>
      order === "asc"
        ? searchText(a).localeCompare(searchText(b))
        : searchText(b).localeCompare(searchText(a)),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 8)),
    current = Math.min(page, pages);
  return (
    <div className="table-card">
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Tìm trong bảng"
            placeholder="Tìm hồ sơ…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Sắp xếp bảng"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="asc">Tên A → Z</option>
          <option value="desc">Tên Z → A</option>
        </select>
        <span>{filtered.length} hồ sơ</span>
      </div>
      {filtered.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                  </th>
                ))}
                {onSelect && <th scope="col">Chi tiết</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 8, current * 8).map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render(r)}</td>
                  ))}
                  {onSelect && (
                    <td>
                      <button
                        className="text-button"
                        onClick={() => onSelect(r)}
                      >
                        Mở hồ sơ <ArrowUpRight size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty />
      )}
      <div className="pagination">
        <span>
          Trang {current} / {pages}
        </span>
        <button
          className="icon-button"
          aria-label="Trang trước"
          disabled={current <= 1}
          onClick={() => setPage(current - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Trang sau"
          disabled={current >= pages}
          onClick={() => setPage(current + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
export function Timeline({
  events,
}: {
  events: { at: number; text: string; actor: string }[];
}) {
  return (
    <ol className="timeline">
      {events.map((e, i) => (
        <li key={i}>
          <span className="timeline-dot" />
          <div>
            <strong>{statusNames[e.text] || e.text}</strong>
            <small>
              {new Date(e.at).toLocaleString("vi-VN")} · {e.actor}
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}
