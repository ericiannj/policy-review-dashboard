import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PolicyDetailErrorProps {
  onRetry: () => void;
}

function PolicyDetailError({ onRetry }: PolicyDetailErrorProps) {
  return (
    <div className="flex items-center gap-3 p-6 text-destructive" role="alert">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm">Failed to load policy details.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default PolicyDetailError;
