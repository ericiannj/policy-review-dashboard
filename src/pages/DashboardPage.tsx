import PoliciesEmptyState from "@/components/features/policies/PoliciesEmptyState";
import PoliciesErrorState from "@/components/features/policies/PoliciesErrorState";
import PoliciesTable from "@/components/features/policies/PoliciesTable";
import PoliciesTableSkeleton from "@/components/features/policies/PoliciesTableSkeleton";
import { usePolicies } from "@/hooks/use-policies";

function DashboardPage() {
  const { data, isPending, isError, refetch } = usePolicies({ page: 1, limit: 20 });

  const renderContent = () => {
    if (isPending) return <PoliciesTableSkeleton />;
    if (isError) return <PoliciesErrorState onRetry={refetch} />;
    if (!data?.data.length) return <PoliciesEmptyState />;
    return <PoliciesTable policies={data.data} />;
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Policy Review Dashboard</h1>
        {renderContent()}
      </div>
    </main>
  );
}

export default DashboardPage;
