import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, Modal, Action } from "@/components/ui";
import { ImmersivePropertyCarousel } from "@/features/marketing/carousel";
import { PropertyCard } from "@/features/discovery/property-card";
import { EntityForm } from "@/components/entity-form";
import { useDemo } from "@/services/store";
import { createSeed } from "@/services/mocks/seed";
beforeEach(() => {
  localStorage.clear();
  useDemo.setState({
    data: createSeed(),
    session: {
      id: "staff-sales",
      role: "sales",
      name: "Sales Demo",
      expiresAt: Date.now() + 600000,
    },
    ready: true,
    notice: "",
  });
});
describe("UI components", () => {
  it("table search and pagination change visible rows", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `Record ${i}`,
    }));
    render(
      <DataTable
        rows={rows}
        searchText={(r) => r.name}
        columns={[{ key: "name", label: "Name", render: (r) => r.name }]}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(9);
    await userEvent.type(
      screen.getByRole("textbox", { name: "Tìm trong bảng" }),
      "Record 11",
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Record 11")).toBeVisible();
  });
  it("dialog has accessible name and closes via button", async () => {
    const close = vi.fn();
    render(
      <Modal title="Chi tiết hồ sơ" onClose={close}>
        <p>Nội dung</p>
      </Modal>,
    );
    expect(
      screen.getByRole("dialog", { name: "Chi tiết hồ sơ" }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(close).toHaveBeenCalledOnce();
  });
  it("destructive action requires confirmation and invokes once", async () => {
    const fn = vi.fn(async () => undefined);
    render(<Action label="Xóa hồ sơ" confirm action={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "Xóa hồ sơ" }));
    expect(fn).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    await waitFor(() => expect(fn).toHaveBeenCalledOnce());
  });
  it("async failure is shown instead of success", async () => {
    render(
      <Action
        label="Gửi"
        action={async () => {
          throw new Error("Mất kết nối demo");
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Mất kết nối demo",
    );
  });
  it("carousel keyboard navigation changes focused project without autoplay", () => {
    render(<ImmersivePropertyCarousel />);
    const region = screen.getByRole("region", { name: "Bộ sưu tập dự án" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(
      screen.getByRole("button", { name: "Dự án 2: Cedar House" }),
    ).toHaveAttribute("aria-current", "true");
  });
  it("property favorites toggle state through adapter", async () => {
    render(<PropertyCard property={useDemo.getState().data.properties[0]} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Yêu thích A0101" }),
    );
    await waitFor(() =>
      expect(useDemo.getState().data.favorites).toContain("A0101"),
    );
  });
  it("form rejects duplicate email and keeps entered data", async () => {
    render(<EntityForm entity="leads" title="Tạo lead" onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Họ tên"), "Khách trùng");
    await userEvent.type(
      screen.getByLabelText("Email demo"),
      "minhanh@example.test",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Lưu hồ sơ demo" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("trùng");
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Khách trùng");
  });
});
