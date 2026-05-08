import { useSearchParams } from "react-router-dom";
import SearchInput from "@/components/features/filters/SearchInput";
import PaginationControls from "@/components/features/policies/PaginationControls";
import PoliciesEmptyState from "@/components/features/policies/PoliciesEmptyState";
import PoliciesErrorState from "@/components/features/policies/PoliciesErrorState";
import PoliciesTable from "@/components/features/policies/PoliciesTable";
import PoliciesTableSkeleton from "@/components/features/policies/PoliciesTableSkeleton";
import { usePolicies } from "@/hooks/use-policies";

function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? undefined;
  const expanded = searchParams.get("expanded") ?? undefined;

  const { data, isPending, isError, refetch } = usePolicies({ page, limit, search });

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
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Policy Review Dashboard</h1>
        <div className="mb-4 max-w-sm">
          <SearchInput />
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
    </main>
  );
}

export default DashboardPage;
