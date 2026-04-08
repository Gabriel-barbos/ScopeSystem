import { useMemo } from "react"
import { CheckCircle2, AlertCircle, ArrowRight, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ColumnConfig } from "@/utils/ScheduleImportconfig"
import { cn } from "@/lib/utils"

interface ColumnMappingPanelProps {
  // Colunas que vieram do Excel (antes de qualquer mapeamento)
  excelColumns: string[]
  // Mapeamento atual: coluna Excel → field do banco
  // Preenchido automaticamente pelo processo de leitura, editável pelo usuário
  mapping: Record<string, string>
  onMappingChange: (mapping: Record<string, string>) => void
  // Configuração de colunas do contexto atual (schedule, services, etc.)
  importColumns: ColumnConfig[]
}

// Normaliza para comparação case-insensitive sem acento
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export function ColumnMappingPanel({
  excelColumns,
  mapping,
  onMappingChange,
  importColumns,
}: ColumnMappingPanelProps) {
  // Labels amigáveis para exibição no select de destino
  const FIELD_LABELS = useMemo(
    () => Object.fromEntries(importColumns.map(({ field, header }) => [field, header])),
    [importColumns]
  )

  // Todos os fields disponíveis para mapeamento manual
  const AVAILABLE_FIELDS = useMemo(
    () => importColumns.map(({ field, header, required }) => ({ field, label: header, required })),
    [importColumns]
  )
  // Separa colunas em reconhecidas e não reconhecidas
  const { mapped, unmapped } = useMemo(() => {
    const mapped: Array<{ excelCol: string; field: string }> = []
    const unmapped: string[] = []

    for (const col of excelColumns) {
      const field = mapping[col]
      if (field) mapped.push({ excelCol: col, field })
      else unmapped.push(col)
    }

    return { mapped, unmapped }
  }, [excelColumns, mapping])

  // Fields já usados no mapeamento (para evitar duplicatas no select)
  const usedFields = useMemo(
    () => new Set(Object.values(mapping).filter(Boolean)),
    [mapping]
  )

  const handleManualMap = (excelCol: string, field: string) => {
    const updated = { ...mapping }
    if (field === "__ignore__") {
      delete updated[excelCol]
    } else {
      updated[excelCol] = field
    }
    onMappingChange(updated)
  }

  const requiredFields = useMemo(
    () => new Set(importColumns.filter((c) => c.required).map((c) => c.field)),
    [importColumns]
  )

  const missingRequired = useMemo(
    () => importColumns.filter((c) => c.required && !usedFields.has(c.field)).map((c) => c.header),
    [importColumns, usedFields]
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* ── Resumo ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1.5 border-emerald-500/50 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            {mapped.length} mapeada{mapped.length !== 1 ? "s" : ""}
          </Badge>

          {unmapped.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-amber-500/50 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" />
              {unmapped.length} não reconhecida{unmapped.length !== 1 ? "s" : ""}
            </Badge>
          )}

          {missingRequired.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-red-500/50 text-red-700 dark:text-red-400">
              <AlertCircle className="w-3 h-3" />
              Faltam obrigatórios: {missingRequired.join(", ")}
            </Badge>
          )}
        </div>

        {/* ── Colunas reconhecidas ───────────────────────────────────────── */}
        {mapped.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Colunas reconhecidas
            </p>
            <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
              {mapped.map(({ excelCol, field }) => (
                <div
                  key={excelCol}
                  className="flex items-center gap-3 px-3 py-2 bg-emerald-50/40 dark:bg-emerald-900/10 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  {/* Coluna do Excel */}
                  <span className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
                    {excelCol}
                  </span>

                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />

                  {/* Campo destino */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      {FIELD_LABELS[field] ?? field}
                    </span>
                    {requiredFields.has(field) && (
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">*</span>
                        </TooltipTrigger>
                        <TooltipContent>Campo obrigatório</TooltipContent>
                      </Tooltip>
                    )}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Colunas não reconhecidas ────────────────────────────────────── */}
        {unmapped.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Colunas não reconhecidas
              </p>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-center">
                  Selecione para qual campo do sistema cada coluna deve ser importada, ou ignore
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="rounded-lg border border-amber-200/60 dark:border-amber-800/40 divide-y divide-border/40 overflow-hidden">
              {unmapped.map((col) => {
                const currentField = mapping[col]
                return (
                  <div
                    key={col}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 transition-colors",
                      currentField
                        ? "bg-emerald-50/40 dark:bg-emerald-900/10"
                        : "bg-amber-50/40 dark:bg-amber-900/10"
                    )}
                  >
                    {/* Coluna do Excel */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {currentField
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      }
                      <span className="text-sm font-medium text-foreground truncate">
                        {col}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />

                    {/* Select de destino */}
                    <Select
                      value={currentField ?? "__ignore__"}
                      onValueChange={(val) => handleManualMap(col, val)}
                    >
                      <SelectTrigger className={cn(
                        "h-7 text-xs w-44 shrink-0",
                        currentField
                          ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-900/20"
                          : "border-amber-400/40"
                      )}>
                        <SelectValue placeholder="Ignorar coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__ignore__">
                          <span className="text-muted-foreground italic">Ignorar</span>
                        </SelectItem>
                        {AVAILABLE_FIELDS
                          // Mostra todos os fields, mas marca os já usados
                          .map(({ field, label, required }) => (
                            <SelectItem
                              key={field}
                              value={field}
                              disabled={usedFields.has(field) && mapping[col] !== field}
                            >
                              <span className={cn(
                                usedFields.has(field) && mapping[col] !== field && "opacity-40"
                              )}>
                                {label}
                                {required && <span className="ml-1 text-primary text-[10px]">*</span>}
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}