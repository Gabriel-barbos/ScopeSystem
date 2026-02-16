import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FileDown,
  Calendar,
  Wrench,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { ReportsDateRangeFilter } from "./ReportsDataRangeFilter";
import { cn } from "@/lib/utils";

type ReportType = "services" | "schedules";

interface ExportButtonProps {
  onExportSchedules: (dateRange?: DateRange) => void | Promise<void>;
  onExportServices: (
    dateRange?: DateRange,
    includeOldData?: boolean
  ) => void | Promise<void>;
  className?: string;
}

export function ExportButton({
  onExportSchedules,
  onExportServices,
  className,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [useCustomPeriod, setUseCustomPeriod] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [includeOldData, setIncludeOldData] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setSelectedType(null);
    setUseCustomPeriod(false);
    setDateRange(undefined);
    setIncludeOldData(false);
    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(handleReset, 200);
    }
  };

  const handleToggleCustomPeriod = (checked: boolean) => {
    setUseCustomPeriod(checked);
    if (!checked) {
      setDateRange(undefined);
    }
  };

  const handleExport = async () => {
    if (!selectedType) return;
    if (useCustomPeriod && !dateRange?.from) return;

    try {
      setLoading(true);

      const exportDateRange = useCustomPeriod ? dateRange : undefined;

      if (selectedType === "schedules") {
        await onExportSchedules(exportDateRange);
      } else {
        await onExportServices(exportDateRange, includeOldData);
      }

      setOpen(false);
      setTimeout(handleReset, 200);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes: {
    type: ReportType;
    label: string;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      type: "services",
      label: "Serviços",
      icon: Wrench,
      description: "Relatório de serviços realizados",
    },
    {
      type: "schedules",
      label: "Agendamentos",
      icon: Calendar,
      description: "Relatório de agendamentos",
    },
  ];

  const canExport =
    selectedType != null && (!useCustomPeriod || dateRange?.from != null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className={cn("gap-2", className)}>
          Extrair relatórios
          <FileDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileDown className="h-5 w-5" />
            Extrair relatórios
          </DialogTitle>
          <DialogDescription>
            Selecione o tipo de relatório e as opções desejadas para exportar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Seleção de tipo de relatório */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Selecione o tipo de relatório que deseja:
            </Label>

            <div className="flex gap-3">
              {reportTypes.map(({ type, label, icon: Icon, description }) => {
                const isSelected = selectedType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    disabled={loading}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "relative flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 p-5 transition-all",
                      "hover:border-primary/50 hover:bg-accent/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "disabled:pointer-events-none disabled:opacity-50",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-background"
                    )}
                  >
                    {isSelected && (
                      <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}

                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="text-center">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção de período */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="use-custom-period"
                checked={useCustomPeriod}
                onCheckedChange={(checked) =>
                  handleToggleCustomPeriod(checked === true)
                }
                disabled={loading}
              />
              <Label
                htmlFor="use-custom-period"
                className="text-sm font-medium cursor-pointer"
              >
                Filtrar por período específico
              </Label>
            </div>

            {!useCustomPeriod && (
              <p className="text-xs text-muted-foreground pl-6">
                O relatório será gerado com todos os dados disponíveis.
              </p>
            )}

            {useCustomPeriod && (
              <div className="space-y-2 pl-6">
                <Label className="text-xs text-muted-foreground">
                  Selecione o período desejado:
                </Label>
                <div>
                  <ReportsDateRangeFilter
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </div>

                {!dateRange?.from && (
                  <p className="text-xs text-amber-600">
                    Selecione um período para continuar.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Switch para incluir dados antigos (apenas para Serviços) */}
          {selectedType === "services" && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="include-old-data"
                  className="text-sm font-medium cursor-pointer"
                >
                  Incluir dados antigos
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inclui registros de serviços anteriores ao período selecionado
                </p>
              </div>
              <Switch
                id="include-old-data"
                checked={includeOldData}
                onCheckedChange={setIncludeOldData}
                disabled={loading}
              />
            </div>
          )}

          {/* Botão de exportar */}
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!canExport || loading}
            onClick={handleExport}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando, aguarde...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}