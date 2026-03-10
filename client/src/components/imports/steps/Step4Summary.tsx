import { CheckCircle2, Loader2, XCircle, Calendar, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

type ImportStatus = "idle" | "loading" | "success" | "error"

interface SummaryGroup {
  serviceType: string
  count: number
  clients: string[]
}

interface Step4SummaryProps {
  rows: Record<string, any>[]
  status: ImportStatus
  errorMessage?: string
  onConfirm: () => void
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  installation: "Instalações",
  maintenance: "Manutenções",
  removal: "Remoções",
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  installation: <Calendar className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  removal: <XCircle className="h-4 w-4" />,
}

function buildSummary(rows: Record<string, any>[]): SummaryGroup[] {
  const groups: Record<string, { count: number; clients: Set<string> }> = {}

  for (const row of rows) {
    const type = (row.serviceType || row.TipoServico || "installation").toLowerCase()
    const client = row.client || row.Cliente || "—"

    if (!groups[type]) groups[type] = { count: 0, clients: new Set() }
    groups[type].count++
    groups[type].clients.add(client)
  }

  return Object.entries(groups).map(([serviceType, { count, clients }]) => ({
    serviceType,
    count,
    clients: Array.from(clients),
  }))
}

export function Step4Summary({ rows, status, errorMessage, onConfirm }: Step4SummaryProps) {
  const summary = buildSummary(rows)

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Importando {rows.length} registros...</p>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <div className="text-center space-y-1">
          <p className="text-base font-semibold">Importação concluída!</p>
          <p className="text-sm text-muted-foreground">{rows.length} registros importados com sucesso.</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <XCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-1">
          <p className="text-base font-semibold">Erro na importação</p>
          <p className="text-sm text-muted-foreground">{errorMessage || "Ocorreu um erro inesperado."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Resumo da importação</h2>
        <p className="text-sm text-muted-foreground">
          Confira os dados antes de confirmar. Esta ação não pode ser desfeita.
        </p>
      </div>

      {/* Total */}
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total de registros</span>
        <span className="text-2xl font-bold">{rows.length}</span>
      </div>

      {/* Grupos por tipo */}
      <div className="flex flex-col gap-3">
        {summary.map((group) => (
          <div key={group.serviceType} className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                {SERVICE_ICONS[group.serviceType] ?? <Calendar className="h-4 w-4" />}
                {SERVICE_TYPE_LABELS[group.serviceType] ?? group.serviceType}
              </div>
              <span className="text-lg font-bold">{group.count}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.clients.slice(0, 5).map((c, i) => (
                <span key={i} className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                  {c}
                </span>
              ))}
              {group.clients.length > 5 && (
                <span className="text-xs bg-muted rounded-md px-2 py-0.5 text-muted-foreground">
                  +{group.clients.length - 5} clientes
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onConfirm} className="w-full" size="lg">
        Confirmar importação
      </Button>
    </div>
  )
}