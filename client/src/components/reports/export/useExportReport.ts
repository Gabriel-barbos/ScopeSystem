import { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";

export type ReportType = "services" | "schedules";
export type ExportStatus = "idle" | "generating" | "success" | "error";
export type StepId = 1 | 2 | 3 | 4 | 5;

export interface ExportState {
  reportType: ReportType | null;
  dateRange: DateRange | undefined;
  selectedClientIds: string[];
  includeOldData: boolean;
  includeDetailedStatus: boolean;
  status: ExportStatus;
  errorMessage?: string;
}

const INITIAL_STATE: ExportState = {
  reportType: null,
  dateRange: undefined,
  selectedClientIds: [],
  includeOldData: false,
  includeDetailedStatus: false,
  status: "idle",
};

const CAN_ADVANCE: Record<StepId, (s: ExportState) => boolean> = {
  1: (s) => s.reportType !== null,
  2: () => true,
  3: () => true,
  4: () => true,
  5: () => false,
};

export function useExportReport(
  onExportSchedules: (dateRange?: DateRange, clientIds?: string[]) => void | Promise<void>,
  onExportServices: (dateRange?: DateRange, includeOldData?: boolean, clientIds?: string[]) => void | Promise<void>
) {
  const [step, setStep] = useState<StepId>(1);
  const [state, setState] = useState<ExportState>(INITIAL_STATE);

  const update = useCallback(<K extends keyof ExportState>(key: K, value: ExportState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canAdvance = CAN_ADVANCE[step]?.(state) ?? false;

  const goNext = useCallback(() => {
    if (!canAdvance || step >= 5) return;
    setStep((s) => (s + 1) as StepId);
  }, [canAdvance, step]);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    setStep((s) => (s - 1) as StepId);
  }, [step]);

  const runExport = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "generating" }));
    setStep(5);
    try {
      if (state.reportType === "schedules") {
        await onExportSchedules(state.dateRange, state.selectedClientIds);
      } else {
        await onExportServices(state.dateRange, state.includeOldData, state.selectedClientIds);
      }
      setState((prev) => ({ ...prev, status: "success" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar relatório.";
      setState((prev) => ({ ...prev, status: "error", errorMessage: msg }));
    }
  }, [state, onExportSchedules, onExportServices]);

  const reset = useCallback(() => {
    setStep(1);
    setState(INITIAL_STATE);
  }, []);

  return { step, state, update, canAdvance, goNext, goBack, runExport, reset };
}
