import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterBar from "@/components/features/filters/FilterBar";
import PaginationControls from "@/components/features/policies/PaginationControls";
import PoliciesEmptyState from "@/components/features/policies/PoliciesEmptyState";
import PoliciesErrorState from "@/components/features/policies/PoliciesErrorState";
import PoliciesTable from "@/components/features/policies/PoliciesTable";
import PoliciesTableSkeleton from "@/components/features/policies/PoliciesTableSkeleton";
import PolicyFormModal from "@/components/features/policy-form/PolicyFormModal";
import { Button } from "@/components/ui/button";
import { usePolicies } from "@/hooks/use-policies";
import type { Region } from "@/types/policy";

const VALID_REGIONS = new Set<string>(["Northeast", "Southeast", "Midwest", "Southwest", "West"]);

function parseRegion(value: string | null): Region | undefined {
  if (value !== null && VALID_REGIONS.has(value)) return value as Region;
  return undefined;
}

function numParam(params: URLSearchParams, key: string): number | undefined {
  const v = params.get(key);
  return v !== null ? Number(v) : undefined;
}

function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? undefined;
  const expanded = searchParams.get("expanded") ?? undefined;
  const region = parseRegion(searchParams.get("region"));
  const effectiveDateFrom = searchParams.get("effectiveDateFrom") ?? undefined;
  const effectiveDateTo = searchParams.get("effectiveDateTo") ?? undefined;
  const premiumMin = numParam(searchParams, "premiumMin");
  const premiumMax = numParam(searchParams, "premiumMax");
  const claimsTotalMin = numParam(searchParams, "claimsTotalMin");
  const claimsTotalMax = numParam(searchParams, "claimsTotalMax");
  const reimbursementRiskMin = numParam(searchParams, "reimbursementRiskMin");
  const reimbursementRiskMax = numParam(searchParams, "reimbursementRiskMax");

  const { data, isPending, isError, refetch } = usePolicies({
    page,
    limit,
    search,
    region,
    effectiveDateFrom,
    effectiveDateTo,
    premiumMin,
    premiumMax,
    claimsTotalMin,
    claimsTotalMax,
    reimbursementRiskMin,
    reimbursementRiskMax,
  });

  const handleToggleRow = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get("expanded") === id) {
        next.delete("expanded");
      } else {
        next.set("expanded", id);
      }
      return next;
    });
  };

  const renderContent = () => {
    if (isPending) return <PoliciesTableSkeleton />;
    if (isError) return <PoliciesErrorState onRetry={refetch} />;
    if (!data?.data.length) return <PoliciesEmptyState />;
    return (
      <PoliciesTable policies={data.data} expandedId={expanded} onToggleRow={handleToggleRow} />
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Policy Review Dashboard</h1>
          <Button onClick={() => setIsCreateOpen(true)}>Create Policy</Button>
        </div>
        <div className="mb-4">
          <FilterBar />
        </div>
        <div className="rounded-lg border bg-card">
          {renderContent()}
          {data && (
            <PaginationControls
              total={data.pagination.total}
              totalPages={data.pagination.totalPages}
            />
          )}
        </div>
      </div>

      <PolicyFormModal mode="create" open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </main>
  );
}

export default DashboardPage;
