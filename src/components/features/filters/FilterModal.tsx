import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Region } from "@/types/policy";

const REGIONS: Region[] = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];

const ALL_REGIONS_VALUE = "__all__";

interface FilterDraft {
  region: string;
  effectiveDateFrom: string;
  effectiveDateTo: string;
  premiumMin: string;
  premiumMax: string;
  claimsTotalMin: string;
  claimsTotalMax: string;
  reimbursementRiskMin: string;
  reimbursementRiskMax: string;
}

interface RangeErrors {
  premium?: string;
  claimsTotal?: string;
  reimbursementRisk?: string;
}

export interface FilterModalProps {
  open: boolean;
  onClose: () => void;
}

function initDraft(params: URLSearchParams): FilterDraft {
  return {
    region: params.get("region") ?? "",
    effectiveDateFrom: params.get("effectiveDateFrom") ?? "",
    effectiveDateTo: params.get("effectiveDateTo") ?? "",
    premiumMin: params.get("premiumMin") ?? "",
    premiumMax: params.get("premiumMax") ?? "",
    claimsTotalMin: params.get("claimsTotalMin") ?? "",
    claimsTotalMax: params.get("claimsTotalMax") ?? "",
    reimbursementRiskMin: params.get("reimbursementRiskMin") ?? "",
    reimbursementRiskMax: params.get("reimbursementRiskMax") ?? "",
  };
}

// Inner form — remounted each time the dialog opens, so state always starts
// fresh from current URL params. Avoids stale draft when filters change externally.
function FilterForm({ onClose }: { onClose: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDraft = useRef<FilterDraft>(initDraft(searchParams));
  const [draft, setDraft] = useState<FilterDraft>(() => initialDraft.current);
  const [errors, setErrors] = useState<RangeErrors>({});

  const set = (field: keyof FilterDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const next: RangeErrors = {};
    if (
      draft.premiumMin !== "" &&
      draft.premiumMax !== "" &&
      Number(draft.premiumMin) > Number(draft.premiumMax)
    ) {
      next.premium = "Min must be less than or equal to max.";
    }
    if (
      draft.claimsTotalMin !== "" &&
      draft.claimsTotalMax !== "" &&
      Number(draft.claimsTotalMin) > Number(draft.claimsTotalMax)
    ) {
      next.claimsTotal = "Min must be less than or equal to max.";
    }
    if (
      draft.reimbursementRiskMin !== "" &&
      draft.reimbursementRiskMax !== "" &&
      Number(draft.reimbursementRiskMin) > Number(draft.reimbursementRiskMax)
    ) {
      next.reimbursementRisk = "Min must be less than or equal to max.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleApply = () => {
    if (!validate()) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      const fields = Object.keys(draft) as (keyof FilterDraft)[];
      for (const field of fields) {
        if (draft[field]) {
          next.set(field, draft[field]);
        } else {
          next.delete(field);
        }
      }
      return next;
    });
    onClose();
  };

  const handleReset = () => {
    setDraft(initialDraft.current);
    setErrors({});
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="filter-region" className="mb-1.5 block text-sm font-medium">
            Region
          </label>
          <Select
            value={draft.region || ALL_REGIONS_VALUE}
            onValueChange={(v) => set("region", v === ALL_REGIONS_VALUE ? "" : v)}
          >
            <SelectTrigger id="filter-region" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_REGIONS_VALUE}>All regions</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Effective Date</legend>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="filter-effective-date-from"
              type="date"
              value={draft.effectiveDateFrom}
              onChange={(e) => set("effectiveDateFrom", e.target.value)}
              aria-label="Effective date from"
            />
            <Input
              id="filter-effective-date-to"
              type="date"
              value={draft.effectiveDateTo}
              onChange={(e) => set("effectiveDateTo", e.target.value)}
              aria-label="Effective date to"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Premium ($)</legend>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              min={0}
              value={draft.premiumMin}
              onChange={(e) => set("premiumMin", e.target.value)}
              aria-label="Premium minimum"
              aria-invalid={!!errors.premium}
            />
            <Input
              type="number"
              placeholder="Max"
              min={0}
              value={draft.premiumMax}
              onChange={(e) => set("premiumMax", e.target.value)}
              aria-label="Premium maximum"
              aria-invalid={!!errors.premium}
            />
          </div>
          {errors.premium && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.premium}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Claims Total ($)</legend>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              min={0}
              value={draft.claimsTotalMin}
              onChange={(e) => set("claimsTotalMin", e.target.value)}
              aria-label="Claims total minimum"
              aria-invalid={!!errors.claimsTotal}
            />
            <Input
              type="number"
              placeholder="Max"
              min={0}
              value={draft.claimsTotalMax}
              onChange={(e) => set("claimsTotalMax", e.target.value)}
              aria-label="Claims total maximum"
              aria-invalid={!!errors.claimsTotal}
            />
          </div>
          {errors.claimsTotal && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.claimsTotal}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Reimbursement Risk (0–1)</legend>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              min={0}
              max={1}
              step={0.01}
              value={draft.reimbursementRiskMin}
              onChange={(e) => set("reimbursementRiskMin", e.target.value)}
              aria-label="Reimbursement risk minimum"
              aria-invalid={!!errors.reimbursementRisk}
            />
            <Input
              type="number"
              placeholder="Max"
              min={0}
              max={1}
              step={0.01}
              value={draft.reimbursementRiskMax}
              onChange={(e) => set("reimbursementRiskMax", e.target.value)}
              aria-label="Reimbursement risk maximum"
              aria-invalid={!!errors.reimbursementRisk}
            />
          </div>
          {errors.reimbursementRisk && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.reimbursementRisk}
            </p>
          )}
        </fieldset>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={handleReset}>
          Reset all
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply</Button>
      </DialogFooter>
    </>
  );
}

function FilterModal({ open, onClose }: FilterModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Policies</DialogTitle>
        </DialogHeader>
        {open && <FilterForm onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

export default FilterModal;
