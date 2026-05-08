import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PolicySummary } from "@/types/policy";
import ExpandedPolicyRow from "./ExpandedPolicyRow";
import RiskBadge from "./RiskBadge";

interface PoliciesTableProps {
  policies: PolicySummary[];
  expandedId?: string | null;
  onToggleRow: (id: string) => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function PoliciesTable({ policies, expandedId, onToggleRow }: PoliciesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Account</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Facilities</TableHead>
          <TableHead>Effective Date</TableHead>
          <TableHead>Premium</TableHead>
          <TableHead>Claims Total</TableHead>
          <TableHead>Risk</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => {
          const isExpanded = expandedId === policy.id;
          return (
            <Fragment key={policy.id}>
              <TableRow
                className="cursor-pointer"
                onClick={() => onToggleRow(policy.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleRow(policy.id);
                  }
                }}
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`detail-${policy.id}`}
              >
                <TableCell>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{policy.accountName}</TableCell>
                <TableCell>{policy.region}</TableCell>
                <TableCell>{policy.facilityCount}</TableCell>
                <TableCell>{formatDate(policy.effectiveDate)}</TableCell>
                <TableCell>{formatCurrency(policy.premium)}</TableCell>
                <TableCell>{formatCurrency(policy.claimsTotal)}</TableCell>
                <TableCell>
                  <RiskBadge reimbursementRisk={policy.reimbursementRisk} />
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow id={`detail-${policy.id}`}>
                  <TableCell colSpan={8} className="bg-muted/30 p-0">
                    <ExpandedPolicyRow id={policy.id} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default PoliciesTable;
