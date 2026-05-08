import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeletePolicy } from "@/hooks/use-delete-policy";

interface DeletePolicyDialogProps {
  policyId: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

function DeletePolicyDialog({ policyId, open, onClose, onDeleted }: DeletePolicyDialogProps) {
  const { mutate, isPending } = useDeletePolicy();

  const handleConfirm = () => {
    mutate(policyId, {
      onSuccess: () => {
        onDeleted();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={false} aria-labelledby="delete-policy-title">
        <DialogHeader>
          <DialogTitle id="delete-policy-title">Delete Policy</DialogTitle>
          <DialogDescription>Delete this policy? This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            aria-label="Confirm delete"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeletePolicyDialog;
