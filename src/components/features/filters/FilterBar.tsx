import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FilterChips from "./FilterChips";
import FilterModal from "./FilterModal";
import SearchInput from "./SearchInput";

const FILTER_PARAMS = [
  "region",
  "effectiveDateFrom",
  "effectiveDateTo",
  "premiumMin",
  "premiumMax",
  "claimsTotalMin",
  "claimsTotalMax",
  "reimbursementRiskMin",
  "reimbursementRiskMax",
];

function FilterBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCount = FILTER_PARAMS.filter((p) => searchParams.has(p)).length;

  const handleClearAll = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const p of FILTER_PARAMS) {
        next.delete(p);
      }
      next.set("page", "1");
      return next;
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 max-w-sm">
          <SearchInput />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(true)}
          aria-label={activeCount > 0 ? `Open filters, ${activeCount} active` : "Open filters"}
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span
              className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
              aria-hidden="true"
            >
              {activeCount}
            </span>
          )}
        </Button>
      </div>
      {activeCount > 0 && (
        <div className="mt-2 flex items-start justify-between gap-2">
          <FilterChips />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="shrink-0 text-primary hover:text-primary"
          >
            Clear all
          </Button>
        </div>
      )}
      <FilterModal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
}

export default FilterBar;
