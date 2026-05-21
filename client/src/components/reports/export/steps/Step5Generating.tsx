import { useEffect, useState } from "react";
import { Check, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportStatus } from "../useExportReport";

interface Step5GeneratingProps {
  status: ExportStatus;
  errorMessage?: string;
  onClose: () => void;
  onRetry: () => void;
}

export function Step5Generating({ status, errorMessage, onClose, onRetry }: Step5GeneratingProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (status === "success" || status === "error") {
      const t = setTimeout(() => setAnimate(true), 60);
      return () => clearTimeout(t);
    } else {
      setAnimate(false);
    }
  }, [status]);

  if (status === "generating") {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="relative flex items-center justify-center">
          {/* Outer ring pulse */}
          <div className="absolute h-20 w-20 rounded-full bg-primary/10 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-sm">Gerando relatório...</p>
          <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        {/* Animated success icon — same pattern as ValidationSuccessModal */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full bg-green-500/15 transition-all duration-700 ease-out"
            style={{ width: animate ? "96px" : "64px", height: animate ? "96px" : "64px", opacity: animate ? 0 : 1, transitionDelay: "200ms" }}
          />
          <div
            className="absolute rounded-full bg-green-500/10 transition-all duration-500 ease-out"
            style={{ width: "80px", height: "80px", opacity: animate ? 1 : 0, transform: animate ? "scale(1)" : "scale(0.6)", transitionDelay: "150ms" }}
          />
          <div
            className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30 transition-all duration-500 ease-out"
            style={{ transform: animate ? "scale(1)" : "scale(0)", transitionDelay: "100ms" }}
          >
            <Check
              className="text-white"
              style={{ width: 28, height: 28, opacity: animate ? 1 : 0, transform: animate ? "scale(1) rotate(0deg)" : "scale(0) rotate(-45deg)", transition: "opacity 400ms 350ms, transform 400ms 350ms" }}
              strokeWidth={3}
            />
          </div>
        </div>

        <div
          className="text-center space-y-1 transition-all duration-500 ease-out"
          style={{ opacity: animate ? 1 : 0, transform: animate ? "translateY(0)" : "translateY(10px)", transitionDelay: "450ms" }}
        >
          <p className="font-semibold">Relatório gerado com sucesso!</p>
          <p className="text-sm text-muted-foreground">O download foi iniciado automaticamente.</p>
        </div>

        <div
          className="w-full transition-all duration-500 ease-out"
          style={{ opacity: animate ? 1 : 0, transform: animate ? "translateY(0)" : "translateY(10px)", transitionDelay: "550ms" }}
        >
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 transition-all duration-500 ease-out"
          style={{ transform: animate ? "scale(1)" : "scale(0)", transitionDelay: "100ms" }}
        >
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <div
          className="text-center space-y-1 transition-all duration-500 ease-out"
          style={{ opacity: animate ? 1 : 0, transitionDelay: "200ms" }}
        >
          <p className="font-semibold">Falha ao gerar relatório</p>
          <p className="text-xs text-muted-foreground">{errorMessage ?? "Tente novamente."}</p>
        </div>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Fechar</Button>
          <Button className="flex-1 gap-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
