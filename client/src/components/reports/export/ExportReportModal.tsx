import { useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileDown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { useExportReport } from "./useExportReport";
import { ExportStepper } from "./ExportStepper";
import { Step1ReportType } from "./steps/Step1ReportType";
import { Step2Period } from "./steps/Step2Period";
import { Step3Clients } from "./steps/Step3Clients";
import { Step4Options } from "./steps/Step4Options";
import { Step5Generating } from "./steps/Step5Generating";

interface ExportReportModalProps {
  onExportSchedules: (dateRange?: DateRange, clientIds?: string[]) => void | Promise<void>;
  onExportServices: (dateRange?: DateRange, includeOldData?: boolean, clientIds?: string[]) => void | Promise<void>;
  className?: string;
}

export function ExportReportModal({
  onExportSchedules,
  onExportServices,
  className,
}: ExportReportModalProps) {
  const [open, setOpen] = useState(false);

  const { step, state, update, canAdvance, goNext, goBack, runExport, reset } =
    useExportReport(onExportSchedules, onExportServices);

  const isLastStep = step === 4;
  const isStep5 = step === 5;

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) setTimeout(reset, 300);
  }

  function handleClose() {
    handleOpenChange(false);
  }

  function handleNext() {
    if (isLastStep) runExport();
    else goNext();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm",
          "transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className
        )}
      >
        Extrair relatórios
        <FileDown className="h-4 w-4" />
      </button>

      {/* SheetContent: full height, custom wide width overriding sm:max-w-sm */}
      <SheetContent
        side="top"
        className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-none"
      >
        {/* Progress bar */}
        <div className="h-1 w-full shrink-0 bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base">
              <FileDown className="h-4 w-4 text-primary" />
              Extrair relatório
            </SheetTitle>
            <SheetDescription className="text-xs">
              Siga os passos para configurar e exportar seus dados
            </SheetDescription>
          </SheetHeader>

          {/* Stepper */}
          {!isStep5 && (
            <div className="mt-4">
              <ExportStepper current={step} />
            </div>
          )}
        </div>

        {/* Scrollable step content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 sidebar-scroll">
          <StepContent
            step={step}
            state={state}
            update={update}
            onClose={handleClose}
            onRetry={runExport}
          />
        </div>

        {/* Footer nav — pinned to bottom */}
        {!isStep5 && (
          <div className="shrink-0 flex items-center justify-between gap-3 border-t px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={step === 1}
              onClick={goBack}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!canAdvance}
              onClick={handleNext}
              className="gap-1.5 min-w-32"
            >
              {isLastStep ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar relatório
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Step renderer ──────────────────────────────────────────────────────────────

interface StepContentProps {
  step: number;
  state: ReturnType<typeof useExportReport>["state"];
  update: ReturnType<typeof useExportReport>["update"];
  onClose: () => void;
  onRetry: () => void;
}

function StepContent({ step, state, update, onClose, onRetry }: StepContentProps) {
  switch (step) {
    case 1:
      return (
        <Step1ReportType
          value={state.reportType}
          onChange={(t) => update("reportType", t)}
        />
      );
    case 2:
      return (
        <Step2Period
          value={state.dateRange}
          onChange={(r) => update("dateRange", r)}
        />
      );
    case 3:
      return (
        <Step3Clients
          selected={state.selectedClientIds}
          onChange={(ids) => update("selectedClientIds", ids)}
        />
      );
    case 4:
      return (
        <Step4Options
          reportType={state.reportType}
          dateRange={state.dateRange}
          selectedClientIds={state.selectedClientIds}
          includeOldData={state.includeOldData}
          includeDetailedStatus={state.includeDetailedStatus}
          onChangeOldData={(v) => update("includeOldData", v)}
          onChangeDetailedStatus={(v) => update("includeDetailedStatus", v)}
        />
      );
    case 5:
      return (
        <Step5Generating
          status={state.status}
          errorMessage={state.errorMessage}
          onClose={onClose}
          onRetry={onRetry}
        />
      );
    default:
      return null;
  }
}
