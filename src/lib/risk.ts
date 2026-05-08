export type RiskLevel = "Low" | "Medium" | "High";

export const getRiskLevel = (reimbursementRisk: number): RiskLevel => {
  if (reimbursementRisk >= 0.7) return "High";
  if (reimbursementRisk >= 0.4) return "Medium";
  return "Low";
};
