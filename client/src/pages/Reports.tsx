import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartArea,
  Clock,
  XCircle,
  CheckCircle,
  Wrench,
  Settings,
  BadgeX,
  Loader2,
  ClipboardList,
  CalendarClock,
  TrendingUp,
  FileBarChart,
  Info,
} from "lucide-react";

import { ExportButton } from "@/components/reports/ExportButton";
import { ClientFilter } from "@/components/reports/ClientFilter";
import { ReportsDateRangeFilter } from "@/components/reports/ReportsDataRangeFilter";
import { SectionHeader } from "@/components/reports/SectionHeader";
import { AnimatedSection } from "@/components/reports/AnimatedSection";
import { AnimatedGrid, AnimatedGridItem } from "@/components/reports/AnimatedGrid";
import { StatCard } from "@/components/reports/StatCard";
import { ChartCardSkeleton } from "@/components/reports/ChartCardSkeleton";

import { useState, useMemo, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

import { useReportService, reportApi } from "@/services/ReportService";
import { PieChartPending } from "@/components/charts/PieChartPending";
import { BarChartPendingTecnics } from "@/components/charts/BarChartPendingTecnics";
import { EvolutionChart } from "@/components/charts/EvolutionChart";
import { ReportDailyChart, type PeriodType } from "@/components/charts/ReportDailyChart";
import { getDateRangeFromPeriod } from "@/utils/dateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";


// Config
const statsConfig = {
  agendamentos: [
    { key: "instalacoes", title: "Instalações", icon: Wrench, color: "#1890ff" },
    { key: "manutencoes", title: "Manutenções", icon: Settings, color: "#722ed1" },
  ],
  servicos: [
    { key: "instalacoes", title: "Instalações", icon: Wrench, color: "#1890ff" },
    { key: "manutencoes", title: "Manutenções", icon: Settings, color: "#722ed1" },
    { key: "desinstalacoes", title: "Desinstalações", icon: BadgeX, color: "#bd5215" },
  ],
} as const;


//Hook
function useReportParams(dateRange: DateRange | undefined, clientId: string | null) {
  return useMemo(() => {
    const params: Record<string, string> = {};
    if (dateRange?.from) {
      params.startDate = startOfDay(dateRange.from).toISOString();
      params.endDate = endOfDay(dateRange.to ?? dateRange.from).toISOString();
    }
    if (clientId) params.clientId = clientId;
    return params;
  }, [dateRange, clientId]);
}

function useReportDailyParams(period: PeriodType, clientId: string | null) {
  return useMemo(() => {
    const { startDate, endDate } = getDateRangeFromPeriod(period);
    const params: Record<string, string> = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    if (clientId) params.clientId = clientId;
    return params;
  }, [period, clientId]);
}

function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [clientId, setClientId] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("today");

  const reportParams = useReportParams(dateRange, clientId);
  const reportDailyParams = useReportDailyParams(reportPeriod, clientId);

  const { data, isLoading } = useReportService(reportParams);
  const { data: reportDailyData, isLoading: isLoadingReportDaily } =
    useReportService(reportDailyParams);

  const handleReportPeriodChange = useCallback((period: PeriodType) => {
    setReportPeriod(period);
  }, []);

  const handleExportSchedules = useCallback(
    async (exportDateRange?: DateRange) => {
      try {
        await reportApi.export("schedules", exportDateRange);
        toast.success("Exportação de agendamentos iniciada!");
      } catch {
        toast.error("Erro ao exportar agendamentos.");
      }
    },
    []
  );

  const handleExportServices = useCallback(
    async (exportDateRange?: DateRange, includeOldData?: boolean) => {
      try {
        await reportApi.export("services", exportDateRange, includeOldData);
        toast.success("Exportação de serviços iniciada!");
      } catch {
        toast.error("Erro ao exportar serviços.");
      }
    },
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ChartArea className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-2xl">Relatórios</CardTitle>
            </div>
            <CardDescription>
              Visualize os dados da operação em tempo real
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <ReportsDateRangeFilter value={dateRange} onChange={setDateRange} />
            <ClientFilter value={clientId} onChange={setClientId} />
            <ExportButton
              onExportSchedules={handleExportSchedules}
              onExportServices={handleExportServices}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
      {/* Serviços */}
<AnimatedSection index={0}>
  <SectionHeader
    icon={ClipboardList}
    color="#1890ff"
    title="Serviços"
    description="Total de serviços realizados no período"
    live
  />
  <AnimatedGrid columns={3}>
    {statsConfig.servicos.map(({ key, ...props }) => (
      <AnimatedGridItem key={key}>
        <StatCard
          {...props}
          isLoading={isLoading}
          value={
            data?.servicesByType[key as keyof typeof data.servicesByType] ?? 0
          }
        />
      </AnimatedGridItem>
    ))}
  </AnimatedGrid>
</AnimatedSection>

{/* Pendências */}
<AnimatedSection index={1}>
  <SectionHeader
    icon={CalendarClock}
    color="#722ed1"
    title="Pendências — Agendamentos"
    description="Agendamentos pendentes por tipo"
  />
  <AnimatedGrid columns={2}>
    {statsConfig.agendamentos.map(({ key, ...props }) => (
      <AnimatedGridItem key={key}>
        <StatCard
          {...props}
          isLoading={isLoading}
          value={
            data?.schedulesByStatus[
              key as keyof typeof data.schedulesByStatus
            ] ?? 0
          }
        />
      </AnimatedGridItem>
    ))}
  </AnimatedGrid>
</AnimatedSection>

        {/* Gráficos de Pendências */}
        <AnimatedSection index={2}>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PieChartPending data={data?.pendingByClient ?? []} />
              <BarChartPendingTecnics data={data?.pendingByProvider ?? []} />
            </div>
          )}
        </AnimatedSection>

        {/* Divider / Aviso */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Dados históricos
            </span>
          </div>
        </div>

        <Alert
          variant="default"
          className="border-blue-200/50 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20"
        >
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-muted-foreground">
            Os gráficos abaixo exibem dados históricos e não são influenciados
            pelos filtros de período e cliente.
          </AlertDescription>
        </Alert>

        {/* Evolução Mensal */}
        <AnimatedSection index={3}>
          <SectionHeader
            icon={TrendingUp}
            color="#13c2c2"
            title="Evolução Mensal"
            description="Acompanhe a tendência mês a mês"
          />
          {isLoading ? (
            <ChartCardSkeleton />
          ) : (
            <EvolutionChart
              monthlyData={data?.evolutionByMonth ?? []}
              dailyData={data?.evolutionByDay ?? {}}
            />
          )}
        </AnimatedSection>

        {/* Reporte Diário */}
        <AnimatedSection index={4}>
          <SectionHeader
            icon={FileBarChart}
            color="#fa8c16"
            title="Reporte de Serviços"
            description="Distribuição de serviços por período"
          />
          <ReportDailyChart
            data={reportDailyData?.reportDaily}
            isLoading={isLoadingReportDaily}
            onPeriodChange={handleReportPeriodChange}
          />
        </AnimatedSection>
      </CardContent>
    </Card>
  );
}

export default Reports;