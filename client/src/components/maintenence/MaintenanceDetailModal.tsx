import { X } from "lucide-react";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MaintenanceRequest } from "@/services/MaintenenceRequestService";
import { EmailThread } from "@/components/maintenence/EmailTread";

interface MaintenanceDetailModalProps {
  request: MaintenanceRequest | null;
  open: boolean;
  onClose: () => void;
}

export default function MaintenanceDetailModal({
  request,
  open,
  onClose,
}: MaintenanceDetailModalProps) {
  if (!request) return null;


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {request.subject}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Ticket #{request.ticketNumber}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <EmailThread description={request.description || ""} />
        </div>
      </DialogContent>
    </Dialog>
  );
}