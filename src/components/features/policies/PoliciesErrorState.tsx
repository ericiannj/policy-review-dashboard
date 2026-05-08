import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PoliciesErrorStateProps {
  onRetry: () => void;
}

function PoliciesErrorState({ onRetry }: PoliciesErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="alert">
      <AlertCircle size={24} aria-hidden="true" className="mb-3 text-destructive" />
      <p className="mb-4 text-sm text-muted-foreground">Failed to load policies.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default PoliciesErrorState;
