import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, FileSpreadsheet, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PreviewTableProps {
  data: Record<string, any>[]
  maxRows?: number
  onDataChange?: (data: Record<string, any>[]) => void
  products?: any[]
  clients?: any[]
  productColumn?: string
  clientColumn?: string
}

const normalize = (str: string) =>
  str?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "") || ""

const findBestMatch = (input: string, options: any[] = []) => {
  if (!input || !options?.length) return null
  const normalized = normalize(input)
  const exact = options.find(opt => normalize(opt.name) === normalized)
  if (exact) return { id: exact._id, name: exact.name }
  const contains = options.find(opt => normalize(opt.name).includes(normalized))
  if (contains) return { id: contains._id, name: contains.name }
  const partial = options.find(opt => normalized.includes(normalize(opt.name)))
  if (partial) return { id: partial._id, name: partial.name }
  return null
}

const HIDDEN_COLUMNS = ['_originalIndex', 'ClienteId', 'EquipamentoId']

export function PreviewTable({
  data,
  maxRows = 5,
  onDataChange,
  products = [],
  clients = [],
  productColumn = "Equipamento",
  clientColumn = "Cliente"
}: PreviewTableProps) {
  const [processedData, setProcessedData] = useState<Record<string, any>[]>([])
  const [matches, setMatches] = useState<Record<number, { product?: any; client?: any }>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const lastDataKey = useRef<string>("")

  // Dispara quando chega um arquivo novo (chave muda = número de linhas ou colunas diferentes)
  // NÃO dispara quando apenas ClienteId/EquipamentoId são atualizados pelo ImportModal
  useEffect(() => {
    // Chave estável: tamanho + nomes das colunas da primeira linha
    const dataKey = data.length > 0
      ? `${data.length}|${Object.keys(data[0]).filter(k => !k.endsWith('Id') && k !== '_originalIndex').join(',')}`
      : ""

    if (dataKey === lastDataKey.current) {
      // Mesmo arquivo — re-executa o match (products/clients podem ter chegado depois)
      // sem resetar a página
      if (processedData.length === 0) return  // ainda não processado nenhuma vez
      const newMatches: Record<number, any> = {}
      let idsChanged = false
      const updatedProcessed = processedData.map((row) => {
        const source = data.find((d, i) => (d._originalIndex ?? i) === row._originalIndex)
        if (!source) return row
        const productMatch = findBestMatch(source[productColumn], products)
        const clientMatch  = findBestMatch(source[clientColumn],  clients)
        const idx = row._originalIndex
        newMatches[idx] = { product: productMatch, client: clientMatch }
        const newClienteId     = clientMatch?.id  ?? row.ClienteId
        const newEquipamentoId = productMatch?.id ?? row.EquipamentoId
        if (newClienteId !== row.ClienteId || newEquipamentoId !== row.EquipamentoId) {
          idsChanged = true
          return {
            ...row,
            ...(newClienteId     && { ClienteId:     newClienteId }),
            ...(newEquipamentoId && { EquipamentoId: newEquipamentoId }),
          }
        }
        return row
      })

      if (idsChanged) {
        setMatches(newMatches)
        setProcessedData(updatedProcessed)
      }
      return
    }

    // Novo arquivo — processa tudo e reseta página
    lastDataKey.current = dataKey

    const updatedData: Record<string, any>[] = data.map((row, idx) => {
      const productMatch = findBestMatch(row[productColumn], products)
      const clientMatch = findBestMatch(row[clientColumn], clients)
      return {
        ...row,
        _originalIndex: idx,
        ...(clientMatch  && { ClienteId:     clientMatch.id }),
        ...(productMatch && { EquipamentoId: productMatch.id }),
      }
    })

    updatedData.sort((a, b) => {
      const aHasError = !a.ClienteId || (!a.EquipamentoId && a.TipoServico === "installation")
      const bHasError = !b.ClienteId || (!b.EquipamentoId && b.TipoServico === "installation")
      return Number(bHasError) - Number(aHasError)
    })

    setCurrentPage(1)
    setProcessedData(updatedData)

    const newMatches: Record<number, any> = {}
    updatedData.forEach((row) => {
      const idx = row._originalIndex
      const productMatch = findBestMatch(row[productColumn], products)
      const clientMatch  = findBestMatch(row[clientColumn],  clients)
      newMatches[idx] = { product: productMatch, client: clientMatch }
    })
    setMatches(newMatches)
  }, [data, products, clients, productColumn, clientColumn])

  useEffect(() => {
    if (processedData.length > 0) {
      onDataChange?.(processedData)
    }
  }, [processedData])

  if (!data.length) return null

  const allColumns = Object.keys(data[0])
  const columns = allColumns.filter(col => !HIDDEN_COLUMNS.includes(col) && !col.endsWith('Id'))

  const totalPages = Math.ceil(processedData.length / pageSize)
  const pagedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const errorRows = processedData.filter((row) => {
    const idx = row._originalIndex
    const hasClientError = !matches[idx]?.client
    const hasProductError = !matches[idx]?.product && row.TipoServico === "installation"
    return hasClientError || hasProductError
  })

  const totalRows = processedData.length
  const totalErrors = errorRows.length
  const totalOk = totalRows - totalErrors

  const handleMatchSelect = (originalIdx: number, col: string, itemId: string) => {
    const realIdx = processedData.findIndex(row => row._originalIndex === originalIdx)
    if (realIdx === -1) return

    const list = col === productColumn ? products : clients
    const selected = list.find(i => i._id === itemId)

    if (selected) {
      const idColumn = col === productColumn ? 'EquipamentoId' : 'ClienteId'
      const updated = [...processedData]
      updated[realIdx] = {
        ...updated[realIdx],
        [col]: selected.name,
        [idColumn]: selected._id
      }
      setProcessedData(updated)

      setMatches(prev => ({
        ...prev,
        [originalIdx]: {
          ...prev[originalIdx],
          [col === productColumn ? 'product' : 'client']: { id: selected._id, name: selected.name }
        }
      }))
    }
  }

  const renderCell = (row: any, col: string, originalIdx: number) => {
    const isProductCol = col === productColumn
    const isClientCol = col === clientColumn
    const isMatchable = isProductCol || isClientCol

    if (!isMatchable) {
      const value = row[col]
      return (
        <span className="text-sm text-foreground">
          {value !== undefined && value !== null && value !== ""
            ? value
            : <span className="text-muted-foreground/50 italic text-xs">—</span>
          }
        </span>
      )
    }

    const match = isProductCol ? matches[originalIdx]?.product : matches[originalIdx]?.client
    const list = isProductCol ? products : clients
    const hasMatch = !!match

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select
                value={match?.id || ""}
                onValueChange={(val) => handleMatchSelect(originalIdx, col, val)}
              >
                <SelectTrigger className={cn(
                  "h-8 text-xs min-w-[160px] max-w-[220px]",
                  hasMatch
                    ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-600/40"
                    : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-600/40"
                )}>
                  <div className="flex items-center gap-1.5 w-full overflow-hidden">
                    {hasMatch
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      : <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    }
                    <span className="truncate">
                      {match?.name || row[col] || "Selecionar..."}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {list.map(item => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {hasMatch
              ? `Vinculado: ${match.name}`
              : `"${row[col] || "vazio"}" não encontrado — selecione manualmente`
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-3">

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Total de linhas</p>
              <p className="text-xl font-bold text-foreground">{totalRows}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Válidas</p>
              <p className="text-xl font-bold text-foreground">{totalOk}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-border/60",
          totalErrors > 0 && "border-amber-400/60 dark:border-amber-600/40"
        )}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg",
              totalErrors > 0 ? "bg-amber-100 dark:bg-amber-900/40" : "bg-muted"
            )}>
              <XCircle className={cn(
                "w-4 h-4",
                totalErrors > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Com erro</p>
              <p className={cn(
                "text-xl font-bold",
                totalErrors > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}>
                {totalErrors}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalErrors > 0 && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-600/30 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                {totalErrors} linha{totalErrors > 1 ? "s" : ""} com problema de vínculo — corrija pelo select na tabela abaixo
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {errorRows.slice(0, 20).map((row) => {
                  const idx = row._originalIndex
                  const missingClient = !matches[idx]?.client
                  const missingProduct = !matches[idx]?.product && row.TipoServico === "installation"
                  const reasons = [
                    missingClient && "Cliente",
                    missingProduct && "Equipamento",
                  ].filter(Boolean).join(", ")

                  return (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-[10px] border-amber-400 bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600"
                    >
                      Linha {idx + 1}
                      <span className="ml-1 opacity-70">({reasons})</span>
                    </Badge>
                  )
                })}
                {totalErrors > 20 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-amber-400 bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  >
                    +{totalErrors - 20} mais
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="h-[360px] rounded-lg border border-border/60">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead className="w-8" />
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="font-semibold whitespace-nowrap text-xs uppercase tracking-wide text-muted-foreground"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((row, pageIdx) => {
              const originalIdx = row._originalIndex
              const hasClientError = !matches[originalIdx]?.client
              const hasProductError = !matches[originalIdx]?.product && row.TipoServico === "installation"
              const hasError = hasClientError || hasProductError

              return (
                <TableRow
                  key={originalIdx}
                  className={cn(
                    "transition-colors text-sm",
                    hasError
                      ? "bg-amber-50/50 dark:bg-amber-900/10 border-l-2 border-l-amber-400"
                      : "hover:bg-muted/40"
                  )}
                >
                  {/* Número da linha original */}
                  <TableCell className="w-10 text-center text-xs text-muted-foreground font-mono">
                    {originalIdx + 1}
                  </TableCell>

                  {/* Ícone de status */}
                  <TableCell className="w-8 p-2">
                    {hasError
                      ? <AlertCircle className="w-4 h-4 text-amber-500" />
                      : <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-60" />
                    }
                  </TableCell>

                  {columns.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap py-2 px-3">
                      {renderCell(row, col, originalIdx)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {processedData.length > pageSize && (
        <div className="flex items-center justify-between pt-1 px-1">
          <p className="text-xs text-muted-foreground">
            Exibindo{" "}
            <span className="font-medium text-foreground">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRows)}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">{totalRows}</span> registros
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
              )
              .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...")
                acc.push(page)
                return acc
              }, [])
              .map((page, idx) =>
                page === "..." ? (
                  <span key={`e-${idx}`} className="text-xs text-muted-foreground px-1">…</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 text-xs p-0"
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}