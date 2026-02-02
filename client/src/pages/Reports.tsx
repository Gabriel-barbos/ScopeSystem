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
} from "lucide-react";

import { ExportButton } from "@/components/reports/ExportButton";
import { ClientFilter } from "@/components/reports/ClientFilter";
import { ReportsDateRangeFilter } from "@/components/reports/ReportsDataRangeFilter";
import { Statistic } from "antd";
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


const statsConfig = {
  agendamentos: [
     { key: "concluidos", title: "Concluídos", icon: CheckCircle, color: "#52c41a" },
    { key: "pendentes", title: "Pendentes", icon: Clock, color: "#faad14" },
    { key: "cancelados", title: "Cancelados", icon: XCircle, color: "#ff4d4f" },
   
  ],
  servicos: [
    { key: "instalacoes", title: "Instalações", icon: Wrench, color: "#1890ff" },
    { key: "manutencoes", title: "Manutenções", icon: Settings, color: "#722ed1" },
    { key: "desinstalacoes", title: "Desinstalações", icon: BadgeX, color: "#bd5215" },
  ],
} as const;

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
};

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <Card className="flex items-center gap-4 p-4">
    <div
      className="flex h-10 w-10 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <Statistic title={title} value={value} />
  </Card>
);

// Hook customizado para construir os params de report
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

// Hook ReportDaily
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
  // Filtros da página
  const [dateRange, setDateRange] = useState<DateRange>();
  const [clientId, setClientId] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("today");

  // Params usando hooks customizados
  const reportParams = useReportParams(dateRange, clientId);
  const reportDailyParams = useReportDailyParams(reportPeriod, clientId);

  // Queries
  const { data, isLoading } = useReportService(reportParams);
  const { data: reportDailyData, isLoading: isLoadingReportDaily } = useReportService(reportDailyParams);

  // Handlers
  const handleReportPeriodChange = useCallback((period: PeriodType) => {
    setReportPeriod(period);
  }, []);

  const handleExport = useCallback(async (type: "schedules" | "services") => {
    try {
      await reportApi.export(type);
      toast.success(
        `Exportação de ${type === "schedules" ? "agendamentos" : "serviços"} iniciada!`
      );
    } catch {
      toast.error("Erro ao exportar dados.");
    }
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <ChartArea className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Relatórios</CardTitle>
            <CardDescription>
              Visualize os dados da operação em tempo real
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ReportsDateRangeFilter value={dateRange} onChange={setDateRange} />
            <ClientFilter value={clientId} onChange={setClientId} />
            <ExportButton
              onExportSchedules={() => handleExport("schedules")}
              onExportServices={() => handleExport("services")}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Serviços */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Serviços</h3>
          <div className="grid grid-cols-3 gap-4">
            {statsConfig.servicos.map(({ key, ...props }) => (
              <StatCard
                key={key}
                {...props}
                value={data?.servicesByType[key as keyof typeof data.servicesByType] ?? 0}
              />
            ))}
          </div>
        </section>

        {/* Agendamentos */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Agendamentos</h3>
          <div className="grid grid-cols-3 gap-4">
            {statsConfig.agendamentos.map(({ key, ...props }) => (
              <StatCard
                key={key}
                {...props}
                value={data?.schedulesByStatus[key as keyof typeof data.schedulesByStatus] ?? 0}
              />
            ))}
          </div>
        </section>

        {/* Indicadores */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Indicadores</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PieChartPending data={data?.pendingByClient ?? []} />
            <BarChartPendingTecnics data={data?.pendingByProvider ?? []} />
          </div>
        </section>

        {/* Evolução Mensal */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Evolução Mensal</h3>
          <EvolutionChart
            monthlyData={data?.evolutionByMonth ?? []}
            dailyData={data?.evolutionByDay ?? {}}
          />
        </section>

        {/* Report Diário */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Reporte de Serviços</h3>
          <ReportDailyChart
            data={reportDailyData?.reportDaily}
            isLoading={isLoadingReportDaily}
            onPeriodChange={handleReportPeriodChange}
          />
        </section>
      </CardContent>
    </Card>
  );
}

export default Reports;