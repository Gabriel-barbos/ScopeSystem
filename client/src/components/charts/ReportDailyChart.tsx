"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";

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

// Tipos de período disponíveis
export type PeriodType = "today" | "yesterday" | "week" | "month" | "year";

interface Props {
  data?: ReportDaily;
  isLoading?: boolean;
  onPeriodChange?: (period: PeriodType) => void;
}

// Dados padrão quando não há dados
const defaultData: ReportDaily = {
  totals: { installation: 0, maintenance: 0, removal: 0, total: 0 },
  clients: [],
};

// Configuração do gráfico com as cores CSS customizadas
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

// Labels dos períodos
const periodLabels: Record<PeriodType, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  week: "Esta Semana",
  month: "Este Mês",
  year: "Este Ano",
};

export function ReportDailyChart({ data, isLoading = false, onPeriodChange }: Props) {
  // Usa dados padrão se data for undefined
  const { totals, clients } = data ?? defaultData;
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("today");
  const [showDetails, setShowDetails] = useState(false);
  const [showAllClients, setShowAllClients] = useState(false);

  // Limita para 10 clientes no gráfico
  const displayedClients = useMemo(() => {
    if (showAllClients) return clients;
    return clients.slice(0, 10);
  }, [clients, showAllClients]);

  const hasMoreClients = clients.length > 10;

  // Manipula mudança de período
  const handlePeriodChange = (value: PeriodType) => {
    setSelectedPeriod(value);
    setShowAllClients(false); 
    onPeriodChange?.(value);
  };

  // Obtém descrição do período atual
  const getPeriodDescription = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    switch (selectedPeriod) {
      case "today":
        return today.toLocaleDateString("pt-BR", options);
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toLocaleDateString("pt-BR", options);
      case "week":
        return `Semana atual`;
      case "month":
        return today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      case "year":
        return today.getFullYear().toString();
      default:
        return "";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Separator />
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="flex items-center gap-1 mt-1">
            <Calendar className="h-3.5 w-3.5" />
            {getPeriodDescription()}
          </CardDescription>
        </div>

        {/* Seletor de Período */}
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
        {/* Cards de Totais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TotalCard
            label="Total"
            value={totals.total}
            className="bg-muted/50"
          />
          <TotalCard
            label="Instalações"
            value={totals.installation}
            color="hsl(var(--chart-1))"
            className="bg-blue-50 dark:bg-blue-950/30"
          />
          <TotalCard
            label="Manutenções"
            value={totals.maintenance}
            color="hsl(var(--chart-7))"
            className="bg-yellow-400/30 dark:bg-yellow-600/20"
          />
          <TotalCard
            label="Desinstalações"
            value={totals.removal}
            color="hsl(var(--chart-10))"
            className="bg-red-50 dark:bg-red-950/30"
          />
        </div>

        <Separator />

        {/* Gráfico */}
        {clients.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground rounded-lg border border-dashed">
            <div className="text-center">
              <p className="font-medium">Sem serviços realizados</p>
              <p className="text-xs mt-1">Nenhum dado disponível para este período</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={displayedClients}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="client"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  value.length > 12 ? `${value.slice(0, 12)}...` : value
                }
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="installation"
                stackId="services"
                fill="var(--color-installation)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="maintenance"
                stackId="services"
                fill="var(--color-maintenance)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="removal"
                stackId="services"
                fill="var(--color-removal)"
                radius={[0, 0, 4, 4]}
              />
            </BarChart>
          </ChartContainer>
        )}

        {/* Indicador de mais clientes */}
        {hasMoreClients && !showAllClients && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllClients(true)}
              className="text-xs text-muted-foreground"
            >
              +{clients.length - 10} clientes não exibidos no gráfico
            </Button>
          </div>
        )}
      </CardContent>

      {/* Seção de Detalhes Expansível */}
      {clients.length > 0 && (
        <CardFooter className="flex-col items-stretch gap-2 pt-0">
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                {showDetails ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Ocultar Detalhes
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              <div className="rounded-lg border">
                {/* Header da Tabela */}
                <div className="grid grid-cols-[1fr_auto] gap-4 p-3 bg-muted/50 font-semibold text-sm border-b">
                  <span>Cliente</span>
                  <span className="text-right">Total de Serviços</span>
                </div>

                {/* Lista de Clientes */}
                <div className="max-h-[400px] overflow-y-auto">
                  {clients.map((client, index) => (
                    <ClientDetailRow key={client.client} client={client} index={index} />
                  ))}
                </div>

                {/* Footer com Total */}
                <div className="grid grid-cols-[1fr_auto] gap-4 p-3 bg-muted/50 font-bold text-sm border-t">
                  <span>Total Geral</span>
                  <span className="text-right">{totals.total}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      )}
    </Card>
  );
}

// Componente auxiliar para os cards de totais
interface TotalCardProps {
  label: string;
  value: number;
  color?: string;
  className?: string;
}

function TotalCard({ label, value, color, className }: TotalCardProps) {
  return (
    <div className={`rounded-lg p-3 text-center transition-colors ${className}`}>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p
        className="text-2xl font-bold mt-1"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}


interface ClientDetailRowProps {
  client: {
    client: string;
    installation: number;
    maintenance: number;
    removal: number;
  };
  index: number;
}

function ClientDetailRow({ client, index }: ClientDetailRowProps) {
  const total = client.installation + client.maintenance + client.removal;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
      {/* Linha Principal do Cliente */}
      <div
        className="grid grid-cols-[1fr_auto] gap-4 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
          <span className="font-semibold text-sm">{client.client}</span>
        </div>
        <span className="text-right font-bold">{total}</span>
      </div>

      {/* Detalhes Expandidos */}
      {expanded && (
        <div className="pb-3 px-3 pl-9 space-y-1">
          {client.installation > 0 && (
            <DetailServiceRow
              label="Instalação"
              value={client.installation}
              color="hsl(var(--chart-1))"
            />
          )}
          {client.maintenance > 0 && (
            <DetailServiceRow
              label="Manutenção"
              value={client.maintenance}
              color="hsl(var(--chart-2))"
            />
          )}
          {client.removal > 0 && (
            <DetailServiceRow
              label="Desinstalação"
              value={client.removal}
              color="hsl(var(--chart-5))"
            />
          )}
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para linha de serviço no detalhe
interface DetailServiceRowProps {
  label: string;
  value: number;
  color: string;
}

function DetailServiceRow({ label, value, color }: DetailServiceRowProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
      </div>
      <span>{value}</span>
    </div>
  );
}

export default ReportDailyChart;