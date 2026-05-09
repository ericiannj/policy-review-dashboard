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

  const handleDeleteRow = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get("expanded") === id) next.delete("expanded");
      return next;
    });
  };

  const renderContent = () => {
    if (isPending) return <PoliciesTableSkeleton />;
    if (isError) return <PoliciesErrorState onRetry={refetch} />;
    if (!data?.data.length) return <PoliciesEmptyState />;
    return (
      <PoliciesTable
        policies={data.data}
        expandedId={expanded}
        onToggleRow={handleToggleRow}
        onDeleteRow={handleDeleteRow}
      />
    );
  };

  const statusMessage = isPending
    ? "Loading policies"
    : isError
      ? ""
      : data
        ? `${data.pagination.total} ${data.pagination.total === 1 ? "policy" : "policies"} found`
        : "";

  return (
    <div className="min-h-screen bg-background">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Policy Review Dashboard
          </h1>
          <Button onClick={() => setIsCreateOpen(true)}>Create Policy</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4">
          <FilterBar />
        </div>
        <div className="rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-black/4">
          {renderContent()}
          {data && data.pagination.total > 0 && (
            <PaginationControls
              total={data.pagination.total}
              totalPages={data.pagination.totalPages}
            />
          )}
        </div>
      </main>

      <PolicyFormModal mode="create" open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

export default DashboardPage;
