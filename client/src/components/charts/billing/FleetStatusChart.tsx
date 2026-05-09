"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Truck,
  CheckCircle2,
  PowerOff,
  AlertTriangle,
  PieChart as PieChartIcon,
} from "lucide-react";


export interface FleetStatusData {
  installed: number;
  active: number;
  uninstalled: number;
  notReporting: number;
}

type FleetKey = "active" | "notReporting" | "uninstalled";

interface FleetStatusChartProps {
  data?: FleetStatusData;
  isLoading?: boolean;
}



const MOCK_DATA: FleetStatusData = {
  installed: 1248,
  active: 982,
  uninstalled: 156,
  notReporting: 110,
};

const chartConfig = {
  active: {
    label: "Ativa",
    color: "hsla(209, 95%, 40%, 1.00)",
    icon: CheckCircle2,
  },
  notReporting: {
    label: "Sem Reportar",
    color: "hsl(38, 92%, 55%)",
    icon: AlertTriangle,
  },
  uninstalled: {
    label: "Desinstalada",
    color: "hsla(0, 69%, 52%, 1.00)",
    icon: PowerOff,
  },
} satisfies ChartConfig;


export function FleetStatusChart({
  data = MOCK_DATA,
  isLoading = false,
}: FleetStatusChartProps) {
  const chartData = useMemo(
    () => [
      {
        key: "active",
        label: chartConfig.active.label,
        value: data.active,
        fill: chartConfig.active.color,
      },
      {
        key: "notReporting",
        label: chartConfig.notReporting.label,
        value: data.notReporting,
        fill: chartConfig.notReporting.color,
      },
      {
        key: "uninstalled",
        label: chartConfig.uninstalled.label,
        value: data.uninstalled,
        fill: chartConfig.uninstalled.color,
      },
    ],
    [data]
  );

  const stats = useMemo(() => {
    const totalSegments = data.active + data.notReporting + data.uninstalled;
    const activeRate =
      totalSegments > 0 ? (data.active / totalSegments) * 100 : 0;

    const getPercentage = (value: number) =>
      totalSegments > 0 ? (value / totalSegments) * 100 : 0;

    return { totalSegments, activeRate, getPercentage };
  }, [data]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-start space-y-0 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Status da Frota
        </CardTitle>
        <CardDescription className="text-xs">
          Distribuição atual da comunicação da frota
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pb-2 pt-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : stats.totalSegments === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <PieChartIcon className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-xs text-muted-foreground">
              Sem dados disponíveis
            </p>
          </div>
        ) : (
          <>
            {/* Gráfico Donut */}
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const key = item.payload.key as FleetKey;
                        const config = chartConfig[key];
                        const percentage = stats.getPercentage(Number(value));

                        return (
                          <div className="flex w-full items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-muted-foreground">
                              {config.label}
                            </span>
                            <span className="ml-auto font-mono font-semibold tabular-nums">
                              {Number(value).toLocaleString("pt-BR")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={3}
                  paddingAngle={2}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                        return null;
                      }
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 6}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {data.installed.toLocaleString("pt-BR")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 14}
                            className="fill-muted-foreground text-[10px]"
                          >
                            Instalados
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Lista compacta de status */}
            <div className="mt-4 flex flex-col gap-2">
              {(Object.keys(chartConfig) as FleetKey[]).map((key) => {
                const Icon = chartConfig[key].icon;
                const value = data[key];
                const percentage = stats.getPercentage(value);

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-md border bg-card/50 px-3 py-2 transition-colors hover:bg-accent/40"
                  >
                    <div
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: chartConfig[key].color }}
                    />
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: chartConfig[key].color }}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {chartConfig[key].label}
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {value.toLocaleString("pt-BR")}
                    </span>
                    <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>

      {/* Footer com taxa de operação */}
      {!isLoading && stats.totalSegments > 0 && (
        <CardFooter className="flex-col items-start gap-1 border-t px-6 py-3 text-xs">
          <div className="flex items-center gap-2 font-medium leading-none">
            <Truck className="h-3.5 w-3.5 text-primary" />
            Taxa de operação:{" "}
            <span
              className={
                stats.activeRate >= 80
                  ? "text-emerald-600 dark:text-emerald-500"
                  : stats.activeRate >= 60
                  ? "text-amber-600 dark:text-amber-500"
                  : "text-rose-600 dark:text-rose-500"
              }
            >
              {stats.activeRate.toFixed(1)}%
            </span>
          </div>
          <div className="leading-none text-muted-foreground">
            {data.active.toLocaleString("pt-BR")} de{" "}
            {stats.totalSegments.toLocaleString("pt-BR")} reportando
          </div>
        </CardFooter>
      )}
    </Card>
  );
}