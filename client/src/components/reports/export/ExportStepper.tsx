import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { StepId } from "./useExportReport";

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "Tipo" },
  { id: 2, label: "Período" },
  { id: 3, label: "Clientes" },
  { id: 4, label: "Opções" },
  { id: 5, label: "Gerar" },
];

interface ExportStepperProps {
  current: StepId;
}

export function ExportStepper({ current }: ExportStepperProps) {
  return (
    <div className="flex w-full items-start gap-0 px-1">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="flex flex-1 items-start last:flex-none">
            <div className="flex min-w-12 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300",
                  done && "scale-95 border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]",
                  !done && !active && "border-border bg-background text-muted-foreground/70"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap transition-colors duration-300",
                  active ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/60"
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div className="mx-2 mt-4 flex-1">
                <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
