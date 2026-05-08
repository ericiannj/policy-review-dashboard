import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RiskBadge from "./RiskBadge";

describe("RiskBadge", () => {
  it("shows High label for risk at 0.70 boundary", () => {
    render(<RiskBadge reimbursementRisk={0.7} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows High label for risk above 0.70", () => {
    render(<RiskBadge reimbursementRisk={0.85} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows High label at maximum (1.00)", () => {
    render(<RiskBadge reimbursementRisk={1.0} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows Medium label for risk = 0.55", () => {
    render(<RiskBadge reimbursementRisk={0.55} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows Medium label at 0.40 boundary", () => {
    render(<RiskBadge reimbursementRisk={0.4} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows Medium label just below 0.70", () => {
    render(<RiskBadge reimbursementRisk={0.69} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows Low label for risk = 0.20", () => {
    render(<RiskBadge reimbursementRisk={0.2} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows Low label at minimum (0.00)", () => {
    render(<RiskBadge reimbursementRisk={0.0} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows Low label just below 0.40", () => {
    render(<RiskBadge reimbursementRisk={0.39} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });
});
