"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/services/store";
import { Button, Action, Empty } from "@/components/ui";
import { EntityForm } from "@/components/entity-form";
import { PropertyCard } from "../discovery/property-card";
import { stopSound } from "@/lib/sound";
export function MyProperties() {
  const { data } = useDemo();
  const [tab, setTab] = useState("favorites");
  const searches = data.savedSearches.filter(
    (s) => !s.query.startsWith("crm-"),
  );
  const ids =
    tab === "favorites"
      ? data.favorites
      : tab === "recent"
        ? data.recentlyViewed
        : data.comparisons;
  return (
    <>
      <div className="tabs">
        {[
          ["favorites", "Yêu thích"],
          ["comparisons", "So sánh đã lưu"],
          ["search", "Tìm kiếm đã lưu"],
          ["recent", "Đã xem gần đây"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "search" ? (
        searches.length ? (
          <div className="panel">
            {searches.map((s, i) => (
              <p key={i}>
                <Link className="underlined-link" href={`/discover?${s.query}`}>
                  {s.name}
                </Link>
              </p>
            ))}
          </div>
        ) : (
          <Empty title="Chưa lưu tìm kiếm" />
        )
      ) : (
        <>
          {tab === "recent" && !data.preferences.recent && (
            <div className="info-box">
              Lịch sử xem đang tắt. Bạn có thể bật trong Hồ sơ & bảo mật.
            </div>
          )}
          {tab === "comparisons" && (
            <Link
              href="/compare"
              className="button secondary"
              style={{ marginBottom: 25 }}
            >
              Mở bảng so sánh
            </Link>
          )}
          <div className="property-grid">
            {data.properties
              .filter((p) => ids.includes(p.id))
              .map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
          </div>
          {!ids.length && (
            <Empty title="Chưa có căn trong danh sách này">
              <Link className="underlined-link" href="/discover">
                Khám phá bộ sưu tập
              </Link>
            </Empty>
          )}
        </>
      )}
    </>
  );
}
export function Personal() {
  const { data, session, run, expireSession } = useDemo();
  const [edit, setEdit] = useState(false);
  const p = data.preferences,
    customer = data.customers.find((c) => c.id === session?.id);
  return (
    <div className="dashboard-grid">
      <section>
        <div className="panel">
          <div className="panel-header">
            <h2>Thông tin cá nhân</h2>
            {customer && (
              <Button className="secondary" onClick={() => setEdit(true)}>
                Chỉnh sửa hồ sơ
              </Button>
            )}
          </div>
          <h3>{customer?.name || session?.name}</h3>
          <p>
            {customer?.email || "Nhân sự mô phỏng ARVESSA"}
            <br />
            {customer?.phone || "Không lưu liên hệ thật"}
          </p>
          <p>{customer?.preferences}</p>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h2>Giao diện & trải nghiệm</h2>
          </div>
          <div className="setting-row">
            <div>
              <h3>Âm thanh</h3>
              <p>Mặc định tắt. Chỉ phát sau thao tác.</p>
            </div>
            <Action
              label={p.sound ? "Tắt âm thanh" : "Bật âm thanh"}
              action={() => {
                if (p.sound) stopSound();
                return run({
                  type: "preferences",
                  values: { sound: !p.sound },
                });
              }}
            />
          </div>
          <div className="setting-row">
            <div>
              <h3>Âm lượng</h3>
              <p>{Math.round(p.volume * 100)}%</p>
            </div>
            <input
              aria-label="Âm lượng"
              type="range"
              min="0"
              max=".3"
              step=".01"
              value={p.volume}
              onChange={(e) =>
                void run({
                  type: "preferences",
                  values: { volume: Number(e.target.value) },
                })
              }
            />
          </div>
          <div className="setting-row">
            <div>
              <h3>Giảm chuyển động</h3>
              <p>Luôn tôn trọng thiết lập hệ điều hành.</p>
            </div>
            <Action
              label={
                p.reducedMotion
                  ? "Dùng chuyển động mặc định"
                  : "Giảm chuyển động"
              }
              action={() =>
                run({
                  type: "preferences",
                  values: { reducedMotion: !p.reducedMotion },
                })
              }
            />
          </div>
          <div className="setting-row">
            <div>
              <h3>Mật độ giao diện</h3>
              <p>Điều chỉnh khoảng cách trong bảng.</p>
            </div>
            <select
              aria-label="Mật độ giao diện"
              value={p.density}
              onChange={(e) =>
                void run({
                  type: "preferences",
                  values: { density: e.target.value as typeof p.density },
                })
              }
            >
              <option value="comfortable">Thoáng</option>
              <option value="compact">Gọn</option>
            </select>
          </div>
          <div className="setting-row">
            <div>
              <h3>Màu workspace</h3>
              <p>Chỉ áp dụng không gian nghiệp vụ.</p>
            </div>
            <select
              aria-label="Màu giao diện"
              value={p.theme}
              onChange={(e) =>
                void run({
                  type: "preferences",
                  values: { theme: e.target.value as typeof p.theme },
                })
              }
            >
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
            </select>
          </div>
        </div>
      </section>
      <section>
        <div className="panel">
          <div className="panel-header">
            <h2>Quyền riêng tư & thông báo</h2>
          </div>
          <div className="setting-row">
            <div>
              <h3>Lưu căn đã xem</h3>
              <p>Tắt tùy chọn sẽ xóa danh sách đã xem.</p>
            </div>
            <Action
              label={p.recent ? "Tắt lịch sử" : "Bật lịch sử"}
              action={() =>
                run({ type: "preferences", values: { recent: !p.recent } })
              }
            />
          </div>
          <div className="setting-row">
            <div>
              <h3>Thông báo trong ứng dụng</h3>
              <p>Không gửi email/SMS.</p>
            </div>
            <Action
              label={p.notifications ? "Tắt thông báo" : "Bật thông báo"}
              action={() =>
                run({
                  type: "preferences",
                  values: { notifications: !p.notifications },
                })
              }
            />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <h2>Phiên & bảo mật demo</h2>
          </div>
          <p className="fine-print">
            Phiên hiện tại hết hạn sau 60 phút kể từ đăng nhập. Đây không phải
            phiên xác thực production.
          </p>
          <div className="form-stack">
            <Button className="secondary" onClick={expireSession}>
              Mô phỏng phiên hết hạn
            </Button>
            <Link href="/reset-password" className="button secondary">
              Đặt lại mật khẩu mô phỏng
            </Link>
            <Link href="/faq" className="underlined-link">
              Trung tâm trợ giúp
            </Link>
          </div>
        </div>
        <div className="panel">
          <h3>Tùy chỉnh dashboard</h3>
          {[
            ["pipeline", "Biểu đồ cơ hội"],
            ["visits", "Lịch hẹn"],
            ["inventory", "Giỏ hàng dự án"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="fine-print"
              style={{ marginBottom: 12 }}
            >
              <input
                type="checkbox"
                checked={p.widgets.includes(key)}
                onChange={() =>
                  void run({
                    type: "preferences",
                    values: {
                      widgets: p.widgets.includes(key)
                        ? p.widgets.filter((w) => w !== key)
                        : [...p.widgets, key],
                    },
                  })
                }
              />
              {label}
            </label>
          ))}
          <hr />
          <h3>Khôi phục môi trường trình diễn</h3>
          <p className="fine-print">
            Đặt lại toàn bộ hồ sơ demo trên trình duyệt này. Không tác động đến
            file mã nguồn.
          </p>
          <Action
            label="Đặt lại dữ liệu demo"
            confirm
            action={() => {
              stopSound();
              return run({ type: "reset" });
            }}
          />
        </div>
      </section>
      {edit && customer && (
        <EntityForm
          entity="customers"
          title="Cập nhật hồ sơ của tôi"
          record={customer}
          onClose={() => setEdit(false)}
        />
      )}
    </div>
  );
}
