import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import {
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useClientService } from "@/services/ClientService"
import { useProductService } from "@/services/ProductService"
import { findBestMatch } from "@/utils/Matchutils"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"
import {
  cleanRow,
  normalizeVin,
  findDuplicateIndexes,
} from "@/utils/importHelpers"


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

const CHUNK_SIZE = 50


function invertMapping(mapping: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(mapping).map(([col, field]) => [field, col])
  )
}

function getVal(row: Record<string, any>, field: string, fieldToCol: Record<string, string>) {
  const col = fieldToCol[field]
  return col !== undefined ? row[col] : undefined
}

function cleanMappedRow(
  row: Record<string, any>,
  fieldToCol: Record<string, string>
): Record<string, any> {
  const base = cleanRow(row)
  const vinCol = fieldToCol["vin"]
  if (vinCol && base[vinCol] !== undefined) base[vinCol] = normalizeVin(base[vinCol])
  return base
}

function validateRow(
  row: Record<string, any>,
  rowIndex: number,
  fieldToCol: Record<string, string>,
  matchState: MatchState,
  duplicateRowIndexes: Set<number>
): RowError[] {
  const errors: RowError[] = []

  for (const col of SCHEDULE_IMPORT_COLUMNS.filter((c) => c.required)) {
    if (col.field === "client") {
      if (!matchState.clientId)
        errors.push({ rowIndex, field: "client", message: "Cliente não encontrado" })
      continue
    }
    if (col.field === "product") continue

    const value = getVal(row, col.field, fieldToCol)
    if (!value || String(value).trim() === "")
      errors.push({ rowIndex, field: col.field, message: `"${col.header}" é obrigatório` })
  }

  const vin = String(getVal(row, "vin", fieldToCol) ?? "")
  if (vin) {
    if (vin.length !== 17)
      errors.push({ rowIndex, field: "vin", message: `Chassi inválido (${vin.length}/17 dígitos)` })
    else if (duplicateRowIndexes.has(rowIndex))
      errors.push({ rowIndex, field: "vin", message: "Chassi duplicado na planilha" })
  }

  return errors
}


export function Step3Validation({
  rows: rawRows,
  mapping,
  onRowsChange,
  onErrorsChange,
}: Step3ValidationProps) {
  const { data: clientsData } = useClientService()
  const { data: productsData } = useProductService()

  const clients = useMemo(() => (clientsData as any) ?? [], [clientsData])
  const products = useMemo(() => (productsData as any) ?? [], [productsData])

  const fieldToCol = useMemo(() => invertMapping(mapping), [mapping])

  const [rows, setRows] = useState<Record<string, any>[]>([])

  // matches só é atualizado um vez quando o matching termina por completo.
  // Durante o processamento, o resultado vai sendo acumulado em matchBufferRef
  // sem disparar re-renders da tabela.
  const [matches, setMatches] = useState<Record<number, MatchState>>({})
  const matchBufferRef = useRef<Record<number, MatchState>>({})

  const [progress, setProgress] = useState(0)
  const isMatching = progress > 0 && progress < 100

  const abortRef = useRef<{ cancelled: boolean } | null>(null)

  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editBuffer, setEditBuffer] = useState<Record<string, any>>({})
  const [showOnlyErrors, setShowOnlyErrors] = useState(false)

  useEffect(() => {
    const cleaned = rawRows.map((r) => cleanMappedRow(r, fieldToCol))
    setRows(cleaned)
    setMatches({})
    matchBufferRef.current = {}
    setProgress(0)
    setEditingRow(null)
    setEditBuffer({})
  }, [rawRows])



  useEffect(() => {
    if (!rows.length || !clients.length) return

    if (abortRef.current) abortRef.current.cancelled = true
    const abort = { cancelled: false }
    abortRef.current = abort

    const clientCol = fieldToCol["client"]
    const productCol = fieldToCol["product"]

    matchBufferRef.current = { ...matches }

    let processed = 0
    setProgress(1)

    function processChunk() {
      if (abort.cancelled) return

      const start = processed
      const end = Math.min(start + CHUNK_SIZE, rows.length)

      for (let i = start; i < end; i++) {
        const row = rows[i]
        const prev = matchBufferRef.current[i]

        const cm = prev?.clientId !== undefined
          ? { id: prev.clientId, name: prev.clientName }
          : clientCol ? findBestMatch(row[clientCol], clients) : null

        const pm = prev?.productId !== undefined
          ? { id: prev.productId, name: prev.productName }
          : productCol ? findBestMatch(row[productCol], products) : null

        matchBufferRef.current[i] = {
          clientId: cm?.id,
          clientName: cm?.name,
          productId: pm?.id,
          productName: pm?.name,
        }
      }

      processed = end

      const pct = Math.round((processed / rows.length) * 100)
      setProgress(pct < 100 ? pct : 99)

      if (processed < rows.length) {
        setTimeout(processChunk, 0)
        return
      }

      setMatches({ ...matchBufferRef.current })
      setProgress(100)
    }

    setTimeout(processChunk, 0)

    return () => { abort.cancelled = true }
  }, [rows, clients, products]) 

  useEffect(() => {
    if (!rows.length || isMatching || progress === 0) return

    const vinCol = fieldToCol["vin"]
    const duplicateRowIndexes = vinCol ? findDuplicateIndexes(rows, vinCol) : new Set<number>()

    const updatedRows = rows.map((row, i) => ({
      ...row,
      ClienteId: matches[i]?.clientId,
      EquipamentoId: matches[i]?.productId,
    }))

    const allErrors = rows.flatMap((row, i) =>
      validateRow(row, i, fieldToCol, matches[i] ?? {}, duplicateRowIndexes)
    )

    onRowsChange(updatedRows)
    onErrorsChange(allErrors)
  }, [matches, rows, isMatching])


  const handleClientChange = useCallback(
    (rowIndex: number, clientId: string) => {
      const client = clients.find((c: any) => c._id === clientId)
      setMatches((prev) => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], clientId: client?._id, clientName: client?.name },
      }))
    },
    [clients]
  )

  const handleProductChange = useCallback(
    (rowIndex: number, productId: string) => {
      const product = products.find((p: any) => p._id === productId)
      setMatches((prev) => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], productId: product?._id, productName: product?.name },
      }))
    },
    [products]
  )

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      setRows((prev) => prev.filter((_, i) => i !== rowIndex))
      setMatches((prev) => {
        const next: Record<number, MatchState> = {}
        Object.entries(prev).forEach(([key, val]) => {
          const k = Number(key)
          if (k === rowIndex) return
          next[k > rowIndex ? k - 1 : k] = val
        })
        return next
      })
      if (editingRow === rowIndex) { setEditingRow(null); setEditBuffer({}) }
    },
    [editingRow]
  )

  const handleStartEdit = useCallback(
    (rowIndex: number) => { setEditingRow(rowIndex); setEditBuffer({ ...rows[rowIndex] }) },
    [rows]
  )

  const handleSaveEdit = useCallback(
    (rowIndex: number) => {
      const cleaned = cleanMappedRow(editBuffer, fieldToCol)
      setRows((prev) => prev.map((r, i) => (i === rowIndex ? cleaned : r)))
      setEditingRow(null)
      setEditBuffer({})
    },
    [editBuffer, fieldToCol]
  )

  const handleCancelEdit = useCallback(() => { setEditingRow(null); setEditBuffer({}) }, [])

  const { errorCount, duplicateRowIndexes } = useMemo(() => {
    if (isMatching) return { errorCount: 0, duplicateRowIndexes: new Set<number>() }

    const vinCol = fieldToCol["vin"]
    const duplicateRowIndexes = vinCol ? findDuplicateIndexes(rows, vinCol) : new Set<number>()
    const errorCount = rows.filter((row, i) =>
      validateRow(row, i, fieldToCol, matches[i] ?? {}, duplicateRowIndexes).length > 0
    ).length

    return { errorCount, duplicateRowIndexes }
  }, [matches, rows, fieldToCol, isMatching])

  const okCount = rows.length - errorCount

  const otherCols = useMemo(
    () =>
      Object.entries(mapping)
        .filter(([, field]) => field !== "client" && field !== "product")
        .slice(0, 4)
        .map(([col, field]) => ({ col, field })),
    [mapping]
  )

  const displayRows = useMemo(() => {
    if (isMatching) return []
    const indexed = rows.map((row, i) => ({ row, originalIndex: i }))
    if (!showOnlyErrors) return indexed
    return indexed.filter(({ row, originalIndex: i }) =>
      validateRow(row, i, fieldToCol, matches[i] ?? {}, duplicateRowIndexes).length > 0
    )
  }, [rows, matches, fieldToCol, duplicateRowIndexes, showOnlyErrors, isMatching])

  if (!rows.length) return null


  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-5">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold">Validação e matching</h2>
          <p className="text-sm text-muted-foreground">
            Verifique o vínculo de cliente e produto. Linhas em amarelo precisam de atenção.
          </p>
        </div>

        {isMatching && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Identificando clientes e produtos…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {rows.length} linhas sendo processadas…
            </p>
          </div>
        )}

        {!isMatching && progress === 100 && (
          <div className="flex gap-3 justify-center flex-wrap items-center">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {okCount} linha{okCount !== 1 ? "s" : ""} ok
              </span>
            </div>

            {errorCount > 0 && (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {errorCount} com problema — corrija antes de avançar
                  </span>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setShowOnlyErrors((v) => !v)}
                  className="h-8 text-xs gap-1.5"
                >
                  {showOnlyErrors
                    ? <><ChevronDown className="h-3.5 w-3.5" />Mostrar todas</>
                    : <><ChevronUp className="h-3.5 w-3.5" />Só erros</>
                  }
                </Button>
              </>
            )}

            <span className="text-xs text-muted-foreground">
              {rows.length} linha{rows.length !== 1 ? "s" : ""} no total
            </span>
          </div>
        )}

        {isMatching && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/90 px-3 py-2 border-b border-border">
              <div className="h-3 w-32 rounded bg-muted-foreground/20" />
            </div>
            {Array.from({ length: Math.min(8, rows.length) }).map((_, i) => (
              <div
                key={i}
                className="flex gap-3 px-3 py-2.5 border-b border-border/50 animate-pulse"
              >
                <div className="h-3 w-4 rounded bg-muted-foreground/10" />
                <div className="h-3 w-40 rounded bg-muted-foreground/10" />
                <div className="h-3 w-40 rounded bg-muted-foreground/10" />
                <div className="h-3 w-24 rounded bg-muted-foreground/10" />
              </div>
            ))}
          </div>
        )}

        {/* Tabela — só renderiza após matching completo */}
        {!isMatching && progress === 100 && (
          <ScrollArea className="h-[420px] rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[180px]">Cliente</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[180px]">Produto</th>
                  {otherCols.map(({ col }) => (
                    <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2 w-16" />
                </tr>
              </thead>

              <tbody>
                {displayRows.map(({ row, originalIndex: i }) => {
                  const match = matches[i] ?? {}
                  const rowErrors = validateRow(row, i, fieldToCol, match, duplicateRowIndexes)
                  const hasError = rowErrors.length > 0
                  const isEditing = editingRow === i
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
                      <td className="px-3 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-muted-foreground text-xs">{i + 1}</span>
                          {hasError && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="h-3 w-3 text-amber-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[240px] space-y-1">
                                {rowErrors.map((e, idx) => (
                                  <p key={idx} className="text-xs">• {e.message}</p>
                                ))}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <MatchSelect
                          value={match.clientId}
                          displayName={match.clientName ?? (clientCol ? row[clientCol] : "")}
                          options={clients}
                          hasMatch={!!match.clientId}
                          onChange={(id) => handleClientChange(i, id)}
                        />
                      </td>

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

                      {otherCols.map(({ col, field }) => {
                        const cellError = rowErrors.find((e) => e.field === field)
                        return (
                          <td key={col} className="px-3 py-2 max-w-[160px]">
                            {isEditing ? (
                              <Input
                                value={editBuffer[col] ?? ""}
                                onChange={(e) =>
                                  setEditBuffer((prev) => ({ ...prev, [col]: e.target.value }))
                                }
                                className={cn(
                                  "h-7 text-xs px-2",
                                  cellError && "border-amber-500 focus-visible:ring-amber-400"
                                )}
                              />
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={cn(
                                      "truncate block text-xs cursor-default",
                                      cellError && "text-amber-600 dark:text-amber-400 font-medium"
                                    )}
                                  >
                                    {row[col] ?? <span className="text-muted-foreground/50 italic">—</span>}
                                  </span>
                                </TooltipTrigger>
                                {cellError && (
                                  <TooltipContent side="top">
                                    <p className="text-xs">{cellError.message}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            )}
                          </td>
                        )
                      })}

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 justify-end">
                          {isEditing ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => handleSaveEdit(i)}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Salvar</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancelar</TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleStartEdit(i)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar linha</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteRow(i)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remover linha</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </div>
    </TooltipProvider>
  )
}


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
          <SelectItem key={opt._id} value={opt._id}>{opt.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}