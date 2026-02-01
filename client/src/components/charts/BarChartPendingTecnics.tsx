
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PendingByProvider } from "@/services/ReportService";

// Usando as cores do CSS que você já definiu
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

interface Props {
  data: PendingByProvider[];
}

export function BarChartPendingTecnics({ data }: Props) {
  // Transforma os dados para o formato do shadcn charts
  const chartData = data.map((d, index) => ({
    name: d.provider,
    pending: d.pending,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  //  chartConfig dinamico baseado nos dados
  const chartConfig = {
    pending: {
      label: "Pendências",
    },
    ...Object.fromEntries(
      data.map((d, index) => [
        d.provider.toLowerCase().replace(/\s+/g, "-"),
        {
          label: d.provider,
          color: CHART_COLORS[index % CHART_COLORS.length],
        },
      ])
    ),
  } satisfies ChartConfig;

  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pendências por Prestador</CardTitle>
          <CardDescription>Distribuição de pendências por técnico</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const totalPendencias = data.reduce((acc, curr) => acc + curr.pending, 0);
  const maxPendencias = Math.max(...data.map((d) => d.pending));
  const topProvider = data.find((d) => d.pending === maxPendencias);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pendências por Prestador</CardTitle>
        <CardDescription>
          Total: {totalPendencias} pendência{totalPendencias !== 1 ? "s" : ""} •{" "}
          {data.length} prestador{data.length !== 1 ? "es" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-20}
              textAnchor="end"
              height={50}
              tick={{ fontSize: 11 }}
              interval={0}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.slice(0, 12)}...` : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{item.payload.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{value}</span>
                        <span className="text-muted-foreground text-xs">
                          ({((Number(value) / totalPendencias) * 100).toFixed(1)}%
                          do total)
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="pending" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}