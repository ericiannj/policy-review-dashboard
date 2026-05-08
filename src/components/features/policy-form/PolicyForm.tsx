import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePolicy } from "@/hooks/use-create-policy";
import { useUpdatePolicy } from "@/hooks/use-update-policy";
import type { PolicyDetail, Region } from "@/types/policy";
import PendingReviewsField, { type ReviewEntry, toReviewEntry } from "./PendingReviewsField";

const REGIONS: Region[] = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];

interface FormState {
  accountName: string;
  region: Region;
  facilityCount: string;
  effectiveDate: string;
  premium: string;
  claimsTotal: string;
  reimbursementRisk: string;
  missingDocuments: string;
  expiredDocuments: string;
  pendingReviews: ReviewEntry[];
}

interface FormErrors {
  accountName?: string;
  region?: string;
  facilityCount?: string;
  effectiveDate?: string;
  premium?: string;
  claimsTotal?: string;
  reimbursementRisk?: string;
  missingDocuments?: string;
  expiredDocuments?: string;
  reviews?: string;
  submit?: string;
}

export interface PolicyFormProps {
  mode: "create" | "edit";
  policy?: PolicyDetail;
  onSuccess: () => void;
}

function computeDaysUntilRenewal(dateStr: string): number {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function initState(policy?: PolicyDetail): FormState {
  if (!policy) {
    return {
      accountName: "",
      region: "Northeast",
      facilityCount: "0",
      effectiveDate: "",
      premium: "",
      claimsTotal: "",
      reimbursementRisk: "",
      missingDocuments: "0",
      expiredDocuments: "0",
      pendingReviews: [],
    };
  }
  return {
    accountName: policy.account.name,
    region: policy.account.region,
    facilityCount: String(policy.account.facilityCount),
    effectiveDate: policy.renewal.effectiveDate,
    premium: String(policy.financials.premium),
    claimsTotal: String(policy.financials.claimsTotal),
    reimbursementRisk: String(policy.financials.reimbursementRisk),
    missingDocuments: String(policy.compliance.missingDocuments),
    expiredDocuments: String(policy.compliance.expiredDocuments),
    pendingReviews: policy.compliance.pendingReviews.map(toReviewEntry),
  };
}

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.accountName.trim()) errors.accountName = "Account name is required.";
  if (!state.region) errors.region = "Region is required.";
  if (
    state.facilityCount === "" ||
    Number(state.facilityCount) < 0 ||
    !Number.isInteger(Number(state.facilityCount))
  ) {
    errors.facilityCount = "Facility count must be a non-negative integer.";
  }
  if (!state.effectiveDate) errors.effectiveDate = "Effective date is required.";
  if (state.premium === "" || Number(state.premium) < 0) {
    errors.premium = "Premium must be a non-negative number.";
  }
  if (state.claimsTotal === "" || Number(state.claimsTotal) < 0) {
    errors.claimsTotal = "Claims total must be a non-negative number.";
  }
  const risk = Number(state.reimbursementRisk);
  if (state.reimbursementRisk === "" || risk < 0 || risk > 1) {
    errors.reimbursementRisk = "Reimbursement risk must be between 0 and 1.";
  }
  if (
    state.missingDocuments === "" ||
    Number(state.missingDocuments) < 0 ||
    !Number.isInteger(Number(state.missingDocuments))
  ) {
    errors.missingDocuments = "Missing documents must be a non-negative integer.";
  }
  if (
    state.expiredDocuments === "" ||
    Number(state.expiredDocuments) < 0 ||
    !Number.isInteger(Number(state.expiredDocuments))
  ) {
    errors.expiredDocuments = "Expired documents must be a non-negative integer.";
  }
  for (const review of state.pendingReviews) {
    if (!review.dueDate) {
      errors.reviews = "All pending reviews must have a due date.";
      break;
    }
  }

  return errors;
}

function PolicyForm({ mode, policy, onSuccess }: PolicyFormProps) {
  const [state, setState] = useState<FormState>(() => initState(policy));
  const [errors, setErrors] = useState<FormErrors>({});

  const createMutation = useCreatePolicy();
  const updateMutation = useUpdatePolicy();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const daysUntilRenewal = computeDaysUntilRenewal(state.effectiveDate);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(state);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      account: {
        name: state.accountName.trim(),
        region: state.region,
        facilityCount: Number(state.facilityCount),
      },
      renewal: {
        effectiveDate: state.effectiveDate,
        daysUntilRenewal,
      },
      financials: {
        premium: Number(state.premium),
        claimsTotal: Number(state.claimsTotal),
        reimbursementRisk: Number(state.reimbursementRisk),
      },
      compliance: {
        missingDocuments: Number(state.missingDocuments),
        expiredDocuments: Number(state.expiredDocuments),
        // Strip the internal _id before sending to the API
        pendingReviews: state.pendingReviews.map(({ _id: _, ...r }) => r),
      },
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess(),
        onError: () => setErrors({ submit: "Failed to create policy. Please try again." }),
      });
    } else {
      if (!policy) return;
      updateMutation.mutate(
        { id: policy.id, payload },
        {
          onSuccess: () => onSuccess(),
          onError: () => setErrors({ submit: "Failed to update policy. Please try again." }),
        },
      );
    }
  };

  return (
    <form
      id="policy-form"
      onSubmit={handleSubmit}
      className="max-h-[65vh] space-y-5 overflow-y-auto pr-1"
      noValidate
    >
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Account</legend>

        <div>
          <label htmlFor="account-name" className="mb-1 block text-sm font-medium">
            Account Name <span aria-hidden="true">*</span>
          </label>
          <Input
            id="account-name"
            type="text"
            value={state.accountName}
            onChange={(e) => set("accountName", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.accountName}
            aria-describedby={errors.accountName ? "account-name-error" : undefined}
          />
          {errors.accountName && (
            <p id="account-name-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.accountName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="account-region" className="mb-1 block text-sm font-medium">
            Region <span aria-hidden="true">*</span>
          </label>
          <Select value={state.region} onValueChange={(v) => set("region", v as Region)}>
            <SelectTrigger id="account-region" aria-required="true">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.region}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="facility-count" className="mb-1 block text-sm font-medium">
            Facility Count <span aria-hidden="true">*</span>
          </label>
          <Input
            id="facility-count"
            type="number"
            min={0}
            step={1}
            value={state.facilityCount}
            onChange={(e) => set("facilityCount", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.facilityCount}
            aria-describedby={errors.facilityCount ? "facility-count-error" : undefined}
          />
          {errors.facilityCount && (
            <p id="facility-count-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.facilityCount}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Renewal</legend>

        <div>
          <label htmlFor="effective-date" className="mb-1 block text-sm font-medium">
            Effective Date <span aria-hidden="true">*</span>
          </label>
          <Input
            id="effective-date"
            type="date"
            value={state.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.effectiveDate}
            aria-describedby={errors.effectiveDate ? "effective-date-error" : undefined}
          />
          {errors.effectiveDate && (
            <p id="effective-date-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.effectiveDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="days-until-renewal" className="mb-1 block text-sm font-medium">
            Days Until Renewal <span className="text-muted-foreground">(computed)</span>
          </label>
          <Input
            id="days-until-renewal"
            type="text"
            value={state.effectiveDate ? String(daysUntilRenewal) : "—"}
            readOnly
            aria-readonly="true"
            className="bg-muted text-muted-foreground"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Financials</legend>

        <div>
          <label htmlFor="premium" className="mb-1 block text-sm font-medium">
            Premium ($) <span aria-hidden="true">*</span>
          </label>
          <Input
            id="premium"
            type="number"
            min={0}
            step={0.01}
            value={state.premium}
            onChange={(e) => set("premium", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.premium}
            aria-describedby={errors.premium ? "premium-error" : undefined}
          />
          {errors.premium && (
            <p id="premium-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.premium}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="claims-total" className="mb-1 block text-sm font-medium">
            Claims Total ($) <span aria-hidden="true">*</span>
          </label>
          <Input
            id="claims-total"
            type="number"
            min={0}
            step={0.01}
            value={state.claimsTotal}
            onChange={(e) => set("claimsTotal", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.claimsTotal}
            aria-describedby={errors.claimsTotal ? "claims-total-error" : undefined}
          />
          {errors.claimsTotal && (
            <p id="claims-total-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.claimsTotal}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reimbursement-risk" className="mb-1 block text-sm font-medium">
            Reimbursement Risk (0–1) <span aria-hidden="true">*</span>
          </label>
          <Input
            id="reimbursement-risk"
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={state.reimbursementRisk}
            onChange={(e) => set("reimbursementRisk", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.reimbursementRisk}
            aria-describedby={errors.reimbursementRisk ? "reimbursement-risk-error" : undefined}
          />
          {errors.reimbursementRisk && (
            <p id="reimbursement-risk-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.reimbursementRisk}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Compliance</legend>

        <div>
          <label htmlFor="missing-docs" className="mb-1 block text-sm font-medium">
            Missing Documents
          </label>
          <Input
            id="missing-docs"
            type="number"
            min={0}
            step={1}
            value={state.missingDocuments}
            onChange={(e) => set("missingDocuments", e.target.value)}
            aria-invalid={!!errors.missingDocuments}
            aria-describedby={errors.missingDocuments ? "missing-docs-error" : undefined}
          />
          {errors.missingDocuments && (
            <p id="missing-docs-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.missingDocuments}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="expired-docs" className="mb-1 block text-sm font-medium">
            Expired Documents
          </label>
          <Input
            id="expired-docs"
            type="number"
            min={0}
            step={1}
            value={state.expiredDocuments}
            onChange={(e) => set("expiredDocuments", e.target.value)}
            aria-invalid={!!errors.expiredDocuments}
            aria-describedby={errors.expiredDocuments ? "expired-docs-error" : undefined}
          />
          {errors.expiredDocuments && (
            <p id="expired-docs-error" className="mt-1 text-xs text-destructive" role="alert">
              {errors.expiredDocuments}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Pending Reviews</p>
          <PendingReviewsField
            value={state.pendingReviews}
            onChange={(reviews) => set("pendingReviews", reviews)}
          />
          {errors.reviews && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.reviews}
            </p>
          )}
        </div>
      </fieldset>

      {errors.submit && (
        <p className="text-sm text-destructive" role="alert">
          {errors.submit}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="submit" form="policy-form" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Policy"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default PolicyForm;
