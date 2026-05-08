import { useState } from "react";
import PolicyFormModal from "@/components/features/policy-form/PolicyFormModal";
import { Button } from "@/components/ui/button";
import { usePolicy } from "@/hooks/use-policy";
import { getRiskLevel } from "@/lib/risk";
import type { PolicyDetail } from "@/types/policy";
import DeletePolicyDialog from "./DeletePolicyDialog";
import PendingReviewsList from "./PendingReviewsList";
import PolicyDetailError from "./PolicyDetailError";
import PolicyDetailSkeleton from "./PolicyDetailSkeleton";

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
  const riskLevel = getRiskLevel(detail.financials.reimbursementRisk);

  return (
    <>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Renewal
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Effective Date</dt>
                <dd className="text-sm font-medium">{formatDate(detail.renewal.effectiveDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Days Until Renewal</dt>
                <dd className="text-sm font-medium">
                  {formatDaysUntilRenewal(detail.renewal.daysUntilRenewal)}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Financials
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Premium</dt>
                <dd className="text-sm font-medium">{formatCurrency(detail.financials.premium)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Claims Total</dt>
                <dd className="text-sm font-medium">
                  {formatCurrency(detail.financials.claimsTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Reimbursement Risk</dt>
                <dd className="text-sm font-medium">
                  {(detail.financials.reimbursementRisk * 100).toFixed(0)}% ({riskLevel})
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Compliance
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Missing Documents</dt>
                <dd className="text-sm font-medium">{detail.compliance.missingDocuments}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Expired Documents</dt>
                <dd className="text-sm font-medium">{detail.compliance.expiredDocuments}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pending Reviews</dt>
                <dd className="mt-1">
                  <PendingReviewsList reviews={detail.compliance.pendingReviews} />
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
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
