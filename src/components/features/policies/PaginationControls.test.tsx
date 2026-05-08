import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PaginationControls from "./PaginationControls";

function ParamsDisplay() {
  const [params] = useSearchParams();
  return <output data-testid="params">{params.toString()}</output>;
}

function Wrapper({
  initialPath = "/?page=1&limit=20",
  total = 100,
  totalPages = 5,
}: {
  initialPath?: string;
  total?: number;
  totalPages?: number;
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <PaginationControls total={total} totalPages={totalPages} />
      <ParamsDisplay />
    </MemoryRouter>
  );
}

describe("PaginationControls", () => {
  it("disables Previous button on page 1", () => {
    render(<Wrapper initialPath="/?page=1" />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("enables Previous button when not on page 1", () => {
    render(<Wrapper initialPath="/?page=2" />);
    expect(screen.getByRole("button", { name: "Previous page" })).not.toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(<Wrapper initialPath="/?page=5" totalPages={5} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("enables Next button when not on last page", () => {
    render(<Wrapper initialPath="/?page=3" totalPages={5} />);
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
  });

  it("shows range indicator text", () => {
    render(<Wrapper initialPath="/?page=1&limit=20" total={100} />);
    expect(screen.getByText("1–20 of 100")).toBeInTheDocument();
  });

  it("shows correct range on page 2", () => {
    render(<Wrapper initialPath="/?page=2&limit=20" total={100} />);
    expect(screen.getByText("21–40 of 100")).toBeInTheDocument();
  });

  it("marks active page with aria-current=page", () => {
    render(<Wrapper initialPath="/?page=2" />);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("does not mark inactive pages with aria-current", () => {
    render(<Wrapper initialPath="/?page=2" />);
    expect(screen.getByRole("button", { name: "Page 1" })).not.toHaveAttribute("aria-current");
  });

  it("advances to next page on Next click", async () => {
    const user = userEvent.setup();
    render(<Wrapper initialPath="/?page=2" />);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByTestId("params").textContent).toContain("page=3");
  });

  it("goes to previous page on Previous click", async () => {
    const user = userEvent.setup();
    render(<Wrapper initialPath="/?page=3" />);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByTestId("params").textContent).toContain("page=2");
  });

  it("resets to page 1 when rows-per-page changes", async () => {
    const user = userEvent.setup();
    render(<Wrapper initialPath="/?page=3&limit=20" />);
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(screen.getByRole("option", { name: "10" }));
    const params = screen.getByTestId("params").textContent ?? "";
    expect(params).toContain("page=1");
    expect(params).toContain("limit=10");
  });
});
