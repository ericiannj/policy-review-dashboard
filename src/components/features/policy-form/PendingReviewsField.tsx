import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PendingReview, PendingReviewType, ReviewSeverity } from "@/types/policy";

const REVIEW_TYPES: PendingReviewType[] = [
  "License",
  "Staff Training",
  "Incident Report",
  "Billing Documentation",
  "Care Plan",
  "Medication Log",
  "Facility Inspection",
  "Insurance Certificate",
];

const SEVERITIES: ReviewSeverity[] = ["low", "medium", "high", "critical"];

// Internal type that adds a stable key for list rendering.
// The _id is stripped before the array is sent to the API.
export interface ReviewEntry extends PendingReview {
  _id: string;
}

export const toReviewEntry = (review: PendingReview): ReviewEntry => ({
  ...review,
  _id: crypto.randomUUID(),
});

export const EMPTY_ENTRY: Omit<ReviewEntry, "_id"> = {
  type: "License",
  dueDate: "",
  severity: "low",
};

export interface PendingReviewsFieldProps {
  value: ReviewEntry[];
  onChange: (reviews: ReviewEntry[]) => void;
}

function PendingReviewsField({ value, onChange }: PendingReviewsFieldProps) {
  const handleAdd = () => {
    onChange([...value, { ...EMPTY_ENTRY, _id: crypto.randomUUID() }]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((r) => r._id !== id));
  };

  const handleChange = <K extends keyof PendingReview>(
    id: string,
    field: K,
    fieldValue: PendingReview[K],
  ) => {
    onChange(value.map((r) => (r._id === id ? { ...r, [field]: fieldValue } : r)));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && <p className="text-sm text-muted-foreground">No pending reviews.</p>}
      {value.map((review, index) => (
        <fieldset
          key={review._id}
          aria-label={`Pending review ${index + 1}`}
          className="m-0 grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md border p-2"
        >
          <div>
            <label
              htmlFor={`review-type-${review._id}`}
              className="mb-1 block text-xs text-muted-foreground"
            >
              Type
            </label>
            <Select
              value={review.type}
              onValueChange={(v) => handleChange(review._id, "type", v as PendingReviewType)}
            >
              <SelectTrigger id={`review-type-${review._id}`} className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REVIEW_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor={`review-due-${review._id}`}
              className="mb-1 block text-xs text-muted-foreground"
            >
              Due Date
            </label>
            <Input
              id={`review-due-${review._id}`}
              type="date"
              value={review.dueDate}
              onChange={(e) => handleChange(review._id, "dueDate", e.target.value)}
              className="h-8 text-xs"
              aria-label={`Due date for review ${index + 1}`}
            />
          </div>

          <div>
            <label
              htmlFor={`review-severity-${review._id}`}
              className="mb-1 block text-xs text-muted-foreground"
            >
              Severity
            </label>
            <Select
              value={review.severity}
              onValueChange={(v) => handleChange(review._id, "severity", v as ReviewSeverity)}
            >
              <SelectTrigger
                id={`review-severity-${review._id}`}
                className="h-8 text-xs capitalize"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => handleRemove(review._id)}
            aria-label={`Remove review ${index + 1}`}
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </fieldset>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <PlusIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Add review
      </Button>
    </div>
  );
}

export default PendingReviewsField;
