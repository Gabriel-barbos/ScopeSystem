
import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wrench,
  Download,
  Trash2,
} from "lucide-react";

export interface ServiceEvolutionEntry {
  period: string; // formato: "YYYY-MM" ou "YYYY"
  installation: number;
  maintenance: number;
  removal: number;
}

type ServiceKey = "installation" | "maintenance" | "removal";

interface InstallationEvolutionProps {
  /** Dados vindos da API. Se não informado, usa dados mockados. */
  data?: ServiceEvolutionEntry[];
  /** Loading externo (ex.: react-query) */
  isLoading?: boolean;
}


const MOCK_DATA: ServiceEvolutionEntry[] = [
  // 2024
  { period: "2024-01", installation: 85, maintenance: 4, removal: 2 },
  { period: "2024-02", installation: 90, maintenance: 4, removal: 2 },
  { period: "2024-03", installation: 92, maintenance: 4, removal: 2 },
  { period: "2024-04", installation: 95, maintenance: 5, removal: 2 },
  { period: "2024-05", installation: 100, maintenance: 5, removal: 2 },
  { period: "2024-06", installation: 102, maintenance: 5, removal: 2 },
  { period: "2024-07", installation: 105, maintenance: 5, removal: 2 },
  { period: "2024-08", installation: 108, maintenance: 5, removal: 2 },
  { period: "2024-09", installation: 110, maintenance: 5, removal: 2 },
  { period: "2024-10", installation: 112, maintenance: 5, removal: 2 },
  { period: "2024-11", installation: 115, maintenance: 5, removal: 2 },
  { period: "2024-12", installation: 86, maintenance: 4, removal: 2 },
  // 2025
  { period: "2025-01", installation: 120, maintenance: 7, removal: 3 },
  { period: "2025-02", installation: 130, maintenance: 7, removal: 3 },
  { period: "2025-03", installation: 140, maintenance: 7, removal: 3 },
  { period: "2025-04", installation: 145, maintenance: 7, removal: 3 },
  { period: "2025-05", installation: 155, maintenance: 17, removal: 3 },
  { period: "2025-06", installation: 158, maintenance: 22, removal: 3 },
  { period: "2025-07", installation: 165, maintenance: 43, removal: 3 },
  { period: "2025-08", installation: 162, maintenance: 7, removal: 3 },
  { period: "2025-09", installation: 175, maintenance: 7, removal: 3 },
  { period: "2025-10", installation: 180, maintenance: 7, removal: 3 },
  { period: "2025-11", installation: 185, maintenance: 7, removal: 3 },
  { period: "2025-12", installation: 85, maintenance: 7, removal: 3 },
  // 2026
  { period: "2026-01", installation: 200, maintenance: 9, removal: 4 },
  { period: "2026-02", installation: 215, maintenance: 10, removal: 14 },
  { period: "2026-03", installation: 230, maintenance: 10, removal: 36 },
  { period: "2026-04", installation: 240, maintenance: 10, removal: 45 },
];

// =============================================================================
// CONFIG
// =============================================================================

const chartConfig = {
  installation: {
    label: "Instalação",
    color: "hsl(var(--chart-1))",
    icon: Download,
  },
  maintenance: {
    label: "Manutenção",
    color: "hsl(var(--chart-7))",
    icon: Wrench,
  },
  removal: {
    label: "Remoção",
    color: "hsl(var(--chart-4))",
    icon: Trash2,
  },
} satisfies ChartConfig;

const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// =============================================================================
// HELPERS
// =============================================================================

function getYearFromPeriod(period: string): string {
  return period.split("-")[0];
}

function getMonthFromPeriod(period: string): string {
  return period.split("-")[1];
}

function formatMonthShort(period: string): string {
  const [year, month] = period.split("-");
  return `${MONTHS_SHORT[Number(month) - 1]}/${year.slice(2)}`;
}

function formatMonthFull(period: string): string {
  const [year, month] = period.split("-");
  return `${MONTHS_FULL[Number(month) - 1]} de ${year}`;
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function InstallationEvolution({
  data = MOCK_DATA,
  isLoading = false,
}: InstallationEvolutionProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Anos disponíveis (extraídos dos dados)
  const availableYears = useMemo(() => {
    const years = new Set(data.map((d) => getYearFromPeriod(d.period)));
    return Array.from(years).sort();
  }, [data]);

  // Aplicar filtros
  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const year = getYearFromPeriod(entry.period);
      const month = getMonthFromPeriod(entry.period);

      if (selectedYear !== "all" && year !== selectedYear) return false;
      if (selectedMonth !== "all" && month !== selectedMonth) return false;

      return true;
    });
  }, [data, selectedYear, selectedMonth]);

  // Dados formatados para o gráfico
  const chartData = useMemo(() => {
    return filteredData.map((entry) => ({
      ...entry,
      label: formatMonthShort(entry.period),
    }));
  }, [filteredData]);

  // Estatísticas e tendências
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const totals = filteredData.reduce(
      (acc, d) => ({
        installation: acc.installation + d.installation,
        maintenance: acc.maintenance + d.maintenance,
        removal: acc.removal + d.removal,
      }),
      { installation: 0, maintenance: 0, removal: 0 }
    );

    const total = totals.installation + totals.maintenance + totals.removal;

    // Calcula tendência comparando primeira metade vs segunda metade
    let trend = 0;
    if (filteredData.length >= 2) {
      const half = Math.floor(filteredData.length / 2);
      const firstHalf = filteredData.slice(0, half);
      const secondHalf = filteredData.slice(half);

      const sumFirst = firstHalf.reduce(
        (acc, d) => acc + d.installation + d.maintenance + d.removal, 0
      );
      const sumSecond = secondHalf.reduce(
        (acc, d) => acc + d.installation + d.maintenance + d.removal, 0
      );

      const avgFirst = sumFirst / firstHalf.length;
      const avgSecond = sumSecond / secondHalf.length;

      trend = calculateTrend(avgSecond, avgFirst);
    }

    return { ...totals, total, trend };
  }, [filteredData]);

 
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Evolução de Serviços
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            Acompanhamento mensal de instalações, manutenções e remoções
            {stats && (
              <Badge variant="secondary" className="font-medium">
                {stats.total.toLocaleString("pt-BR")} serviços
              </Badge>
            )}
          </CardDescription>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 border-t px-6 py-4 sm:border-l sm:border-t-0 sm:py-6">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[130px] rounded-lg" aria-label="Filtrar por ano">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todos os anos
              </SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year} className="rounded-lg">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] rounded-lg" aria-label="Filtrar por mês">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todos os meses
              </SelectItem>
              {MONTHS_FULL.map((month, idx) => {
                const value = String(idx + 1).padStart(2, "0");
                return (
                  <SelectItem key={value} value={value} className="rounded-lg">
                    {month}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* KPIs por categoria */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(Object.keys(chartConfig) as ServiceKey[]).map((key) => {
              const Icon = chartConfig[key].icon;
              const value = stats[key];
              const percentage = stats.total > 0 ? (value / stats.total) * 100 : 0;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${chartConfig[key].color}20`,
                      color: chartConfig[key].color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {chartConfig[key].label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold tracking-tight">
                        {value.toLocaleString("pt-BR")}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Gráfico */}
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <Activity className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum dado encontrado para os filtros aplicados
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[320px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                {(Object.keys(chartConfig) as ServiceKey[]).map((key) => (
                  <linearGradient
                    key={key}
                    id={`fill-${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${key})`}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
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
                cursor={{
                  stroke: "hsl(var(--muted-foreground))",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const period = payload?.[0]?.payload?.period;
                      return period ? formatMonthFull(period) : "";
                    }}
                    formatter={(value, name) => {
                      const config = chartConfig[name as ServiceKey];
                      return (
                        <div className="flex w-full items-center justify-between gap-6">
                          <span className="text-muted-foreground">
                            {config?.label || name}
                          </span>
                          <span className="font-mono font-semibold tabular-nums">
                            {Number(value).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      );
                    }}
                    indicator="dot"
                  />
                }
              />

              <Area
                dataKey="installation"
                type="monotone"
                fill="url(#fill-installation)"
                stroke="var(--color-installation)"
                strokeWidth={2}
                stackId="services"
              />
              <Area
                dataKey="maintenance"
                type="monotone"
                fill="url(#fill-maintenance)"
                stroke="var(--color-maintenance)"
                strokeWidth={2}
                stackId="services"
              />
              <Area
                dataKey="removal"
                type="monotone"
                fill="url(#fill-removal)"
                stroke="var(--color-removal)"
                strokeWidth={2}
                stackId="services"
              />

              <ChartLegend content={<ChartLegendContent />} className="mt-2" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>

 
      
    </Card>
  );
}