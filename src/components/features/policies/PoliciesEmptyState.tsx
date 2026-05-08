import { FileX } from "lucide-react";

function PoliciesEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-muted-foreground"
      role="status"
      aria-label="No policies found"
    >
      <FileX size={24} aria-hidden="true" className="mb-3" />
      <p className="text-sm">No policies found.</p>
    </div>
  );
}

export default PoliciesEmptyState;
