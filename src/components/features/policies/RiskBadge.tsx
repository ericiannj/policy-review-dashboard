import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/lib/risk";
import { getRiskLevel } from "@/lib/risk";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  reimbursementRisk: number;
}

const riskStyles: Record<RiskLevel, string> = {
  High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  Medium:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

function RiskBadge({ reimbursementRisk }: RiskBadgeProps) {
  const level = getRiskLevel(reimbursementRisk);
  return (
    <Badge variant="outline" className={cn(riskStyles[level])}>
      {level}
    </Badge>
  );
}

export default RiskBadge;
