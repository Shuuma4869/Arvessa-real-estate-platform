"use client";
import { create } from "zustand";
import { DemoState, Role, Session } from "@/domain/types";
import { Command, CommandResult } from "./contracts/commands";
import { executeCommand, expireHolds } from "./mocks/engine";
import { createSeed } from "./mocks/seed";
const DATA_KEY = "arvessa.demo.v1",
  SESSION_KEY = "arvessa.session.v1";
interface Store {
  data: DemoState;
  session: Session | null;
  ready: boolean;
  notice: string;
  storageWarning: string;
  initialize: () => () => void;
  login: (role: Role) => void;
  logout: () => void;
  run: (command: Command) => Promise<CommandResult>;
  notify: (message: string) => void;
  expireSession: () => void;
}
const read = (): DemoState | null => {
  try {
    const value = localStorage.getItem(DATA_KEY);
    if (!value) return null;
    const d = JSON.parse(value) as DemoState;
    d.waitlist ??= [];
    return d.version === 1 &&
      [
        "properties",
        "projects",
        "reservations",
        "payments",
        "audit",
        "approvals",
        "customers",
      ].every((k) => Array.isArray(d[k as keyof DemoState])) &&
      d.preferences &&
      d.cms
      ? d
      : null;
  } catch {
    return null;
  }
};
const persist = (data: DemoState) => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return "";
  } catch {
    return "Trình duyệt không cho lưu dữ liệu. Phiên demo hiện chỉ được giữ trong bộ nhớ.";
  }
};
let queue: Promise<unknown> = Promise.resolve();
export const useDemo = create<Store>((set, get) => ({
  data: createSeed(1794700800000),
  session: null,
  ready: false,
  notice: "",
  storageWarning: "",
  initialize: () => {
    const data = read() || createSeed();
    expireHolds(data, Date.now());
    let session: Session | null = null;
    try {
      session = JSON.parse(
        sessionStorage.getItem(SESSION_KEY) || "null",
      ) as Session | null;
      if (session && session.expiresAt <= Date.now()) session = null;
    } catch {}
    set({ data, session, ready: true, storageWarning: persist(data) });
    const onStorage = (e: StorageEvent) => {
      if (e.key === DATA_KEY) {
        const d = read();
        if (d) set({ data: d });
      }
    };
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(() => {
      const current = get();
      if (current.session && current.session.expiresAt <= Date.now()) {
        get().logout();
        set({ notice: "Phiên demo đã hết hạn. Vui lòng đăng nhập lại." });
      }
      if (
        current.data.reservations.some(
          (r) =>
            [
              "TEMPORARILY_HELD",
              "EXTENSION_REQUESTED",
              "PAYMENT_PENDING",
              "PAYMENT_FAILED",
            ].includes(r.status) && r.expiresAt <= Date.now(),
        )
      ) {
        const expire = () => {
          const next = read() || structuredClone(get().data);
          expireHolds(next, Date.now());
          set({ data: next, storageWarning: persist(next) });
        };
        if (navigator.locks)
          void navigator.locks.request("arvessa-demo", expire);
        else expire();
      }
    }, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", onStorage);
    };
  },
  login: (role) => {
    const session = {
      role,
      id: role === "buyer" ? "buyer-demo" : `staff-${role}`,
      name:
        role === "buyer"
          ? get().data.customers.find((c) => c.id === "buyer-demo")?.name ||
            "Minh Anh"
          : get().data.employees.find((e) => e.role === role)?.name ||
            "ARVESSA Demo",
      expiresAt: Date.now() + 3600000,
    };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {}
    set({ session });
  },
  logout: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    set({ session: null });
  },
  expireSession: () => {
    get().logout();
    set({ notice: "Phiên demo đã hết hạn. Dữ liệu công việc vẫn được giữ." });
  },
  notify: (notice) => set({ notice }),
  run: async (command) => {
    const execute = async () => {
      await new Promise((r) => setTimeout(r, 160));
      const work = () => {
        const session = get().session;
        if (session && session.expiresAt <= Date.now()) {
          get().logout();
          throw new Error("Phiên đã hết hạn. Đăng nhập lại để tiếp tục.");
        }
        const publicCommands = [
          "favorite",
          "compare",
          "view",
          "search",
          "preferences",
          "inquiry",
        ];
        if (!session && !publicCommands.includes(command.type))
          throw new Error("Vui lòng đăng nhập demo để tiếp tục.");
        const { state, result } = executeCommand(
          read() || get().data,
          command,
          session || { role: "buyer", id: "buyer-demo" },
        );
        set({
          data: state,
          notice: result.message,
          storageWarning: persist(state),
        });
        return result;
      };
      return navigator.locks
        ? navigator.locks.request("arvessa-demo", work)
        : work();
    };
    const result = queue.then(execute, execute);
    queue = result.catch(() => undefined);
    return result;
  },
}));
