import { X } from "lucide-react";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MaintenanceRequest } from "@/services/MaintenenceRequestService";

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

  // Sanitiza permitindo mais tags comuns de e-mail
  const sanitizedContent = DOMPurify.sanitize(request.description || "", {
    ALLOWED_TAGS: [
      "div",
      "p",
      "span",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "ul",
      "ol",
      "li",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: ["style", "class", "href", "target", "rel", "title", "spellcheck"],
  });

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
          <div
            className="email-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}