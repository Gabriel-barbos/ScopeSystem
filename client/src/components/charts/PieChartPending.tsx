"use client";

import { Pie, PieChart } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PendingByClient } from "@/services/ReportService";

// Paleta de cores moderna e vibrante
const COLORS = [
  "hsl(221, 83%, 53%)",   // Azul vibrante (blue-600)
  "hsl(262, 83%, 58%)",   // Violeta (violet-500)
  "hsl(173, 80%, 40%)",   // Teal (teal-500)
  "hsl(333, 71%, 51%)",   // Rosa (pink-500)
  "hsl(25, 95%, 53%)",    // Laranja (orange-500)
  "hsl(142, 71%, 45%)",   // Verde (green-500)
  "hsl(47, 96%, 53%)",    // Amarelo (amber-400)
  "hsl(199, 89%, 48%)",   // Cyan (cyan-500)
  "hsl(280, 67%, 55%)",   // Púrpura
  "hsl(350, 89%, 60%)",   // Vermelho coral
];

interface Props {
  data: PendingByClient[];
}

export function PieChartPending({ data }: Props) {
  // Transforma os dados para o formato do shadcn charts
  const chartData = data.map((d, index) => ({
    client: d.client.toLowerCase().replace(/\s+/g, "-"),
    name: d.client,
    total: d.total,
    fill: `var(--color-${d.client.toLowerCase().replace(/\s+/g, "-")})`,
  }));

  // Gera o chartConfig dinamicamente baseado nos dados
  const chartConfig = {
    total: {
      label: "Total",
    },
    ...Object.fromEntries(
      data.map((d, index) => [
        d.client.toLowerCase().replace(/\s+/g, "-"),
        {
          label: d.client,
          color: COLORS[index % COLORS.length],
        },
      ])
    ),
  } satisfies ChartConfig;

  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base">Pendências por Cliente</CardTitle>
          <CardDescription>Distribuição de pendências</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Sem dados disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPendencias = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Pendências por Cliente</CardTitle>
        <CardDescription>Distribuição de pendências por cliente</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="flex items-center gap-2">
                      <span>{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                      <span className="font-bold">{value}</span>
                      <span className="text-muted-foreground">
                        ({((Number(value) / totalPendencias) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="client"
              cx="50%"
              cy="50%"
              outerRadius={80}
           
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="client" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}