import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CarFront,
  ClipboardClock,
  Router,
  type LucideIcon,
} from "lucide-react";
import { InstallationEvolution } from "@/components/charts/billing/InstallationEvolution";
import { FleetStatusChart } from "../charts/billing/FleetStatusChart";

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  live?: boolean;
};

function StatCard({ title, value, icon: Icon, color, live }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}12` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Ao vivo
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClientFrotaTab({ clientId }: { clientId: string }) {
  // TODO: Implementar busca real de frota usando o clientId

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Veículos Instalados"
          value="3885"
          icon={CarFront}
          color="#3b82f6"
        />
        <StatCard
          title="Veículos Pendentes"
          value="12"
          icon={ClipboardClock}
          color="#f59e0b"
          live={false}
        />
        <StatCard
          title="Veículos Ativos"
          value="3578"
          icon={Router}
          color="#25b016"
          live={true}
        />
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid gap-4 lg:grid-cols-10">
        {/* Evolution: 70% no desktop */}
        <div className="lg:col-span-7">
          <InstallationEvolution />
        </div>

        {/* PieChart: 30% no desktop */}
        <div className="lg:col-span-3">
          <FleetStatusChart />
        </div>
      </div>
    </div>
  );
}