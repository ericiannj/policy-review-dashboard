import { useState } from "react";
import PolicyFormModal from "@/components/features/policy-form/PolicyFormModal";
import { Button } from "@/components/ui/button";
import { usePolicy } from "@/hooks/use-policy";
import type { PolicyDetail } from "@/types/policy";
import DeletePolicyDialog from "./DeletePolicyDialog";
import PendingReviewsList from "./PendingReviewsList";
import PolicyDetailError from "./PolicyDetailError";
import PolicyDetailSkeleton from "./PolicyDetailSkeleton";
import RiskBadge from "./RiskBadge";

interface ExpandedPolicyRowProps {
  id: string;
  onDelete?: () => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDaysUntilRenewal = (days: number): string => {
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"}`;
};

interface DetailContentProps {
  detail: PolicyDetail;
  onDelete?: () => void;
}

function DetailContent({ detail, onDelete }: DetailContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="px-8 py-5">
        <div className="grid grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-border/60 md:grid-cols-3">
          <section className="pb-4 md:pb-0 md:pr-8">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Renewal &amp; Account
            </h3>
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Effective Date
                </dt>
                <dd className="text-sm font-semibold mt-0.5">
                  {formatDate(detail.renewal.effectiveDate)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Days Until Renewal
                </dt>
                <dd className="text-sm font-semibold mt-0.5">
                  {formatDaysUntilRenewal(detail.renewal.daysUntilRenewal)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="py-4 md:py-0 md:px-8">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Financials
            </h3>
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Premium
                </dt>
                <dd className="text-sm font-semibold mt-0.5">
                  {formatCurrency(detail.financials.premium)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Claims Total
                </dt>
                <dd className="text-sm font-semibold mt-0.5">
                  {formatCurrency(detail.financials.claimsTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Reimbursement Risk
                </dt>
                <dd className="mt-1.5 flex items-center gap-2">
                  <RiskBadge reimbursementRisk={detail.financials.reimbursementRisk} />
                  <span className="text-sm font-semibold tabular-nums">
                    {(detail.financials.reimbursementRisk * 100).toFixed(0)}%
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="pt-4 md:pt-0 md:pl-8">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Compliance
            </h3>
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Missing Documents
                </dt>
                <dd className="text-sm font-semibold mt-0.5">
                  {detail.compliance.missingDocuments}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Expired Documents
                </dt>
                <dd className="text-sm font-semibold mt-0.5">
                  {detail.compliance.expiredDocuments}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  Pending Reviews
                </dt>
                <dd className="mt-1.5">
                  <PendingReviewsList reviews={detail.compliance.pendingReviews} />
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-border/50 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            aria-label="Edit policy"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteOpen(true)}
            aria-label="Delete policy"
          >
            Delete
          </Button>
        </div>
      </div>

      <PolicyFormModal
        mode="edit"
        policy={detail}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <DeletePolicyDialog
        policyId={detail.id}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={onDelete ?? (() => {})}
      />
    </>
  );
}

function ExpandedPolicyRow({ id, onDelete }: ExpandedPolicyRowProps) {
  const { data, isPending, isError, refetch } = usePolicy(id);

  if (isPending) return <PolicyDetailSkeleton />;
  if (isError) return <PolicyDetailError onRetry={refetch} />;

  return <DetailContent detail={data} onDelete={onDelete} />;
}

export default ExpandedPolicyRow;
