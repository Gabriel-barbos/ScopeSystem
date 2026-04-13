import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import type { ReportDaily } from "@/services/ReportService";

export type PeriodType = "today" | "yesterday" | "week" | "month" | "year";

interface Props {
  data?: ReportDaily;
  isLoading?: boolean;
  onPeriodChange?: (period: PeriodType) => void;
}

const defaultData: ReportDaily = {
  totals: { installation: 0, maintenance: 0, removal: 0, total: 0 },
  clients: [],
};

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

const periodLabels: Record<PeriodType, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  week: "Esta Semana",
  month: "Este Mês",
  year: "Este Ano",
};

//Totals config para evitar repetição 
const totalCards = [
  {
    key: "total" as const,
    label: "Total",
    colorVar: undefined,
    gradient: "from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-900/40",
    border: "border-slate-200 dark:border-slate-700/50",
  },
  {
    key: "installation" as const,
    label: "Instalações",
    colorVar: "hsl(var(--chart-1))",
    gradient: "from-blue-50 to-sky-50/50 dark:from-blue-950/50 dark:to-sky-950/30",
    border: "border-blue-100 dark:border-blue-900/50",
  },
  {
    key: "maintenance" as const,
    label: "Manutenções",
    colorVar: "hsl(var(--chart-7))",
    gradient: "from-amber-50 to-yellow-50/50 dark:from-amber-950/50 dark:to-yellow-950/30",
    border: "border-amber-100 dark:border-amber-900/50",
  },
  {
    key: "removal" as const,
    label: "Desinstalações",
    colorVar: "hsl(var(--chart-10))",
    gradient: "from-rose-50 to-red-50/50 dark:from-rose-950/50 dark:to-red-950/30",
    border: "border-rose-100 dark:border-rose-900/50",
  },
];

// Componente Principal
export function ReportDailyChart({ data, isLoading = false, onPeriodChange }: Props) {
  const { totals, clients } = data ?? defaultData;

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("today");
  const [showDetails, setShowDetails] = useState(false);
  const [showAllClients, setShowAllClients] = useState(false);

  const displayedClients = useMemo(() => {
    return showAllClients ? clients : clients.slice(0, 10);
  }, [clients, showAllClients]);

  const hasMoreClients = clients.length > 10;

  // Barra com largura máxima para evitar barras excessivamente largas
  const barSize = useMemo(() => {
    const count = displayedClients.length;
    if (count <= 2) return 40;
    if (count <= 5) return 52;
    return undefined;
  }, [displayedClients]);

  // Altura do gráfico proporcional à quantidade de dados
  const chartHeight = useMemo(() => {
    const count = displayedClients.length;
    if (count <= 3) return 260;
    if (count <= 7) return 320;
    return 380;
  }, [displayedClients]);

  const handlePeriodChange = (value: PeriodType) => {
    setSelectedPeriod(value);
    setShowAllClients(false);
    onPeriodChange?.(value);
  };

  const periodDescription = useMemo(() => {
    const today = new Date();
    const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
      d.toLocaleDateString("pt-BR", opts);
    const full: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };

    switch (selectedPeriod) {
      case "today":
        return fmt(today, full);
      case "yesterday": {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return fmt(y, full);
      }
      case "week":
        return "Semana atual";
      case "month":
        return fmt(today, { month: "long", year: "numeric" });
      case "year":
        return today.getFullYear().toString();
      default:
        return "";
    }
  }, [selectedPeriod]);

  // Loading
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Separator />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // Render
  return (
    <Card className="w-full">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardDescription className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {periodDescription}
        </CardDescription>

        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(periodLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Totais */}
        <TotalsSection totals={totals} />

        <Separator />

        {/* Gráfico */}
        <ChartSection
          clients={clients}
          displayedClients={displayedClients}
          hasMoreClients={hasMoreClients}
          showAllClients={showAllClients}
          onShowAll={() => setShowAllClients(true)}
          barSize={barSize}
          chartHeight={chartHeight}
        />
      </CardContent>

      {/* Detalhes */}
      {clients.length > 0 && (
        <DetailsSection
          clients={clients}
          totals={totals}
          showDetails={showDetails}
          onToggle={setShowDetails}
        />
      )}
    </Card>
  );
}

// TotalsSection
interface TotalsSectionProps {
  totals: ReportDaily["totals"];
}

function TotalsSection({ totals }: TotalsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {totalCards.map(({ key, label, colorVar, gradient, border }) => (
        <TotalCard
          key={key}
          label={label}
          value={totals[key]}
          colorVar={colorVar}
          gradient={gradient}
          border={border}
        />
      ))}
    </div>
  );
}

// TotalCard
interface TotalCardProps {
  label: string;
  value: number;
  colorVar?: string;
  gradient: string;
  border: string;
}

function TotalCard({ label, value, colorVar, gradient, border }: TotalCardProps) {
  const isEmpty = value === 0;

  return (
    <div
      className={`
        relative rounded-xl border p-3 text-center
        bg-gradient-to-br ${gradient} ${border}
        transition-opacity duration-200
        ${isEmpty ? "opacity-50" : "opacity-100"}
      `}
    >
      <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-1.5 tabular-nums"
        style={colorVar ? { color: colorVar } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

// ChartSection
interface ChartSectionProps {
  clients: ReportDaily["clients"];
  displayedClients: ReportDaily["clients"];
  hasMoreClients: boolean;
  showAllClients: boolean;
  onShowAll: () => void;
  barSize?: number;
  chartHeight: number;
}

function ChartSection({
  clients,
  displayedClients,
  hasMoreClients,
  showAllClients,
  onShowAll,
  barSize,
  chartHeight,
}: ChartSectionProps) {
  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/20 h-[260px]">
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Sem serviços realizados
          </p>
          <p className="text-xs text-muted-foreground/70">
            Nenhum dado disponível para este período
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ChartContainer
        config={chartConfig}
        style={{ height: chartHeight }}
        className="w-full transition-all duration-300"
      >
        <BarChart
          accessibilityLayer
          data={displayedClients}
          barSize={barSize}
          margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
        >
          {/* Grade com opacidade reduzida para visual mais limpo */}
          <CartesianGrid
            vertical={false}
            strokeDasharray="4 4"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="client"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
            angle={-35}
            textAnchor="end"
            height={72}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            allowDecimals={false}
            width={28}
          />

          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.25, radius: 4 }}
            content={<ChartTooltipContent indicator="dot" />}
          />

          <ChartLegend content={<ChartLegendContent />} />

          {/* Barra inferior — arredondada embaixo */}
          <Bar
            dataKey="installation"
            stackId="services"
            fill="var(--color-installation)"
            radius={[0, 0, 6, 6]}
          />

          {/* Barra do meio — sem radius */}
          <Bar
            dataKey="maintenance"
            stackId="services"
            fill="var(--color-maintenance)"
            radius={[0, 0, 0, 0]}
          />

          {/* Barra superior */}
          <Bar
            dataKey="removal"
            stackId="services"
            fill="var(--color-removal)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ChartContainer>

      {/* Botão "ver mais clientes" */}
      {hasMoreClients && !showAllClients && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowAll}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            +{clients.length - 10} clientes não exibidos
          </Button>
        </div>
      )}
    </div>
  );
}

// DetailsSection
interface DetailsSectionProps {
  clients: ReportDaily["clients"];
  totals: ReportDaily["totals"];
  showDetails: boolean;
  onToggle: (v: boolean) => void;
}

function DetailsSection({ clients, totals, showDetails, onToggle }: DetailsSectionProps) {
  return (
    <CardFooter className="flex-col items-stretch gap-2 pt-0">
      <Collapsible open={showDetails} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar Detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver Detalhes
              </>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="rounded-xl border overflow-hidden">
            {/* Cabeçalho */}
            <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
              <span>Cliente</span>
              <span className="text-right">Total</span>
            </div>

            {/* Linhas */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
              {clients.map((client, index) => (
                <ClientDetailRow
                  key={client.client}
                  client={client}
                  index={index}
                  grandTotal={totals.total}
                />
              ))}
            </div>

            {/* Rodapé */}
            <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-muted/50 text-sm font-bold border-t">
              <span>Total Geral</span>
              <span className="text-right tabular-nums">{totals.total}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </CardFooter>
  );
}

// ClientDetailRow
interface ClientDetailRowProps {
  client: {
    client: string;
    installation: number;
    maintenance: number;
    removal: number;
  };
  index: number;
  grandTotal: number;
}

// Mapeamento centralizado para evitar cores dessincronizadas
const serviceConfig = [
  { key: "installation" as const, label: "Instalação",    color: "hsl(var(--chart-1))"  },
  { key: "maintenance" as const, label: "Manutenção",     color: "hsl(var(--chart-7))"  },
  { key: "removal"     as const, label: "Desinstalação",  color: "hsl(var(--chart-10))" },
];

function ClientDetailRow({ client, index, grandTotal }: ClientDetailRowProps) {
  const total = client.installation + client.maintenance + client.removal;
  const [expanded, setExpanded] = useState(false);

  // Percentual deste cliente em relação ao total geral
  const percentage = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;

  return (
    <div className={index % 2 === 0 ? "bg-background" : "bg-muted/10"}>
      {/* Linha principal */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
        className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
          <span className="text-sm font-medium truncate">{client.client}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini barra de progresso proporcional */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground/30 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">
              {percentage}%
            </span>
          </div>

          <span className="text-sm font-bold tabular-nums w-6 text-right">{total}</span>
        </div>
      </div>

      {/* Serviços expandidos */}
      {expanded && (
        <div className="px-4 pb-3 pl-9 space-y-2">
          {serviceConfig.map(({ key, label, color }) => {
            const val = client[key];
            if (val === 0) return null;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return (
              <DetailServiceRow
                key={key}
                label={label}
                value={val}
                color={color}
                percentage={pct}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// DetailServiceRow
interface DetailServiceRowProps {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

function DetailServiceRow({ label, value, color, percentage }: DetailServiceRowProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      {/* Indicador colorido */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />

      <span className="flex-1">{label}</span>

      {/* Barra proporcional dentro do serviço */}
      <div className="hidden sm:flex items-center gap-1.5">
        <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs w-7 text-right tabular-nums">{percentage}%</span>
      </div>

      <span className="font-medium tabular-nums w-4 text-right">{value}</span>
    </div>
  );
}

export default ReportDailyChart;