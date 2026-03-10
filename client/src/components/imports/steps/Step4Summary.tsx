// components/imports/steps/Step4Summary.tsx
import {
  CheckCircle2,
  Loader2,
  XCircle,
  Calendar,
  Wrench,
  Trash2,
  Package,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

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

const SERVICE_TYPE_COLORS: Record<string, { bg: string; text: string; icon: string; border: string }> = {
  installation: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/50",
  },
  maintenance: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  removal: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/50",
  },
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  installation: <Calendar className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  removal: <Trash2 className="h-4 w-4" />,
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

function getUniqueClients(rows: Record<string, any>[]): number {
  const set = new Set(rows.map((r) => r.client || r.Cliente || "—"))
  return set.size
}

// ── Loading State ─────────────────────────────────────────────────────────────

function LoadingState({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-6 py-16"
    >
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileSpreadsheet className="h-7 w-7 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-base font-semibold">Importando agendamentos...</p>
        <p className="text-sm text-muted-foreground">
          Processando {total.toLocaleString("pt-BR")} registros. Isso pode levar alguns instantes.
        </p>
      </div>

      {/* Pulsing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Success State ─────────────────────────────────────────────────────────────

function SuccessState({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center justify-center gap-6 py-16"
    >
      {/* Animated checkmark */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </motion.div>
        </motion.div>

        {/* Sparkle effects */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.15 }}
            className="absolute"
            style={{
              top: `${[10, -5, 50][i]}%`,
              left: `${[85, 50, 90][i]}%`,
            }}
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center space-y-2"
      >
        <p className="text-lg font-semibold">Importação concluída!</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {total.toLocaleString("pt-BR")}
          </span>{" "}
          agendamentos foram importados com sucesso.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 px-4 py-3 max-w-sm"
      >
        <p className="text-xs text-emerald-700 dark:text-emerald-300 text-center leading-relaxed">
          Todos os registros foram validados e salvos. Você já pode visualizá-los na tela de agendamentos.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Error State ───────────────────────────────────────────────────────────────

function ErrorState({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-6 py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
      >
        <XCircle className="h-10 w-10 text-destructive" />
      </motion.div>

      <div className="text-center space-y-2 max-w-md">
        <p className="text-lg font-semibold">Erro na importação</p>
        <p className="text-sm text-muted-foreground">
          {message || "Ocorreu um erro inesperado durante o processo."}
        </p>
      </div>

      <div className="rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 max-w-md w-full">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive/80 leading-relaxed">
            Nenhum registro foi salvo. Você pode tentar novamente ou voltar para corrigir os dados.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Idle / Summary State ──────────────────────────────────────────────────────

export function Step4Summary({ rows, status, errorMessage, onConfirm }: Step4SummaryProps) {
  const [confirmed, setConfirmed] = useState(false)
  const summary = buildSummary(rows)
  const uniqueClients = getUniqueClients(rows)

  if (status === "loading") return <LoadingState total={rows.length} />
  if (status === "success") return <SuccessState total={rows.length} />
  if (status === "error") return <ErrorState message={errorMessage} />

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Resumo da importação</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Revise os dados abaixo antes de confirmar. Esta ação criará todos os agendamentos no sistema.
        </p>
      </div>

      {/* Overview cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto w-full"
      >
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 px-4 py-4 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{rows.length.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Agendamentos</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 px-4 py-4 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-400" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{uniqueClients}</p>
            <p className="text-xs text-muted-foreground">Clientes</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 px-4 py-4 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center mb-1">
              <FileSpreadsheet className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{summary.length}</p>
            <p className="text-xs text-muted-foreground">Tipos de serviço</p>
          </div>
        </div>
      </motion.div>

      {/* Service type breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto w-full space-y-3"
      >
        <h3 className="text-sm font-medium text-muted-foreground px-1">Detalhamento por tipo</h3>

        <div className="flex flex-col gap-2.5">
          {summary.map((group, index) => {
            const colors = SERVICE_TYPE_COLORS[group.serviceType] ?? SERVICE_TYPE_COLORS.installation
            const percentage = Math.round((group.count / rows.length) * 100)

            return (
              <motion.div
                key={group.serviceType}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.08 }}
                className={cn(
                  "rounded-xl border px-5 py-4 space-y-3",
                  colors.bg,
                  colors.border
                )}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.icon)}>
                      {SERVICE_ICONS[group.serviceType] ?? <Calendar className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", colors.text)}>
                        {SERVICE_TYPE_LABELS[group.serviceType] ?? group.serviceType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.clients.length} {group.clients.length === 1 ? "cliente" : "clientes"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xl font-bold", colors.text)}>{group.count}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", {
                      "bg-blue-500": group.serviceType === "installation",
                      "bg-amber-500": group.serviceType === "maintenance",
                      "bg-rose-500": group.serviceType === "removal",
                    })}
                  />
                </div>

                {/* Client tags */}
                <div className="flex flex-wrap gap-1.5">
                  {group.clients.slice(0, 6).map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-xs bg-background/60 dark:bg-background/30 border border-border/50 rounded-lg px-2.5 py-1 text-muted-foreground font-medium"
                    >
                      {c}
                    </span>
                  ))}
                  {group.clients.length > 6 && (
                    <span className="inline-flex items-center text-xs bg-background/60 dark:bg-background/30 border border-border/50 rounded-lg px-2.5 py-1 text-muted-foreground font-medium">
                      +{group.clients.length - 6} mais
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Warning callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Ação irreversível
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
              Ao confirmar, todos os {rows.length.toLocaleString("pt-BR")} agendamentos serão criados
              imediatamente no sistema. Certifique-se de que os dados estão corretos.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Confirm button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-2xl mx-auto w-full space-y-3"
      >
        {!confirmed ? (
          <Button
            onClick={() => setConfirmed(true)}
            className="w-full h-12 text-base rounded-xl"
            size="lg"
          >
            Revisei e quero importar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-4 text-center space-y-3">
              <p className="text-sm font-medium">
                Tem certeza? Serão criados{" "}
                <span className="font-bold text-primary">
                  {rows.length.toLocaleString("pt-BR")}
                </span>{" "}
                agendamentos.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setConfirmed(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={onConfirm}
                  className="rounded-xl px-8"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar importação
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}