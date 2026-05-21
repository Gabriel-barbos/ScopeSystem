import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { reportApi } from "@/services/ReportService";

import { useExportReport } from "@/components/reports/export/useExportReport";
import { ExportStepper } from "@/components/reports/export/ExportStepper";
import { Step1ReportType } from "@/components/reports/export/steps/Step1ReportType";
import { Step2Period } from "@/components/reports/export/steps/Step2Period";
import { Step3Clients } from "@/components/reports/export/steps/Step3Clients";
import { Step4Options } from "@/components/reports/export/steps/Step4Options";
import { Step5Generating } from "@/components/reports/export/steps/Step5Generating";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles, FileDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepId } from "@/components/reports/export/useExportReport";

export default function ExportReportPage() {
  const navigate = useNavigate();

  const handleExportSchedules = useCallback(async (dateRange?: DateRange, clientIds?: string[]) => {
    await reportApi.export("schedules", dateRange, false, clientIds);
    toast.success("Exportação de agendamentos iniciada!");
  }, []);

  const handleExportServices = useCallback(
    async (dateRange?: DateRange, includeOldData?: boolean, clientIds?: string[]) => {
      await reportApi.export("services", dateRange, includeOldData, clientIds);
      toast.success("Exportação de serviços iniciada!");
    },
    []
  );

  const { step, state, update, canAdvance, goNext, goBack, runExport, reset } =
    useExportReport(handleExportSchedules, handleExportServices);

  const isLastStep = step === 4;
  const isStep5 = step === 5;

  function handleClose() {
    reset();
    navigate("/reports");
  }

  function handleNext() {
    if (isLastStep) runExport();
    else goNext();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Relatórios
        </button>
      </div>

      {/* Main card */}
      <Card className="overflow-hidden">
        {/* Top progress bar */}
        <div className="h-1 w-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <CardHeader className="border-b px-5 pb-5 lg:px-8">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <FileDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold">Extrair relatório</h1>
              <p className="text-xs text-muted-foreground">Passo {step} de 5</p>
            </div>
          </div>

          {/* Stepper — only on steps 1–4 */}
          {!isStep5 && <ExportStepper current={step as StepId} />}
        </CardHeader>

        {/* Step content */}
        <CardContent className="px-5 py-5 lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-6xl">
            <StepContent
              step={step}
              state={state}
              update={update}
              onClose={handleClose}
              onRetry={runExport}
            />
          </div>
        </CardContent>

        {/* Footer nav */}
        {!isStep5 && (
          <div className="border-t px-5 py-4 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={step === 1}
                onClick={goBack}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>

              <div className="flex items-center gap-3">
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        s < step  && "h-1.5 w-4 bg-primary",
                        s === step && "h-1.5 w-6 bg-primary",
                        s > step  && "h-1.5 w-1.5 bg-border"
                      )}
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  disabled={!canAdvance}
                  onClick={handleNext}
                  className="gap-1.5 min-w-36"
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
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Step renderer ─────────────────────────────────────────────────────────────

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
