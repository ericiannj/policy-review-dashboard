import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

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
] as const;

type FilterParam = (typeof FILTER_PARAMS)[number];

const CHIP_LABELS: Record<FilterParam, (value: string) => string> = {
  region: (v) => `Region: ${v}`,
  effectiveDateFrom: (v) => `Date from: ${v}`,
  effectiveDateTo: (v) => `Date to: ${v}`,
  premiumMin: (v) => `Premium ≥ $${Number(v).toLocaleString("en-US")}`,
  premiumMax: (v) => `Premium ≤ $${Number(v).toLocaleString("en-US")}`,
  claimsTotalMin: (v) => `Claims ≥ $${Number(v).toLocaleString("en-US")}`,
  claimsTotalMax: (v) => `Claims ≤ $${Number(v).toLocaleString("en-US")}`,
  reimbursementRiskMin: (v) => `Risk ≥ ${v}`,
  reimbursementRiskMax: (v) => `Risk ≤ ${v}`,
};

function FilterChips() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilters = FILTER_PARAMS.filter((p) => searchParams.has(p));

  if (activeFilters.length === 0) return null;

  const removeFilter = (param: FilterParam) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(param);
      next.set("page", "1");
      return next;
    });
  };

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Active filters">
      {activeFilters.map((param) => {
        const value = searchParams.get(param) ?? "";
        const label = CHIP_LABELS[param](value);
        return (
          <li
            key={param}
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {label}
            <button
              type="button"
              onClick={() => removeFilter(param)}
              className="ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Remove ${label} filter`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default FilterChips;
