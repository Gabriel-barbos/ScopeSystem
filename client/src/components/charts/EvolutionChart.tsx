"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CalendarDays, BarChart3 } from "lucide-react";
import type { EvolutionEntry, DayEntry } from "@/services/ReportService";


const SHOW_REMOVAL_SERIES = false;

// Configuração de cores para os tipos de serviço
const chartConfig = {
  installation: {
    label: "Instalação",
    color: "hsl(var(--chart-1))",
  },
  maintenance: {
    label: "Manutenção",
    color: "hsl(var(--chart-7))",
  },
  removal: {
    label: "Desinstalação",
    color: "hsl(var(--chart-10))",
  },
} satisfies ChartConfig;


function formatMonth(m: string) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [year, month] = m.split("-");
  return `${months[Number(month) - 1]} ${year.slice(2)}`;
}


function formatMonthFull(m: string) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const [year, month] = m.split("-");
  return `${months[Number(month) - 1]} de ${year}`;
}


function formatDayShort(d: string) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [year, month, day] = d.split("-");
  return `${day} ${months[Number(month) - 1]}`;
}

function formatDayFull(d: string) {
  const weekdays = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const [year, month, day] = d.split("-").map(Number);

  // Cria data local (sem conversão UTC)
  const date = new Date(year, month - 1, day);
  const weekday = weekdays[date.getDay()];

  return `${weekday}, ${day} de ${months[month - 1]}`;
}

interface Props {
  monthlyData: EvolutionEntry[];
  dailyData: Record<string, DayEntry[]>;
}

export function EvolutionChart({ monthlyData, dailyData }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);


  const [visibleSeries, setVisibleSeries] = useState({
    installation: true,
    maintenance: true,
    removal: SHOW_REMOVAL_SERIES,
  });

  const isMonthView = selectedMonth === null;

  // Dados transformados para o gráfico
  const currentData = useMemo(() => {
    if (isMonthView) {
      return monthlyData.map((d) => ({
        ...d,
        name: formatMonth(d.month),
        originalMonth: d.month,
      }));
    }
    return (dailyData[selectedMonth] ?? []).map((d) => ({
      ...d,
      name: formatDayShort(d.day),
      originalDay: d.day,
    }));
  }, [isMonthView, monthlyData, dailyData, selectedMonth]);

  // Cálculos de estatísticas
  const stats = useMemo(() => {
    if (currentData.length === 0) return null;

    const totalInstallation = currentData.reduce((acc, d) => acc + (d.installation || 0), 0);
    const totalMaintenance = currentData.reduce((acc, d) => acc + (d.maintenance || 0), 0);
    const totalRemoval = currentData.reduce((acc, d) => acc + (d.removal || 0), 0);
    const total = totalInstallation + totalMaintenance + totalRemoval;

    return {
      total,
      totalInstallation,
      totalMaintenance,
      totalRemoval,
    };
  }, [currentData]);

  // Lista de meses disponíveis para o select
  const availableMonths = useMemo(() => {
    return monthlyData
      .filter((m) => dailyData[m.month] && dailyData[m.month].length > 0)
      .map((m) => m.month);
  }, [monthlyData, dailyData]);

  // Handler para clique no gráfico mensal
  const handleChartClick = (data: any) => {
    if (!isMonthView || !data?.activePayload?.[0]?.payload?.originalMonth) return;
    const month = data.activePayload[0].payload.originalMonth;
    if (dailyData[month] && dailyData[month].length > 0) {
      setSelectedMonth(month);
    }
  };


  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  if (currentData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {isMonthView ? "Evolução Mensal de Serviços" : `Detalhamento — ${formatMonthFull(selectedMonth!)}`}
            </CardTitle>
            <CardDescription>
              {isMonthView
                ? "Acompanhe a evolução dos serviços ao longo dos meses"
                : "Visualização diária dos serviços realizados"}
            </CardDescription>
          </div>
          {!isMonthView && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setSelectedMonth(null)}
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Sem dados disponíveis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {isMonthView ? "Evolução Mensal de Serviços" : `Detalhamento — ${formatMonthFull(selectedMonth!)}`}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            {isMonthView ? (
              <>
                Clique em um ponto para ver o detalhamento diário
                {stats && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.total} serviços no período
                  </Badge>
                )}
              </>
            ) : (
              <>
                Visualização diária dos serviços realizados
                {stats && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.total} serviços no mês
                  </Badge>
                )}
              </>
            )}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {/* Select para navegar direto para um mês */}
          {isMonthView && availableMonths.length > 0 && (
            <Select
              value=""
              onValueChange={(value) => setSelectedMonth(value)}
            >
              <SelectTrigger className="w-[160px] rounded-lg">
                <SelectValue placeholder="Ir para mês..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month} className="rounded-lg">
                    {formatMonthFull(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Botão voltar no modo diário */}
          {!isMonthView && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setSelectedMonth(null)}
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar aos meses
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Gráfico */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart
            data={currentData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={isMonthView ? handleChartClick : undefined}
            style={{ cursor: isMonthView ? "pointer" : "default" }}
          >
            <defs>
              <linearGradient id="fillInstallation" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-installation)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-installation)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMaintenance" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-maintenance)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-maintenance)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              {SHOW_REMOVAL_SERIES && (
                <linearGradient id="fillRemoval" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-removal)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-removal)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              )}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={isMonthView ? 20 : 40}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />

            <ChartTooltip
              cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload?.[0]?.payload?.originalMonth) {
                      return formatMonthFull(payload[0].payload.originalMonth);
                    }
                    if (payload?.[0]?.payload?.originalDay) {
                      return formatDayFull(payload[0].payload.originalDay);
                    }
                    return value;
                  }}
                  formatter={(value, name) => {
                    const config = chartConfig[name as keyof typeof chartConfig];
                    return (
                      <div className="flex items-center justify-between gap-8">
                        <span>{config?.label || name}</span>
                        <span className="font-bold">{value}</span>
                      </div>
                    );
                  }}
                  indicator="dot"
                />
              }
            />

            {visibleSeries.installation && (
              <Area
                dataKey="installation"
                type="monotone"
                fill="url(#fillInstallation)"
                stroke="var(--color-installation)"
                strokeWidth={2}
                stackId="1"
              />
            )}

            {visibleSeries.maintenance && (
              <Area
                dataKey="maintenance"
                type="monotone"
                fill="url(#fillMaintenance)"
                stroke="var(--color-maintenance)"
                strokeWidth={2}
                stackId="1"
              />
            )}

            {visibleSeries.removal && SHOW_REMOVAL_SERIES && (
              <Area
                dataKey="removal"
                type="monotone"
                fill="url(#fillRemoval)"
                stroke="var(--color-removal)"
                strokeWidth={2}
                stackId="1"
              />
            )}

            <ChartLegend
              content={<ChartLegendContent />}
              className="mt-2"
            />
          </AreaChart>
        </ChartContainer>

        {isMonthView && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Clique em qualquer ponto do gráfico para ver o detalhamento diário do mês
          </p>
        )}
      </CardContent>
    </Card>
  );
}