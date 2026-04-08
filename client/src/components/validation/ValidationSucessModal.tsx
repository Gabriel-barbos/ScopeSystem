import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setAnimate(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm border-0 shadow-2xl p-0 overflow-hidden">

        {/* Barra superior animada */}
        <div className="h-1 w-full bg-muted overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-700 ease-out"
            style={{ width: animate ? "100%" : "0%" }}
          />
        </div>

        <div className="flex flex-col items-center gap-6 px-8 pt-10 pb-8">

          {/* Ícone animado */}
          <div className="relative flex items-center justify-center">

            {/* Anel externo — expande e some */}
            <div
              className="absolute rounded-full bg-green-500/15 transition-all duration-700 ease-out"
              style={{
                width: animate ? "96px" : "64px",
                height: animate ? "96px" : "64px",
                opacity: animate ? 0 : 1,
                transitionDelay: "200ms",
              }}
            />

            {/* Anel médio fixo */}
            <div
              className="absolute rounded-full bg-green-500/10 transition-all duration-500 ease-out"
              style={{
                width: "80px",
                height: "80px",
                opacity: animate ? 1 : 0,
                transform: animate ? "scale(1)" : "scale(0.6)",
                transitionDelay: "150ms",
              }}
            />

            {/* Círculo principal */}
            <div
              className="relative z-10 flex items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30 transition-all duration-500 ease-out"
              style={{
                width: "64px",
                height: "64px",
                transform: animate ? "scale(1)" : "scale(0)",
                transitionDelay: "100ms",
              }}
            >
              {/* Check com stroke animado via CSS */}
              <Check
                className="text-white transition-all duration-400 ease-out"
                style={{
                  width: "30px",
                  height: "30px",
                  opacity: animate ? 1 : 0,
                  transform: animate ? "scale(1) rotate(0deg)" : "scale(0) rotate(-45deg)",
                  transitionDelay: "350ms",
                  transitionDuration: "400ms",
                }}
                strokeWidth={3}
              />
            </div>
          </div>

          {/* Textos */}
          <div
            className="text-center space-y-2 transition-all duration-500 ease-out"
            style={{
              opacity: animate ? 1 : 0,
              transform: animate ? "translateY(0)" : "translateY(10px)",
              transitionDelay: "450ms",
            }}
          >
            <h2 className="text-lg font-semibold tracking-tight">
              Veículo validado com sucesso!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serviço registrado no sistema e <br /> agendamento atualizado.
            </p>
          </div>

          {/* Botões */}
          <div
            className="flex w-full gap-2 transition-all duration-500 ease-out"
            style={{
              opacity: animate ? 1 : 0,
              transform: animate ? "translateY(0)" : "translateY(10px)",
              transitionDelay: "550ms",
            }}
          >
    
            <Button
              onClick={() => { onNewValidation(); onClose(); }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              Nova Validação
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}