"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, LayoutList, Trophy } from "lucide-react";
import type { PendingByClient } from "@/services/ReportService";

// ─── Constantes ───────────────────────────────────────────────
const TOP_N = 10;
const BAR_WIDTH = 48;
const CHART_HEIGHT = 240;
const BOTTOM_MARGIN = 52;

const BAR_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(235, 78%, 57%)",
  "hsl(248, 74%, 58%)",
  "hsl(258, 72%, 57%)",
  "hsl(265, 70%, 56%)",
  "hsl(272, 68%, 55%)",
  "hsl(280, 65%, 54%)",
  "hsl(290, 62%, 53%)",
  "hsl(300, 58%, 54%)",
  "hsl(310, 55%, 55%)",
];

const chartConfig = {
  total: { label: "Pendências" },
} satisfies ChartConfig;

interface Props {
  data: PendingByClient[];
}

// ─── Tick rotacionado ─────────────────────────────────────────
function RotatedTick({ x, y, payload }: any) {
  const label: string = payload.value;
  const truncated = label.length > 14 ? `${label.slice(0, 14)}…` : label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        transform="rotate(-40)"
        fontSize={11}
        fill="hsl(var(--muted-foreground))"
      >
        {truncated}
      </text>
    </g>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = ((item.value / total) * 100).toFixed(1);

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm min-w-[160px]">
      <p className="font-semibold text-foreground mb-1 truncate max-w-[200px]">
        {item.payload.client}
      </p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground text-xs">Pendências</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold">{item.value}</span>
          <span className="text-[11px] bg-muted text-muted-foreground rounded px-1 py-0.5">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Gráfico ──────────────────────────────────────────────────
function VerticalBarChart({
  data,
  total,
  scrollable = false,
}: {
  data: PendingByClient[];
  total: number;
  scrollable?: boolean;
}) {
  const minWidth = scrollable
    ? Math.max(data.length * BAR_WIDTH + 80, 500)
    : "100%";

  return (
    <div className={scrollable ? "overflow-x-auto pb-1" : "w-full"}>
      <div style={{ width: minWidth, height: CHART_HEIGHT + BOTTOM_MARGIN }}>
        <ChartContainer
          config={chartConfig}
          style={{ width: "100%", height: "100%" }}
        >
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: BOTTOM_MARGIN }}
            barSize={scrollable ? 28 : undefined}
            barCategoryGap="30%"
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis
              dataKey="client"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={<RotatedTick />}
              height={BOTTOM_MARGIN}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickCount={5}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: 4 }}
              content={(props: any) => (
                <CustomTooltip
                  active={props.active}
                  payload={props.payload}
                  total={total}
                />
              )}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.client}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

// ─── Principal ────────────────────────────────────────────────
export function PieChartPending({ data }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.total - a.total),
    [data]
  );

  const top10 = useMemo(() => sorted.slice(0, TOP_N), [sorted]);

  const filtered = useMemo(
    () =>
      sorted.filter((d) =>
        d.client.toLowerCase().includes(search.toLowerCase())
      ),
    [sorted, search]
  );

  const totalPendencias = useMemo(
    () => data.reduce((acc, c) => acc + c.total, 0),
    [data]
  );

  // ── Empty state
  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Pendências por Cliente</CardTitle>
          <CardDescription>Distribuição de pendências por cliente</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
          <AlertCircle className="h-8 w-8 opacity-30" />
          <p className="text-sm">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      {/* ── Header ── */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">
              Pendências por Cliente
            </CardTitle>
            <CardDescription className="mt-0.5">
              Total de{" "}
              <span className="font-medium text-foreground">
                {totalPendencias}
              </span>{" "}
              pendências · {data.length} clientes
            </CardDescription>
          </div>

          {/* Botão discreto de alternância */}
          <button
            onClick={() => {
              setShowAll((v) => !v);
              setSearch("");
            }}
            className="
              flex items-center gap-1.5 shrink-0
              rounded-full border border-border
              px-2.5 py-1 text-[11px] font-medium
              text-muted-foreground
              hover:text-foreground hover:border-foreground/30
              hover:bg-muted/50
              transition-all duration-150
            "
          >
            {showAll ? (
              <>
                <Trophy className="h-3 w-3" />
                Top {TOP_N}
              </>
            ) : (
              <>
                <LayoutList className="h-3 w-3" />
                Todos
                <Badge
                  variant="secondary"
                  className="text-[10px] h-3.5 px-1 ml-0.5"
                >
                  {data.length}
                </Badge>
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {/* ── Top 10 ── */}
        {!showAll && (
          <>
            <VerticalBarChart data={top10} total={totalPendencias} />
            {data.length > TOP_N && (
              <p className="text-center text-[11px] text-muted-foreground leading-none">
                +{data.length - TOP_N} clientes não exibidos
              </p>
            )}
          </>
        )}

        {/* ── Todos ── */}
        {showAll && (
          <>
            {/* Busca */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <Search className="h-6 w-6 opacity-30" />
                <p className="text-sm">Nenhum cliente encontrado</p>
              </div>
            ) : (
              <>
                <VerticalBarChart
                  data={filtered}
                  total={totalPendencias}
                  scrollable={filtered.length > TOP_N}
                />
                {search && (
                  <p className="text-right text-[11px] text-muted-foreground leading-none">
                    {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}