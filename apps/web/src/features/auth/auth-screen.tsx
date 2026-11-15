"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { roles, Role, roleNames } from "@/domain/types";
import { useDemo } from "@/services/store";
import { brand } from "@/lib/brand";
import { Button, Field } from "@/components/ui";
const titles: Record<string, string> = {
  "sign-in": "Chào mừng trở lại.",
  "sign-up": "Bắt đầu hành trình.",
  "forgot-password": "Tìm lại quyền truy cập.",
  "reset-password": "Thiết lập mật khẩu demo.",
  verify: "Xác minh phiên demo.",
};
export default function AuthScreen({ mode }: { mode: string }) {
  const router = useRouter(),
    params = useSearchParams();
  const login = useDemo((s) => s.login);
  const run = useDemo((s) => s.run);
  const [role, setRole] = useState<Role>("buyer"),
    [visible, setVisible] = useState(false),
    [password, setPassword] = useState(""),
    [email, setEmail] = useState("minhanh@example.test"),
    [name, setName] = useState("Minh Anh"),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^\w]/.test(password),
  ].filter(Boolean).length;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode !== "verify") {
        z.email("Email không hợp lệ.").parse(email);
        if (
          ["sign-up", "reset-password"].includes(mode) &&
          !(
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password)
          )
        )
          throw new Error("Mật khẩu demo cần ít nhất 8 ký tự, chữ hoa và số.");
        if (mode === "sign-in" && password && password.length < 8)
          throw new Error("Nếu nhập mật khẩu demo, hãy dùng ít nhất 8 ký tự.");
      } else if (code !== "246810")
        throw new Error("Mã demo chưa đúng. Dùng 246810.");
      setBusy(true);
      await new Promise((r) => setTimeout(r, 250));
      if (mode === "forgot-password") {
        router.push("/reset-password");
        return;
      }
      if (["sign-up", "reset-password"].includes(mode)) {
        if (mode === "sign-up")
          sessionStorage.setItem(
            "arvessa.signup.v1",
            JSON.stringify({ name: name.trim(), email }),
          );
        else sessionStorage.removeItem("arvessa.signup.v1");
        router.push("/verify");
        return;
      }
      login(role);
      if (mode === "verify") {
        const draft = sessionStorage.getItem("arvessa.signup.v1");
        if (draft) {
          const profile = z
            .object({ name: z.string().min(1), email: z.email() })
            .parse(JSON.parse(draft));
          await run({
            type: "save",
            entity: "customers",
            values: { id: "buyer-demo", ...profile },
          });
          sessionStorage.removeItem("arvessa.signup.v1");
        }
      }
      const next = params.get("next");
      router.push(
        next?.startsWith("/") && !next.startsWith("//")
          ? next
          : role === "buyer"
            ? "/buyer/dashboard"
            : "/crm/dashboard",
      );
    } catch (e) {
      setError(
        e instanceof z.ZodError
          ? e.issues[0].message
          : e instanceof Error
            ? e.message
            : "Không thể tiếp tục.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main id="main" className="auth-layout">
      <aside className="auth-art">
        <img
          src="/images/residence-exterior.svg"
          alt="Minh họa không gian kiến trúc The Stillwater"
          width="1600"
          height="1000"
        />
        <div>
          <p className="eyebrow">YOUR NEXT PERSPECTIVE</p>
          <h1>
            Một không gian riêng.
            <br />
            Một hành trình rõ ràng.
          </h1>
          <p className="brand-line">{brand.line}</p>
        </div>
      </aside>
      <section className="auth-panel">
        <Link href="/">
          <img
            src={brand.primary}
            className="logo"
            alt="ARVESSA"
            width="240"
            height="48"
          />
        </Link>
        <h2>{titles[mode]}</h2>
        <p className="demo-callout">
          Xác thực mô phỏng. Không nhập mật khẩu hoặc thông tin nhạy cảm thật.
          Dùng địa chỉ example.test; không gửi email/SMS.
        </p>
        <form className="form-stack" onSubmit={submit}>
          {mode === "sign-up" && (
            <Field label="Tên hiển thị demo">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </Field>
          )}
          {mode !== "verify" && (
            <Field label="Email demo">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </Field>
          )}
          {["sign-in", "sign-up", "reset-password"].includes(mode) && (
            <Field
              label={
                mode === "sign-in"
                  ? "Mật khẩu demo (có thể bỏ trống)"
                  : "Mật khẩu mô phỏng"
              }
            >
              <div className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  required={mode !== "sign-in"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {mode !== "sign-in" && (
                <>
                  <div className="password-strength">
                    <span style={{ width: `${strength * 25}%` }} />
                  </div>
                  <small>
                    Độ mạnh: {strength}/4 · Mật khẩu chỉ ở bộ nhớ biểu mẫu,
                    không được lưu.
                  </small>
                </>
              )}
            </Field>
          )}
          {mode === "verify" && (
            <Field
              label="Mã xác minh demo"
              hint="Mã cố định cho trình diễn: 246810"
            >
              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
          )}
          {mode === "sign-in" && (
            <Field label="Vai trò trình diễn">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleNames[r]}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy
              ? "Đang xử lý…"
              : mode === "sign-in"
                ? "Vào không gian demo"
                : mode === "forgot-password"
                  ? "Mở quy trình đặt lại demo"
                  : mode === "verify"
                    ? "Xác minh và tiếp tục"
                    : "Tiếp tục"}
          </Button>
        </form>
        <div className="auth-links">
          <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"}>
            {mode === "sign-in" ? "Tạo tài khoản demo" : "Về đăng nhập"}
          </Link>
          <Link href="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <p className="fine-print" style={{ marginTop: 30 }}>
          Phiên demo hết hạn sau 60 phút. Phân quyền trình bày ở frontend không
          thay thế xác thực và bảo vệ dữ liệu phía server.
        </p>
      </section>
    </main>
  );
}
