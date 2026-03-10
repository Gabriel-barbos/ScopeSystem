import { ColumnMappingPanel } from "@/components/ColumnMappingPanel"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface Step2ColumnMappingProps {
  excelColumns: string[]
  mapping: Record<string, string>
  onMappingChange: (mapping: Record<string, string>) => void
}

export function Step2ColumnMapping({ excelColumns, mapping, onMappingChange }: Step2ColumnMappingProps) {
  const mappedCount = Object.keys(mapping).length
  const unmappedCount = excelColumns.length - mappedCount

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Mapeamento de colunas</h2>
        <p className="text-sm text-muted-foreground">
          Verifique as colunas reconhecidas e vincule manualmente as que não foram identificadas
        </p>
      </div>

      {/* Resumo rápido */}
      <div className="flex gap-3 justify-center">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {mappedCount} colunas reconhecidas
          </span>
        </div>
        {unmappedCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {unmappedCount} colunas não reconhecidas
            </span>
          </div>
        )}
      </div>

      <ColumnMappingPanel
        excelColumns={excelColumns}
        mapping={mapping}
        onMappingChange={onMappingChange}
      />
    </div>
  )
}