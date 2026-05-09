import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_KEYS = [
  "sk-0",
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
  "sk-9",
];

function PoliciesTableSkeleton() {
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
      <TableBody aria-busy="true">
        {SKELETON_KEYS.map((key) => (
          <TableRow key={key} aria-hidden="true">
            <TableCell className="pl-4">
              <Skeleton className="h-4 w-4" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-4 w-40 mb-1.5" />
              <Skeleton className="h-3 w-16" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-4 w-10" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="py-3.5">
              <Skeleton className="h-5 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default PoliciesTableSkeleton;
