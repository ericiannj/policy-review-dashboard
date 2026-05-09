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
  onDeleteRow?: (id: string) => void;
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

function PoliciesTable({ policies, expandedId, onToggleRow, onDeleteRow }: PoliciesTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10 pl-4" />
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Account
          </TableHead>
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Region
          </TableHead>
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Facilities
          </TableHead>
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Effective Date
          </TableHead>
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Premium
          </TableHead>
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Claims Total
          </TableHead>
          <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Risk
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="font-normal">
        {policies.map((policy) => {
          const isExpanded = expandedId === policy.id;
          return (
            <Fragment key={policy.id}>
              <TableRow
                className="cursor-pointer transition-colors duration-100"
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
                <TableCell className="pl-4 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" aria-hidden="true" />
                  )}
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="font-medium text-foreground">{policy.accountName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{policy.id}</div>
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="inline-flex items-center rounded-md border border-border/70 bg-secondary px-2 py-0.5 text-xs font-medium text-foreground/80">
                    {policy.region}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 tabular-nums">{policy.facilityCount}</TableCell>
                <TableCell className="py-3.5 tabular-nums">
                  {formatDate(policy.effectiveDate)}
                </TableCell>
                <TableCell className="py-3.5 tabular-nums">
                  {formatCurrency(policy.premium)}
                </TableCell>
                <TableCell className="py-3.5 tabular-nums">
                  {formatCurrency(policy.claimsTotal)}
                </TableCell>
                <TableCell className="py-3.5">
                  <RiskBadge reimbursementRisk={policy.reimbursementRisk} />
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow id={`detail-${policy.id}`} className="hover:bg-transparent">
                  <TableCell colSpan={8} className="bg-muted/40 p-0 border-l-2 border-l-primary/30">
                    <ExpandedPolicyRow id={policy.id} onDelete={() => onDeleteRow?.(policy.id)} />
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
