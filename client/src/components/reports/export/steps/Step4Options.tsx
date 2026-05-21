import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { clientApi } from "@/services/ClientService";
import { CalendarDays, Database, FileText, LayoutList, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportType } from "../useExportReport";

interface ToggleRowProps {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  accent?: string;
}

function ToggleRow({ id, icon: Icon, title, description, checked, onCheckedChange, accent = "bg-primary/10 text-primary" }: ToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200",
        checked ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all", checked ? accent : "bg-muted")}>
          <Icon className={cn("h-4 w-4", checked ? "" : "text-muted-foreground")} />
        </div>
        <div className="min-w-0">
          <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
            {title}
          </Label>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
          {detail && <p className="mt-1 text-xs leading-snug text-muted-foreground">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

interface Step4OptionsProps {
  reportType: ReportType | null;
  dateRange: DateRange | undefined;
  selectedClientIds: string[];
  includeOldData: boolean;
  includeDetailedStatus: boolean;
  onChangeOldData: (v: boolean) => void;
  onChangeDetailedStatus: (v: boolean) => void;
}

export function Step4Options({
  reportType,
  dateRange,
  selectedClientIds,
  includeOldData,
  includeDetailedStatus,
  onChangeOldData,
  onChangeDetailedStatus,
}: Step4OptionsProps) {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const selectedClients = clients.filter((client) => selectedClientIds.includes(client._id));
  const reportLabel = reportType === "services" ? "Serviços" : "Agendamentos";
  const periodLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd/MM/yyyy")} até ${format(dateRange.to, "dd/MM/yyyy")}`
      : `${format(dateRange.from, "dd/MM/yyyy")} até data final`
    : "Todos os dados disponíveis";
  const clientLabel = selectedClientIds.length === 0
    ? "Todos os clientes"
    : `${selectedClientIds.length} cliente${selectedClientIds.length !== 1 ? "s" : ""}`;
  const clientDetail = selectedClientIds.length === 0
    ? "Sem filtro específico de cliente."
    : selectedClients.length > 0
      ? selectedClients.slice(0, 4).map((client) => client.name).join(", ") +
        (selectedClientIds.length > 4 ? ` e mais ${selectedClientIds.length - 4}` : "")
      : "Clientes selecionados para o filtro.";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Revisão e opções</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Confira o que será gerado e ajuste as opções finais
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <SummaryItem
          icon={FileText}
          label="Relatório"
          value={reportLabel}
          detail={reportType === "services" ? "Dados dos serviços realizados." : "Dados de agendamentos"}
        />
        <SummaryItem
          icon={CalendarDays}
          label="Período"
          value={periodLabel}
        />
        <SummaryItem
          icon={Users}
          label="Clientes"
          value={clientLabel}
          detail={clientDetail}
        />
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Opções do arquivo</p>
            <p className="text-xs text-muted-foreground">Essas escolhas alteram as colunas e a abrangência do relatório.</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Prévia final
          </Badge>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {reportType === "services" && (
            <ToggleRow
              id="include-old-data"
              icon={Database}
              title="Incluir dados antigos"
              description="Inclui registros de serviços anteriores ao período selecionado"
              checked={includeOldData}
              onCheckedChange={onChangeOldData}
              accent="bg-amber-500/10 text-amber-500"
            />
          )}
          <ToggleRow
            id="include-detailed-status"
            icon={LayoutList}
            title="Status detalhado -- Em desenvolvimento :)"
            description="Exibe informações granulares de status por linha do relatório"
            checked={includeDetailedStatus}
            onCheckedChange={onChangeDetailedStatus}
            accent="bg-violet-500/10 text-violet-500"
          />
        </div>
      </div>
    </div>
  );
}
