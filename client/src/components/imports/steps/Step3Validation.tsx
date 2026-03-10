/**
 * Step3Validation.tsx
 *
 * Responsabilidades:
 * 1. Rodar matching automático de cliente e produto em cada linha
 * 2. Exibir resultado do matching com select para correção manual
 * 3. Validar campos obrigatórios e VIN
 * 4. Emitir as rows atualizadas (com ClienteId / EquipamentoId) para o pai
 */

import { useEffect, useState, useMemo } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useClientService } from "@/services/ClientService"
import { useProductService } from "@/services/ProductService"
import { findBestMatch } from "@/utils/Matchutils"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface RowError {
  rowIndex: number
  field: string
  message: string
}

interface MatchState {
  clientId?: string
  clientName?: string
  productId?: string
  productName?: string
}

interface Step3ValidationProps {
  rows: Record<string, any>[]
  mapping: Record<string, string>
  onRowsChange: (rows: Record<string, any>[]) => void
  onErrorsChange: (errors: RowError[]) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Inverte o mapping { colExcel → field } para { field → colExcel } */
function invertMapping(mapping: Record<string, string>) {
  return Object.fromEntries(Object.entries(mapping).map(([col, field]) => [field, col]))
}

function getVal(row: Record<string, any>, field: string, fieldToCol: Record<string, string>) {
  const col = fieldToCol[field]
  return col ? row[col] : undefined
}

/** Valida uma linha individual e retorna seus erros */
function validateRow(
  row: Record<string, any>,
  rowIndex: number,
  fieldToCol: Record<string, string>,
  matchState: MatchState
): RowError[] {
  const errors: RowError[] = []
  const requiredFields = SCHEDULE_IMPORT_COLUMNS.filter((c) => c.required).map((c) => c.field)

  for (const field of requiredFields) {
    // client e product são validados pelo match, não pelo valor bruto
    if (field === "client") {
      if (!matchState.clientId) errors.push({ rowIndex, field, message: "Cliente não encontrado" })
      continue
    }
    if (field === "product") continue // product não é required globalmente

    const value = getVal(row, field, fieldToCol)
    if (!value || String(value).trim() === "") {
      const label = SCHEDULE_IMPORT_COLUMNS.find((c) => c.field === field)?.header ?? field
      errors.push({ rowIndex, field, message: `"${label}" é obrigatório` })
    }
  }

  // VIN: 17 chars
  const vin = String(getVal(row, "vin", fieldToCol) ?? "").replace(/\s/g, "")
  if (vin && vin.length !== 17) {
    errors.push({ rowIndex, field: "vin", message: `Chassi inválido (${vin.length}/17 chars)` })
  }

  return errors
}

// ── Componente ────────────────────────────────────────────────────────────────

export function Step3Validation({ rows, mapping, onRowsChange, onErrorsChange }: Step3ValidationProps) {
  const { data: clientsData } = useClientService()
  const { data: productsData } = useProductService()

  // useProductService retorna o array direto; useClientService também
  const clients = useMemo(() => (clientsData as any) ?? [], [clientsData])
  const products = useMemo(() => (productsData as any) ?? [], [productsData])

  const fieldToCol = useMemo(() => invertMapping(mapping), [mapping])

  // Estado do matching por linha: Record<rowIndex, MatchState>
  const [matches, setMatches] = useState<Record<number, MatchState>>({})

  // Roda matching automático quando rows ou listas carregam
  useEffect(() => {
    if (!rows.length || (!clients.length && !products.length)) return

    const clientCol = fieldToCol["client"]
    const productCol = fieldToCol["product"]

    const initial: Record<number, MatchState> = {}
    rows.forEach((row, i) => {
      const clientMatch = clientCol ? findBestMatch(row[clientCol], clients) : null
      const productMatch = productCol ? findBestMatch(row[productCol], products) : null
      initial[i] = {
        clientId: clientMatch?.id,
        clientName: clientMatch?.name,
        productId: productMatch?.id,
        productName: productMatch?.name,
      }
    })
    setMatches(initial)
  }, [rows, clients, products, fieldToCol])

  // Sempre que matches muda, propaga rows atualizadas e erros para o pai
  useEffect(() => {
    if (!Object.keys(matches).length) return

    const updatedRows = rows.map((row, i) => ({
      ...row,
      ClienteId: matches[i]?.clientId,
      EquipamentoId: matches[i]?.productId,
    }))

    const allErrors = rows.flatMap((row, i) =>
      validateRow(row, i, fieldToCol, matches[i] ?? {})
    )

    // Detecta VINs duplicados dentro da planilha
    const vinCol = fieldToCol["vin"]
    if (vinCol) {
      const seen = new Map<string, number>()
      rows.forEach((row, i) => {
        const vin = String(row[vinCol] ?? "").toUpperCase().replace(/\s/g, "")
        if (!vin) return
        if (seen.has(vin)) {
          allErrors.push({ rowIndex: i, field: "vin", message: "Chassi duplicado na planilha" })
        } else {
          seen.set(vin, i)
        }
      })
    }

    onRowsChange(updatedRows)
    onErrorsChange(allErrors)
  }, [matches])

  const handleClientChange = (rowIndex: number, clientId: string) => {
    const client = clients.find((c: any) => c._id === clientId)
    setMatches((prev) => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], clientId: client?._id, clientName: client?.name },
    }))
  }

  const handleProductChange = (rowIndex: number, productId: string) => {
    const product = products.find((p: any) => p._id === productId)
    setMatches((prev) => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], productId: product?._id, productName: product?.name },
    }))
  }

  // ── Resumo ─────────────────────────────────────────────────────────────────

  const errorCount = useMemo(() => {
    return rows.filter((row, i) => {
      const errs = validateRow(row, i, fieldToCol, matches[i] ?? {})
      return errs.length > 0
    }).length
  }, [matches, rows, fieldToCol])

  const okCount = rows.length - errorCount

  // ── Colunas visíveis na tabela (apenas as mapeadas, exceto client/product que viram select) ──
  const otherCols = useMemo(() => {
    return Object.entries(mapping)
      .filter(([, field]) => field !== "client" && field !== "product")
      .slice(0, 4) // mostra só as 4 primeiras colunas para não poluir
      .map(([col]) => col)
  }, [mapping])

  if (!rows.length) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Validação e matching</h2>
        <p className="text-sm text-muted-foreground">
          Verifique o vínculo de cliente e produto. Linhas em amarelo precisam de atenção.
        </p>
      </div>

      {/* Resumo */}
      <div className="flex gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {okCount} linhas ok
          </span>
        </div>
        {errorCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {errorCount} com problema — corrija antes de avançar
            </span>
          </div>
        )}
      </div>

      {/* Tabela de matching */}
      <ScrollArea className="h-[420px] rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[180px]">Cliente</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[180px]">Produto</th>
              {otherCols.map((col) => (
                <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const match = matches[i] ?? {}
              const rowErrors = validateRow(row, i, fieldToCol, match)
              const hasError = rowErrors.length > 0
              const clientCol = fieldToCol["client"]
              const productCol = fieldToCol["product"]

              return (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    hasError
                      ? "bg-amber-50/60 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      : "hover:bg-muted/30"
                  )}
                >
                  {/* Número da linha */}
                  <td className="px-3 py-2 text-muted-foreground text-xs">{i + 1}</td>

                  {/* Select de Cliente */}
                  <td className="px-3 py-2">
                    <MatchSelect
                      value={match.clientId}
                      displayName={match.clientName ?? (clientCol ? row[clientCol] : "")}
                      options={clients}
                      hasMatch={!!match.clientId}
                      onChange={(id) => handleClientChange(i, id)}
                    />
                  </td>

                  {/* Select de Produto */}
                  <td className="px-3 py-2">
                    <MatchSelect
                      value={match.productId}
                      displayName={match.productName ?? (productCol ? row[productCol] : "")}
                      options={products}
                      hasMatch={!!match.productId}
                      onChange={(id) => handleProductChange(i, id)}
                      optional
                    />
                  </td>

                  {/* Outras colunas */}
                  {otherCols.map((col) => (
                    <td key={col} className="px-3 py-2 text-foreground max-w-[160px]">
                      <span className="truncate block text-xs">
                        {row[col] ?? <span className="text-muted-foreground/50 italic">—</span>}
                      </span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  )
}

// ── MatchSelect ───────────────────────────────────────────────────────────────
// Select reutilizável para cliente ou produto com indicador visual de match

interface MatchSelectProps {
  value?: string
  displayName?: string
  options: { _id: string; name: string }[]
  hasMatch: boolean
  onChange: (id: string) => void
  optional?: boolean
}

function MatchSelect({ value, displayName, options, hasMatch, onChange, optional }: MatchSelectProps) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-8 text-xs min-w-[160px] max-w-[220px]",
          hasMatch
            ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-600/40"
            : optional
              ? "border-border"
              : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-600/40"
        )}
      >
        <div className="flex items-center gap-1.5 w-full overflow-hidden">
          {hasMatch
            ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            : !optional && <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          }
          <span className="truncate">{displayName || "Selecionar..."}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt._id} value={opt._id}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}