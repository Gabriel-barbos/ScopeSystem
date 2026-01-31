
import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A simple pie chart"
const chartData = [
  { name: "LM Frotas", value: 275, fill: "hsl(var(--chart-1))" },
  { name: "Equatorial Goiás", value: 200, fill: "hsl(var(--chart-2))" },
  { name: "Unidas", value: 187, fill: "hsl(var(--chart-3))" },
];


const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "LM frotas",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Equatorial",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function PieChartPending() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Instalações Pendentes</CardTitle>
        <CardDescription>January - Feb 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
<Pie
  data={chartData}
  dataKey="value"
  nameKey="name"
  stroke="hsl(var(--background))"
  strokeWidth={2}
/>
      </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
       
        <div className="text-muted-foreground leading-none">
Exibindo todos os agendamentos não concluidos de cada cliente        </div>
      </CardFooter>
    </Card>
  )
}
