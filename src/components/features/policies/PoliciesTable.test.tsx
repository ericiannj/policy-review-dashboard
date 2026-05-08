import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PolicySummary } from "@/types/policy";
import PoliciesTable from "./PoliciesTable";

const noop = vi.fn();

const mockPolicies: PolicySummary[] = [
  {
    id: "POL-1001",
    accountName: "Sunrise Care Center",
    region: "Northeast",
    facilityCount: 3,
    effectiveDate: "2026-06-01",
    premium: 128000,
    claimsTotal: 42100,
    reimbursementRisk: 0.24,
  },
  {
    id: "POL-1002",
    accountName: "Green Valley Hospital",
    region: "Southeast",
    facilityCount: 5,
    effectiveDate: "2026-07-15",
    premium: 250000,
    claimsTotal: 180000,
    reimbursementRisk: 0.75,
  },
];

describe("PoliciesTable", () => {
  it("renders all column headers", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Facilities")).toBeInTheDocument();
    expect(screen.getByText("Effective Date")).toBeInTheDocument();
    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("Claims Total")).toBeInTheDocument();
    expect(screen.getByText("Risk")).toBeInTheDocument();
  });

  it("renders account names for all rows", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("Sunrise Care Center")).toBeInTheDocument();
    expect(screen.getByText("Green Valley Hospital")).toBeInTheDocument();
  });

  it("formats premium as currency with no decimals", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("$128,000")).toBeInTheDocument();
    expect(screen.getByText("$250,000")).toBeInTheDocument();
  });

  it("formats claims total as currency with no decimals", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("$42,100")).toBeInTheDocument();
    expect(screen.getByText("$180,000")).toBeInTheDocument();
  });

  it("shows correct risk badge label for Low risk", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows correct risk badge label for High risk", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders one row per policy plus the header row", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(mockPolicies.length + 1);
  });

  it("renders region values", () => {
    render(<PoliciesTable policies={mockPolicies} onToggleRow={noop} />);
    expect(screen.getByText("Northeast")).toBeInTheDocument();
    expect(screen.getByText("Southeast")).toBeInTheDocument();
  });
});
