"use client";
import { ArtImage } from "@/components/art-image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useDemo } from "@/services/store";
import { Scenario, Reservation } from "@/domain/types";
import { money, dateTime } from "@/domain/format";
import { remainingSeconds, expirableStatuses } from "@/domain/reservation";
import {
  Button,
  Field,
  Badge,
  Timeline,
  Action,
  Modal,
  Empty,
  LinkButton,
} from "@/components/ui";
export function Countdown({ expiresAt }: { expiresAt: number }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seconds = remainingSeconds(expiresAt, now || expiresAt);
  return (
    <div className="countdown" aria-label="Thời gian giữ căn còn lại">
      {String(Math.floor(seconds / 60)).padStart(2, "0")}:
      {String(seconds % 60).padStart(2, "0")}
    </div>
  );
}
export default function ReservationWizard({
  propertyId,
}: {
  propertyId: string;
}) {
  const { data, session, run } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState(0),
    [accepted, setAccepted] = useState(false),
    [confirmed, setConfirmed] = useState(false),
    [scenario, setScenario] = useState<Scenario>("normal"),
    [buyerId, setBuyerId] = useState("buyer-demo"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState("");
  const key = useRef("");
  const p = data.properties.find((p) => p.id === propertyId),
    project = data.projects.find((x) => x.id === p?.projectId);
  if (!p || !project)
    return (
      <main id="main" className="error-page">
        <h1>Không tìm thấy căn.</h1>
        <LinkButton href="/discover">Chọn căn khác</LinkButton>
      </main>
    );
  const r = data.reservations.find((x) => x.id === result);
  const request = async () => {
    if (busy) return;
    if (!session) {
      router.push(`/sign-in?next=/reserve/${propertyId}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      key.current ||= crypto.randomUUID();
      const res = await run({
        type: "hold",
        propertyId,
        buyerId: session.role === "buyer" ? session.id : buyerId,
        price: p.price,
        accepted: accepted && confirmed,
        key: key.current,
        scenario,
      });
      setResult(res.id);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể giữ căn.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main id="main" className="public-page container">
      <div className="page-heading">
        <p className="eyebrow">YOUR RESERVATION / DEMO ONLY</p>
        <h1>
          Một lựa chọn.
          <br />
          Từng bước rõ ràng.
        </h1>
        <p>
          Yêu cầu giữ căn không phải đặt cọc. Không có giao dịch tiền thật trong
          trải nghiệm này.
        </p>
      </div>
      <div className="detail-grid">
        <section className="panel">
          <div className="wizard-steps">
            {[
              "Điều kiện",
              "Xem lại căn",
              "Điều khoản",
              "Thông tin",
              "Kết quả",
            ].map((label, i) => (
              <span key={label} className={i <= step ? "active" : ""}>
                {i + 1}. {label}
              </span>
            ))}
          </div>
          {step === 0 && (
            <>
              <h2>Kiểm tra điều kiện demo</h2>
              <p>
                {project.policy.eligible
                  ? "Dự án được cấu hình cho phép giữ căn và đặt cọc mô phỏng."
                  : "Dự án chưa mở giữ căn/đặt cọc demo."}
              </p>
              <div className="info-box">
                <ShieldCheck size={22} />
                <p>
                  Điều kiện pháp lý thực tế chưa được xác minh. Hệ thống chỉ
                  trình diễn giao diện và quy trình.
                </p>
              </div>
              <p>
                Thời hạn: {project.policy.holdMinutes} phút · Số tiền mô phỏng:{" "}
                {money(project.policy.amount)}
              </p>
              {!project.policy.eligible && (
                <LinkButton href={`/appointments?property=${p.id}`}>
                  Đặt lịch tư vấn
                </LinkButton>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <h2>Xem lại lựa chọn</h2>
              <ArtImage
                src={p.image}
                projectId={p.projectId}
                alt={`Minh họa ${project.name}`}
                width="800"
                height="500"
              />
              <div className="spec-grid">
                <div>
                  <small>Mã căn</small>
                  {p.id}
                </div>
                <div>
                  <small>Diện tích</small>
                  {p.area} m²
                </div>
                <div>
                  <small>Giá demo</small>
                  {money(p.price)}
                </div>
              </div>
              <Badge>{p.availability}</Badge>
              <p className="fine-print">
                Trạng thái được kiểm tra lại khi gửi yêu cầu; bước này không
                khóa căn.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Điều khoản theo dự án</h2>
              <p>{project.policy.terms}</p>
              <p>
                Đơn vị nhận trong demo: {data.cms.company}. Không có tài khoản
                ngân hàng hoặc QR nhận tiền thật.
              </p>
              <p>
                Yêu cầu gia hạn, hủy sau đặt cọc và hoàn tiền cần đi qua đúng
                bước phê duyệt. Khi chờ đối soát, căn không được tự động mở lại.
              </p>
              <Link className="underlined-link" href="/deposit-policy">
                Đọc chính sách mô phỏng
              </Link>
              <hr />
              <label>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                Tôi đã đọc điều khoản demo và hiểu đây không phải giao dịch
                thật.
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Xác nhận thông tin</h2>
              {!session ? (
                <div className="info-box">
                  <p>Đăng nhập demo để gắn yêu cầu vào hồ sơ khách hàng.</p>
                  <LinkButton href={`/sign-in?next=/reserve/${p.id}`}>
                    Đăng nhập demo
                  </LinkButton>
                </div>
              ) : (
                <>
                  <p>Người thực hiện: {session.name}</p>
                  {session.role !== "buyer" && (
                    <Field label="Khách hàng">
                      <select
                        value={buyerId}
                        onChange={(e) => setBuyerId(e.target.value)}
                      >
                        {data.customers.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <label>
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    Tôi xác nhận hồ sơ demo và yêu cầu giữ căn {p.id}.
                  </label>
                  <details style={{ marginTop: 24 }}>
                    <summary className="fine-print">Kịch bản mô phỏng</summary>
                    <Field label="Tình huống khi gửi">
                      <select
                        value={scenario}
                        onChange={(e) => {
                          setScenario(e.target.value as Scenario);
                          key.current = "";
                        }}
                      >
                        <option value="normal">Thông thường</option>
                        <option value="conflict">Xung đột giữ căn</option>
                        <option value="expired">Hết hạn sau 5 giây</option>
                        <option value="price-change">Giá thay đổi</option>
                        <option value="offline">Mất kết nối</option>
                      </select>
                    </Field>
                  </details>
                </>
              )}
            </>
          )}
          {step === 4 && r && <ReservationCard reservation={r} />}{" "}
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          {step < 4 && (
            <div className="form-actions">
              <Button
                className="secondary"
                disabled={step === 0 || busy}
                onClick={() => setStep(step - 1)}
              >
                Quay lại
              </Button>
              {step < 3 ? (
                <Button
                  disabled={
                    !project.policy.eligible || (step === 2 && !accepted)
                  }
                  onClick={() => setStep(step + 1)}
                >
                  Tiếp tục
                </Button>
              ) : (
                <Button
                  disabled={busy || !confirmed || !session}
                  onClick={() => void request()}
                >
                  {busy ? "Đang kiểm tra…" : "Gửi yêu cầu giữ căn demo"}
                </Button>
              )}
            </div>
          )}
        </section>
        <aside className="detail-summary">
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>{p.name}</h2>
          <p>
            {project.name} · Tháp {p.tower}
          </p>
          <strong className="price">{money(p.price)}</strong>
          <Badge>{p.availability}</Badge>
          <hr />
          <p>
            Giá và tình trạng dùng chung với giỏ hàng và CRM. Quyền giữ căn thực
            tế cần được đảm bảo bởi backend khi tích hợp sau này.
          </p>
          <Link className="underlined-link" href={`/properties/${p.id}`}>
            Xem lại căn
          </Link>
        </aside>
      </div>
    </main>
  );
}
export function ReservationCard({
  reservation: r,
}: {
  reservation: Reservation;
}) {
  const { data, session, run } = useDemo();
  const [pay, setPay] = useState(false),
    [method, setMethod] = useState("Chuyển khoản mô phỏng"),
    [accepted, setAccepted] = useState(false),
    [outcome, setOutcome] = useState<"success" | "failed" | "pending">(
      "success",
    );
  const key = useRef("");
  const allowed = ["TEMPORARILY_HELD", "PAYMENT_FAILED"].includes(r.status);
  const canCancel =
    ["TEMPORARILY_HELD", "EXTENSION_REQUESTED", "PAYMENT_FAILED"].includes(
      r.status,
    ) &&
    ["buyer", "sales", "leader", "manager", "admin", "platform"].includes(
      session?.role || "",
    );
  return (
    <article className="reservation-card">
      <header>
        <div>
          <h3>Căn {r.propertyId}</h3>
          <small>{r.id}</small>
        </div>
        <Badge>{r.status}</Badge>
      </header>
      <dl className="stat-list">
        <div>
          <dt>Giá tại thời điểm yêu cầu</dt>
          <dd>{money(r.price)}</dd>
        </div>
        <div>
          <dt>Đặt cọc demo</dt>
          <dd>{money(r.amount)}</dd>
        </div>
      </dl>
      {expirableStatuses.includes(r.status) && (
        <>
          <small>Thời gian giữ căn còn lại</small>
          <Countdown expiresAt={r.expiresAt} />
        </>
      )}
      {r.status === "PAYMENT_VERIFICATION" && (
        <div className="info-box">
          Chưa xác nhận thanh toán. Hồ sơ chờ tài chính đối soát; căn chưa được
          mở lại.
        </div>
      )}
      {r.status === "HOLD_CONFLICT" && (
        <p>
          Không tạo giữ căn hợp lệ. Hãy chọn căn khác hoặc kiểm tra lại giỏ
          hàng.
        </p>
      )}
      <div className="actions">
        {session?.role === "buyer" && allowed && (
          <Button
            onClick={() => {
              key.current = crypto.randomUUID();
              setPay(true);
            }}
          >
            Tiếp tục thanh toán demo
          </Button>
        )}
        {allowed && canCancel && (
          <Action
            label="Yêu cầu gia hạn"
            action={() =>
              run({ type: "reservation", id: r.id, action: "extend" })
            }
          />
        )}{" "}
        {canCancel && (
          <Action
            label="Hủy giữ căn"
            confirm
            action={() =>
              run({ type: "reservation", id: r.id, action: "cancel" })
            }
          />
        )}{" "}
        {["HOLD_EXPIRED", "HOLD_CANCELLED", "HOLD_CONFLICT"].includes(
          r.status,
        ) && (
          <LinkButton href="/discover" secondary>
            Chọn lại căn
          </LinkButton>
        )}
        {r.status === "DEPOSIT_CONFIRMED" &&
          ["legal", "manager", "admin", "platform"].includes(
            session?.role || "",
          ) && (
            <Action
              label="Tạo dự thảo hợp đồng"
              action={() =>
                run({ type: "contract", id: r.id, action: "draft" })
              }
            />
          )}
      </div>
      <details style={{ marginTop: 20 }}>
        <summary className="fine-print">Lịch sử & trạng thái</summary>
        <Timeline events={r.history} />
      </details>
      {allowed && (
        <details className="fine-print">
          <summary>Công cụ kiểm tra demo</summary>
          <Action
            label="Mô phỏng hết hạn"
            action={() =>
              run({ type: "reservation", id: r.id, action: "expire" })
            }
          />
        </details>
      )}
      {pay && (
        <Modal title="Đặt cọc mô phỏng" onClose={() => setPay(false)}>
          <div className="info-box">
            DEMO ONLY · Không nhập thông tin thẻ, không chuyển khoản thật.
          </div>
          <dl className="stat-list">
            <div>
              <dt>Căn</dt>
              <dd>{r.propertyId}</dd>
            </div>
            <div>
              <dt>Số tiền demo</dt>
              <dd>{money(r.amount)}</dd>
            </div>
          </dl>
          <p>
            {
              data.projects.find(
                (p) =>
                  p.id ===
                  data.properties.find((x) => x.id === r.propertyId)?.projectId,
              )?.policy.terms
            }
          </p>
          <div className="form-stack">
            <Field label="Phương thức mô phỏng">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option>Chuyển khoản mô phỏng</option>
                <option>Thẻ mô phỏng</option>
              </select>
            </Field>
            <Field label="Kết quả mô phỏng">
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as typeof outcome)}
              >
                <option value="success">Xác nhận thành công demo</option>
                <option value="failed">Xử lý thất bại</option>
                <option value="pending">
                  Chưa biết kết quả / chờ đối soát
                </option>
              </select>
            </Field>
            <label>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              Tôi hiểu và đồng ý điều khoản thanh toán mô phỏng.
            </label>
            <Action
              label="Gửi thanh toán demo"
              disabled={!accepted}
              className=""
              action={async () => {
                await run({
                  type: "pay",
                  id: r.id,
                  key: key.current,
                  method,
                  accepted,
                  result: outcome,
                });
                setPay(false);
              }}
            />
          </div>
        </Modal>
      )}
    </article>
  );
}
export function ReservationList() {
  const { data, session } = useDemo();
  const rows = data.reservations.filter(
    (r) => session?.role !== "buyer" || r.buyerId === session.id,
  );
  return (
    <>
      {rows.length ? (
        rows.map((r) => <ReservationCard key={r.id} reservation={r} />)
      ) : (
        <Empty title="Chưa có yêu cầu giữ căn">
          <LinkButton href="/discover">Khám phá giỏ hàng</LinkButton>
        </Empty>
      )}
    </>
  );
}
export function PaymentList() {
  const { data, session, run } = useDemo();
  const [receipt, setReceipt] = useState(""),
    [reason, setReason] = useState("Tôi muốn thay đổi lựa chọn."),
    [adjustment, setAdjustment] = useState(""),
    [adjustAmount, setAdjustAmount] = useState(0),
    [adjustReason, setAdjustReason] = useState("");
  const rows = data.payments.filter(
    (p) =>
      session?.role !== "buyer" ||
      data.reservations.find((r) => r.id === p.reservationId)?.buyerId ===
        session.id,
  );
  const selected = rows.find((p) => p.id === receipt);
  return (
    <>
      {rows.length ? (
        rows.map((p) => (
          <article className="reservation-card" key={p.id}>
            <header>
              <h3>{money(p.amount)}</h3>
              <Badge>{p.status}</Badge>
            </header>
            <p className="fine-print">
              {p.id} · Căn{" "}
              {
                data.reservations.find((r) => r.id === p.reservationId)
                  ?.propertyId
              }{" "}
              · {dateTime(p.createdAt)}
            </p>
            <div className="actions">
              <Button className="secondary" onClick={() => setReceipt(p.id)}>
                Xem biên nhận demo
              </Button>
              {p.status === "CONFIRMED" &&
                ["finance", "manager", "admin", "platform"].includes(
                  session?.role || "",
                ) &&
                data.reservations.find((r) => r.id === p.reservationId)
                  ?.status === "DEPOSIT_CONFIRMED" && (
                  <Button
                    className="secondary"
                    onClick={() => {
                      setAdjustment(p.id);
                      setAdjustAmount(p.amount);
                      setAdjustReason("");
                    }}
                  >
                    Đề nghị điều chỉnh cọc
                  </Button>
                )}
              {p.status === "VERIFICATION" &&
                ["finance", "manager", "admin", "platform"].includes(
                  session?.role || "",
                ) && (
                  <>
                    <Action
                      label="Đối soát: xác nhận"
                      confirm
                      action={() =>
                        run({ type: "reconcile", id: p.id, confirmed: true })
                      }
                    />
                    <Action
                      label="Đối soát: thất bại"
                      confirm
                      action={() =>
                        run({ type: "reconcile", id: p.id, confirmed: false })
                      }
                    />
                  </>
                )}
              {p.status === "CONFIRMED" && (
                <Action
                  label="Yêu cầu hoàn demo"
                  confirm
                  action={() => run({ type: "refund", id: p.id, reason })}
                />
              )}
            </div>
            <details style={{ marginTop: 20 }}>
              <summary className="fine-print">Lịch sử giao dịch</summary>
              <Timeline events={p.history} />
            </details>
          </article>
        ))
      ) : (
        <Empty title="Chưa có giao dịch mô phỏng">
          Sau khi giữ căn, tiếp tục bước đặt cọc để thấy tiến trình ở đây.
        </Empty>
      )}
      {adjustment && (
        <Modal
          title="Đề nghị điều chỉnh cọc demo"
          onClose={() => setAdjustment("")}
        >
          <p>
            Chỉ cập nhật số liệu mô phỏng sau khi phê duyệt. Không tạo hoặc hoàn
            tiền thật.
          </p>
          <Field label="Số tiền cọc đề nghị (VND)">
            <input
              type="number"
              min="1"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Number(e.target.value))}
            />
          </Field>
          <Field label="Lý do điều chỉnh">
            <textarea
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />
          </Field>
          <Action
            label="Gửi đề nghị điều chỉnh"
            action={async () => {
              await run({
                type: "adjustment",
                id: adjustment,
                amount: adjustAmount,
                reason: adjustReason,
              });
              setAdjustment("");
            }}
          />
        </Modal>
      )}
      {selected && (
        <Modal title="Biên nhận mô phỏng" onClose={() => setReceipt("")}>
          <div className="document-preview">
            <ArtImage
              src="/brand/arvessa-primary.svg"
              alt="ARVESSA"
              width="200"
              height="40"
            />
            <h2>Biên nhận DEMO</h2>
            <p>{selected.id}</p>
            <p>Số tiền: {money(selected.amount)}</p>
            <p>Phương thức: {selected.method}</p>
            <Badge>{selected.status}</Badge>
            <p>
              Đây không phải chứng từ kế toán hoặc bằng chứng chuyển tiền thật.
              “Đã gửi” và “đã xác nhận” là hai trạng thái khác nhau.
            </p>
          </div>
          <Field label="Lý do hoàn (nếu cần)">
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </Modal>
      )}
    </>
  );
}
