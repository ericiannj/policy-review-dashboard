import { Skeleton } from "@/components/ui/skeleton";

const SECTIONS = ["renewal", "financials", "compliance"] as const;

function PolicyDetailSkeleton() {
  return (
    <div
      role="status"
      className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3"
      aria-label="Loading policy details"
    >
      {SECTIONS.map((section) => (
        <div key={section} className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PolicyDetailSkeleton;
