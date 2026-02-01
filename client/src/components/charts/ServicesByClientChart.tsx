import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import type { ServiceByClient } from "@/services/ReportService";

interface Props {
  data: ServiceByClient[];
}

export function ServicesByClientChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold mb-3">Serviços por Cliente</p>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Sem dados disponíveis
        </div>
      </Card>
    );
  }

  const chartData = data.map((d) => ({ name: d.client, total: d.total }));

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-3">Serviços por Cliente</p>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 38)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={75} />
          <Tooltip />
          <Bar dataKey="total" fill="#1890ff" radius={[0, 4, 4, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}