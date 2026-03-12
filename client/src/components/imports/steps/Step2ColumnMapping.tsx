import { ColumnMappingPanel } from "@/components/ColumnMappingPanel"
import {
  CheckCircle2,
  AlertTriangle,
  Columns3,
  Link2,
  Unlink2,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"

interface Step2ColumnMappingProps {
  excelColumns: string[]
  mapping: Record<string, string>
  onMappingChange: (mapping: Record<string, string>) => void
}

export function Step2ColumnMapping({
  excelColumns,
  mapping,
  onMappingChange,
}: Step2ColumnMappingProps) {
  const mappedCount = Object.keys(mapping).length
  const unmappedCount = excelColumns.length - mappedCount
  const totalSystemFields = SCHEDULE_IMPORT_COLUMNS.length
  const requiredFields = SCHEDULE_IMPORT_COLUMNS.filter((c) => c.required)
  const mappedFields = new Set(Object.values(mapping))
  const missingRequired = requiredFields.filter(
    (f) => !mappedFields.has(f.field)
  )
  const progress = Math.round((mappedCount / totalSystemFields) * 100)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <Columns3 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Mapeamento de colunas
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Verifique as colunas reconhecidas automaticamente e vincule
          manualmente as que não foram identificadas.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto w-full"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border px-4 py-3",
            "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {mappedCount}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 -mt-0.5">
                Vinculadas
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-xl border px-4 py-3",
            unmappedCount > 0
              ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
              : "bg-muted/30 border-border"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                unmappedCount > 0
                  ? "bg-amber-500/15"
                  : "bg-muted"
              )}
            >
              <Unlink2
                className={cn(
                  "h-4 w-4",
                  unmappedCount > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-lg font-bold",
                  unmappedCount > 0
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-muted-foreground"
                )}
              >
                {unmappedCount}
              </p>
              <p
                className={cn(
                  "text-xs -mt-0.5",
                  unmappedCount > 0
                    ? "text-amber-600/80 dark:text-amber-400/80"
                    : "text-muted-foreground"
                )}
              >
                Não vinculadas
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Columns3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {excelColumns.length}
              </p>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Total no arquivo
              </p>
            </div>
          </div>
        </div>
      </motion.div>

   

      {missingRequired.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto w-full"
        >
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Campos obrigatórios não mapeados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingRequired.map((f) => (
                  <span
                    key={f.field}
                    className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                  >
                    {f.header}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {missingRequired.length === 0 && unmappedCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto w-full"
        >
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800/50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Todas as colunas foram mapeadas com sucesso! Você pode avançar.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 px-4 py-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            Colunas não vinculadas serão ignoradas na importação. Apenas as
            colunas mapeadas a um campo do sistema serão processadas.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ColumnMappingPanel
          excelColumns={excelColumns}
          mapping={mapping}
          onMappingChange={onMappingChange}
        />
      </motion.div>
    </div>
  )
}