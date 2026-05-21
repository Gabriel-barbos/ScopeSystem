import { Calendar, CheckCircle2, Clock3, FileSpreadsheet, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportType } from "../useExportReport";

const REPORT_TYPES: {
  type: ReportType;
  label: string;
  description: string;
  detail: string;
  meta: string;
  icon: React.ElementType;
  secondaryIcon: React.ElementType;
  color: string;
}[] = [
  {
    type: "schedules",
    label: "Agendamentos",
    description: "Relatório de todos os agendamentos cadastrados",
    detail: "concentra todos os status e informações de todos os serviços pendentes",
    meta: " ",
    icon: Calendar,
    secondaryIcon: Clock3,
    color: "text-violet-500",
  },
  {
    type: "services",
    label: "Serviços",
    description: "Relatório de serviços concluídos",
    detail: "relatorio com todas as informações do serviço realizado.",
    meta: " ",
    icon: Wrench,
    secondaryIcon: FileSpreadsheet,
    color: "text-blue-500",
  },
];

interface Step1ReportTypeProps {
  value: ReportType | null;
  onChange: (type: ReportType) => void;
}

export function Step1ReportType({ value, onChange }: Step1ReportTypeProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Tipo de relatório</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Escolha o tipo de dados que deseja exportar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_TYPES.map(({ type, label, description, detail, meta, icon: Icon, secondaryIcon: SecondaryIcon, color }) => {
          const selected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                "group relative flex min-h-44 flex-col items-start justify-between overflow-hidden rounded-xl border p-5 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "hover:border-primary/40 hover:bg-accent/30",
                selected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border bg-card"
              )}
            >
              {selected && (
                <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-primary" />
              )}

              <div className="flex w-full items-start gap-4 pr-8">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                    selected ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <Icon className={cn("h-6 w-6 transition-colors", selected ? "text-primary" : color)} />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-base font-semibold", selected ? "text-primary" : "text-foreground")}>
                    {label}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{description}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {detail}
              </p>

              <div className="mt-5 flex w-full items-center justify-between border-t pt-3 text-xs">
                <span className="font-medium text-muted-foreground">{meta}</span>
                <span className={cn("inline-flex items-center gap-1.5 font-medium", selected ? "text-primary" : "text-muted-foreground")}>
                  <SecondaryIcon className="h-3.5 w-3.5" />
                  {selected ? "Selecionado" : "Selecionar"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
