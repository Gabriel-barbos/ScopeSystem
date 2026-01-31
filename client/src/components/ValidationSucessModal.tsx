import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ValidationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onNewValidation: () => void;
}

export function ValidationSuccessModal({
  open,
  onClose,
  onNewValidation,
}: ValidationSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Veiculo validado com sucesso!
            </DialogTitle>
          </div>
          <DialogDescription className="text-center">
            Os dados da instalação foram registrados no sistema e o agendamento
            foi atualizado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Nova Validação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}