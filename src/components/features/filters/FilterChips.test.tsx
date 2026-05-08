import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { describe, expect, it } from "vitest";
import FilterChips from "./FilterChips";

function ParamsDisplay() {
  const [params] = useSearchParams();
  return <output data-testid="params">{params.toString()}</output>;
}

function Wrapper({ initialPath = "/" }: { initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <FilterChips />
      <ParamsDisplay />
    </MemoryRouter>
  );
}

describe("FilterChips", () => {
  it("renders nothing when no filters are active", () => {
    render(<Wrapper />);
    expect(screen.queryByLabelText("Active filters")).not.toBeInTheDocument();
  });

  it("renders one chip per active filter param", () => {
    render(<Wrapper initialPath="/?region=Northeast&premiumMin=5000&claimsTotalMax=100000" />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("shows correct label for region chip", () => {
    render(<Wrapper initialPath="/?region=Southeast" />);
    expect(screen.getByText("Region: Southeast")).toBeInTheDocument();
  });

  it("shows correct label for premiumMin chip", () => {
    render(<Wrapper initialPath="/?premiumMin=50000" />);
    expect(screen.getByText(/Premium ≥ \$50,000/)).toBeInTheDocument();
  });

  it("shows correct label for claimsTotalMax chip", () => {
    render(<Wrapper initialPath="/?claimsTotalMax=200000" />);
    expect(screen.getByText(/Claims ≤ \$200,000/)).toBeInTheDocument();
  });

  it("shows correct label for reimbursementRiskMin chip", () => {
    render(<Wrapper initialPath="/?reimbursementRiskMin=0.4" />);
    expect(screen.getByText("Risk ≥ 0.4")).toBeInTheDocument();
  });

  it("dismissing a chip removes only that param from URL", () => {
    render(<Wrapper initialPath="/?region=Northeast&premiumMin=5000" />);

    const removeRegion = screen.getByLabelText(/remove region: northeast filter/i);
    fireEvent.click(removeRegion);

    const params = screen.getByTestId("params").textContent ?? "";
    expect(params).not.toContain("region");
    expect(params).toContain("premiumMin=5000");
  });

  it("dismissing a chip resets page to 1", () => {
    render(<Wrapper initialPath="/?region=Midwest&page=3" />);

    fireEvent.click(screen.getByLabelText(/remove region: midwest filter/i));

    expect(screen.getByTestId("params").textContent).toContain("page=1");
  });

  it("dismissing all chips one by one renders nothing", () => {
    render(<Wrapper initialPath="/?region=Northeast" />);

    fireEvent.click(screen.getByLabelText(/remove region: northeast filter/i));

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
