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
  BadgeX  
} from "lucide-react";
import { ExportButton } from "@/components/reports/ExportButton";
import { ClientFilter } from "@/components/reports/ClientFilter";
import { ReportsDateRangeFilter } from "@/components/reports/ReportsDataRangeFilter";
import { Statistic } from "antd";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { PieChartPending } from "@/components/charts/PieChartPending";
import { BarChartPendingTecnics } from "@/components/charts/BarChartPendingTecnics";
const mockData = {
  agendamentos: { pendentes: 24, cancelados: 8, concluidos: 156 },
  servicos: { instalacoes: 89, manutencoes: 45, desinstalacoes: 22 },
};

const statsConfig = {
  agendamentos: [
    { key: "pendentes", title: "Pendentes", icon: Clock, color: "#faad14" },
    { key: "cancelados", title: "Cancelados", icon: XCircle, color: "#ff4d4f" },
    { key: "concluidos", title: "Concluídos", icon: CheckCircle, color: "#52c41a" },
  ],
  servicos: [
    { key: "instalacoes", title: "Instalações", icon: Wrench, color: "#1890ff" },
    { key: "manutencoes", title: "Manutenções", icon: Settings, color: "#722ed1" },
    { key: "desinstalacoes", title: "Desinstalações", icon: BadgeX, color: "#bd5215" },
  ],
};

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

function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [clientId, setClientId] = useState<string | null>(null);

  const exportSchedules = async () => {};
  const exportServices = async () => {};

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
              onExportSchedules={exportSchedules}
              onExportServices={exportServices}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        
        {/* Serviços */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Serviços</h3>
          <div className="grid grid-cols-3 gap-4">
            {statsConfig.servicos.map(({ key, ...props }) => (
              <StatCard
                key={key}
                {...props}
                value={mockData.servicos[key as keyof typeof mockData.servicos]}
              />
            ))}
          </div>
        </div>

        {/* Agendamentos */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Agendamentos</h3>
          <div className="grid grid-cols-3 gap-4">
            {statsConfig.agendamentos.map(({ key, ...props }) => (
              <StatCard
                key={key}
                {...props}
                value={mockData.agendamentos[key as keyof typeof mockData.agendamentos]}
              />
            ))}
          </div>
        </div>
{/* Gráficos */}
<div className="space-y-3">
  <h3 className="text-lg font-semibold">Indicadores</h3>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <PieChartPending />
    <BarChartPendingTecnics />
    {/* futuros gráficos */}
    {/* <AnotherChart /> */}
    {/* <AnotherChart /> */}
  </div>
</div>
      </CardContent>
    </Card>
  );
}

export default Reports;