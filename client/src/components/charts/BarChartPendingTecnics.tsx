import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from "recharts";
import { Trophy, Users, AlertCircle, ChevronDown, BarChart2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { PendingByProvider } from "@/services/ReportService";

// ─── Constantes 
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-10))",
];

const TOP_LIMIT = 10;
// Largura mínima por barra para garantir espaçamento legível
const MIN_BAR_WIDTH = 72;

interface Props {
  data: PendingByProvider[];
}

//  Tooltip customizado 
interface TooltipPayloadEntry {
  payload: {
    name: string;
    pending: number;
    fill: string;
    rank: number;
  };
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  totalPendencias: number;
}

function CustomTooltip({ active, payload, totalPendencias }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const { name, pending, fill, rank } = payload[0].payload;
  const pct = totalPendencias > 0
    ? ((pending / totalPendencias) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="rounded-xl border bg-popover px-3.5 py-3 shadow-lg text-sm min-w-[160px]">
      {/* Nome + rank */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: fill }} />
        <span className="font-semibold truncate max-w-[140px]">{name}</span>
        {rank === 1 && (
          <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        )}
      </div>

      <Separator className="mb-2" />

      {/* Pendências */}
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">Pendências</span>
        <span className="font-bold text-base tabular-nums">{pending}</span>
      </div>

      {/* % do total */}
      <div className="flex items-baseline justify-between gap-4 mt-0.5">
        <span className="text-muted-foreground">% do total</span>
        <span className="font-medium tabular-nums text-xs">{pct}%</span>
      </div>
    </div>
  );
}

//  Componente Principal 
export function BarChartPendingTecnics({ data }: Props) {
  const [showAll, setShowAll] = useState(false);

  // Ordena sempre do maior para o menor para facilitar leitura
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.pending - a.pending),
    [data]
  );

  const hasMore = sortedData.length > TOP_LIMIT;

  // Dados exibidos no momento (top 10 ou todos)
  const visibleData = useMemo(
    () => (showAll ? sortedData : sortedData.slice(0, TOP_LIMIT)),
    [sortedData, showAll]
  );

  // Formata para o recharts, adicionando rank para destaque
  const chartData = useMemo(
    () =>
      visibleData.map((d, index) => ({
        name: d.provider,
        pending: d.pending,
        fill: CHART_COLORS[index % CHART_COLORS.length],
        // rank mantém a posição original mesmo na view "todos"
        rank: sortedData.findIndex((s) => s.provider === d.provider) + 1,
      })),
    [visibleData, sortedData]
  );

  const chartConfig = useMemo(
    () =>
      ({
        pending: { label: "Pendências" },
        ...Object.fromEntries(
          data.map((d, index) => [
            d.provider.toLowerCase().replace(/\s+/g, "-"),
            {
              label: d.provider,
              color: CHART_COLORS[index % CHART_COLORS.length],
            },
          ])
        ),
      } satisfies ChartConfig),
    [data]
  );

  const totalPendencias = useMemo(
    () => data.reduce((acc, curr) => acc + curr.pending, 0),
    [data]
  );

  const topProvider = sortedData[0] ?? null;

  // Largura total do SVG — 
  const chartMinWidth = visibleData.length * MIN_BAR_WIDTH;

  //  Empty state 
  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pendências por Prestador</CardTitle>
          <CardDescription>Distribuição de pendências por técnico</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[260px] items-center justify-center rounded-lg border border-dashed mx-6 mb-6">
          <div className="text-center space-y-1.5">
            <BarChart2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">
              Sem dados disponíveis
            </p>
            <p className="text-xs text-muted-foreground/70">
              Nenhuma pendência registrada no momento
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Render
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Pendências por Prestador</CardTitle>
            <CardDescription className="mt-0.5">
              Distribuição de pendências por técnico
            </CardDescription>
          </div>

          {/* Badges de resumo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              {totalPendencias} pendência{totalPendencias !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <Users className="h-3 w-3" />
              {data.length} prestador{data.length !== 1 ? "es" : ""}
            </Badge>
          </div>
        </div>

        {/* Destaque do top prestador */}
        {topProvider && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>
              Maior pendência:{" "}
              <span className="font-semibold text-foreground">
                {topProvider.provider}
              </span>{" "}
              com{" "}
              <span className="font-semibold text-foreground">
                {topProvider.pending}
              </span>{" "}
              pendência{topProvider.pending !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* ── Toggle Top10 / Todos  */}
        {hasMore && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {showAll
                ? `Exibindo todos os ${sortedData.length} prestadores`
                : `Exibindo top ${TOP_LIMIT} de ${sortedData.length} prestadores`}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setShowAll((prev) => !prev)}
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  showAll ? "rotate-180" : ""
                }`}
              />
              {showAll ? "Ver top 10" : `Ver todos (${sortedData.length})`}
            </Button>
          </div>
        )}

        {/*
         * ── Scroll horizontal 
         * O wrapper com overflow-x-auto permite scroll quando há muitos
         * prestadores, e o ChartContainer respeita a largura mínima calculada.
         */}
        <div className="overflow-x-auto rounded-lg">
          <ChartContainer
            config={chartConfig}
            style={{
              height: 260,
              minWidth: chartMinWidth,
              width: "100%",
            }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 24, right: 12, left: -8, bottom: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // Sem rotação — o scroll horizontal resolve o espaço
                angle={0}
                textAnchor="middle"
                height={36}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={0}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.slice(0, 10)}…` : value
                }
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
                content={
                  <CustomTooltip totalPendencias={totalPendencias} />
                }
              />

              <Bar dataKey="pending" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {/* Label do valor acima da barra */}
                <LabelList
                  dataKey="pending"
                  position="top"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: "hsl(var(--foreground))",
                  }}
                />

                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    // Barra do topo com leve opacidade extra para destaque
                    opacity={entry.rank === 1 ? 1 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* ── Legenda manual com scroll */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="truncate max-w-[120px]">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default BarChartPendingTecnics;