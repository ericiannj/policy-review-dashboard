import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PolicyDetail } from "@/types/policy";
import PolicyForm from "./PolicyForm";

export interface PolicyFormModalProps {
  mode: "create" | "edit";
  policy?: PolicyDetail;
  open: boolean;
  onClose: () => void;
}

function PolicyFormModal({ mode, policy, open, onClose }: PolicyFormModalProps) {
  const title = mode === "create" ? "Create Policy" : "Edit Policy";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg" aria-labelledby="policy-form-title">
        <DialogHeader>
          <DialogTitle id="policy-form-title">{title}</DialogTitle>
        </DialogHeader>
        {open && <PolicyForm mode={mode} policy={policy} onSuccess={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

export default PolicyFormModal;
