import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PendingReview, ReviewSeverity } from "@/types/policy";

interface PendingReviewsListProps {
  reviews: PendingReview[];
}

const severityStyles: Record<ReviewSeverity, string> = {
  critical:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  medium:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

const severityLabel: Record<ReviewSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function PendingReviewsList({ reviews }: PendingReviewsListProps) {
  if (!reviews.length) {
    return <p className="text-sm text-muted-foreground">None</p>;
  }

  return (
    <ul className="space-y-2">
      {reviews.map((review) => (
        <li
          key={`${review.type}-${review.dueDate}`}
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <Badge variant="outline" className={cn(severityStyles[review.severity])}>
            {severityLabel[review.severity]}
          </Badge>
          <span className="font-medium">{review.type}</span>
          <span className="text-muted-foreground" aria-hidden="true">
            ·
          </span>
          <span className="text-muted-foreground">Due {formatDate(review.dueDate)}</span>
        </li>
      ))}
    </ul>
  );
}

export default PendingReviewsList;
