import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import FilterModal from "./FilterModal";

function ParamsDisplay() {
  const [params] = useSearchParams();
  return <output data-testid="params">{params.toString()}</output>;
}

function Wrapper({
  initialPath = "/",
  open = true,
  onClose = vi.fn(),
}: {
  initialPath?: string;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <FilterModal open={open} onClose={onClose} />
      <ParamsDisplay />
    </MemoryRouter>
  );
}

describe("FilterModal", () => {
  it("renders all filter sections when open", () => {
    render(<Wrapper />);
    expect(screen.getByText("Filter Policies")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Effective Date")).toBeInTheDocument();
    expect(screen.getByText(/Premium/i)).toBeInTheDocument();
    expect(screen.getByText(/Claims Total/i)).toBeInTheDocument();
    expect(screen.getByText(/Reimbursement Risk/i)).toBeInTheDocument();
  });

  it("does not render form when closed", () => {
    render(<Wrapper open={false} />);
    expect(screen.queryByText("Filter Policies")).not.toBeInTheDocument();
  });

  it("selects a region and updates URL on Apply", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Wrapper onClose={onClose} />);

    // Open the region combobox and select Northeast
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Northeast" }));

    await user.click(screen.getByRole("button", { name: /apply/i }));

    expect(screen.getByTestId("params").textContent).toContain("region=Northeast");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows validation error when premium min exceeds max", () => {
    const onClose = vi.fn();
    render(<Wrapper onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/premium minimum/i), {
      target: { value: "50000" },
    });
    fireEvent.change(screen.getByLabelText(/premium maximum/i), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/min must be less than or equal to max/i);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows validation error when claims total min exceeds max", () => {
    render(<Wrapper />);

    fireEvent.change(screen.getByLabelText(/claims total minimum/i), {
      target: { value: "9999" },
    });
    fireEvent.change(screen.getByLabelText(/claims total maximum/i), {
      target: { value: "1000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/min must be less than or equal to max/i);
  });

  it("shows validation error when risk min exceeds max", () => {
    render(<Wrapper />);

    fireEvent.change(screen.getByLabelText(/reimbursement risk minimum/i), {
      target: { value: "0.8" },
    });
    fireEvent.change(screen.getByLabelText(/reimbursement risk maximum/i), {
      target: { value: "0.2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/min must be less than or equal to max/i);
  });

  it("applies filter params and resets page to 1 on Apply", () => {
    const onClose = vi.fn();
    render(<Wrapper initialPath="/?page=3" onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/premium minimum/i), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    const params = screen.getByTestId("params").textContent ?? "";
    expect(params).toContain("premiumMin=5000");
    expect(params).toContain("page=1");
    expect(onClose).toHaveBeenCalled();
  });

  it("clears all filter params and resets page to 1 on Clear all", () => {
    const onClose = vi.fn();
    render(<Wrapper initialPath="/?region=Northeast&premiumMin=1000&page=3" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

    const params = screen.getByTestId("params").textContent ?? "";
    expect(params).not.toContain("region");
    expect(params).not.toContain("premiumMin");
    expect(params).toContain("page=1");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose without updating URL on Cancel", () => {
    const onClose = vi.fn();
    render(<Wrapper initialPath="/?region=Northeast" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByTestId("params").textContent).toContain("region=Northeast");
    expect(onClose).toHaveBeenCalled();
  });

  it("pre-populates inputs from URL params when modal opens", () => {
    render(<Wrapper initialPath="/?premiumMin=5000&premiumMax=100000&region=Midwest" />);

    expect(screen.getByLabelText(/premium minimum/i)).toHaveValue(5000);
    expect(screen.getByLabelText(/premium maximum/i)).toHaveValue(100000);
  });
});
