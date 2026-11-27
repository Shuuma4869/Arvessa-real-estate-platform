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
const defaults = createSeed(1794700800000);
let memoryOnly = false;
let storageMessage = "";
const read = (): DemoState | null => {
  if (memoryOnly) return null;
  try {
    const value = localStorage.getItem(DATA_KEY);
    if (!value) return null;
    const data = JSON.parse(value);
    if (
      data?.version !== 1 ||
      !Array.isArray(data.properties) ||
      !Array.isArray(data.projects)
    ) {
      throw new Error("unknown-schema");
    }
    // Add fields introduced after the initial demo without reseeding a buyer's records.
    for (const [key, fallback] of Object.entries(defaults)) {
      if (Array.isArray(fallback)) {
        data[key] ??= [];
        if (!Array.isArray(data[key])) throw new Error("invalid-collection");
      }
    }
    for (const key of ["preferences", "cms", "processed"] as const) {
      const existing = data[key];
      if (
        existing != null &&
        (Array.isArray(existing) || typeof existing !== "object")
      ) {
        throw new Error("invalid-settings");
      }
      data[key] = { ...defaults[key], ...existing };
    }
    return data as DemoState;
  } catch {
    memoryOnly = true;
    storageMessage =
      "Chưa đọc được bản lưu trên thiết bị. Bản lưu được giữ nguyên. Thay đổi trong phiên này chỉ lưu trong bộ nhớ.";
    return null;
  }
};
const persist = (data: DemoState) => {
  if (memoryOnly) return storageMessage;
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return "";
  } catch {
    memoryOnly = true;
    storageMessage =
      "Trình duyệt không cho lưu dữ liệu. Phiên demo hiện chỉ được giữ trong bộ nhớ.";
    return storageMessage;
  }
};
let queue: Promise<unknown> = Promise.resolve();
export const useDemo = create<Store>((set, get) => ({
  data: structuredClone(defaults),
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
          notice: command.type === "view" ? get().notice : result.message,
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
