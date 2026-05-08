import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PolicySummary } from "@/types/policy";
import RiskBadge from "./RiskBadge";

interface PoliciesTableProps {
  policies: PolicySummary[];
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

function PoliciesTable({ policies }: PoliciesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
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
        {policies.map((policy) => (
          <TableRow key={policy.id}>
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
        ))}
      </TableBody>
    </Table>
  );
}

export default PoliciesTable;
