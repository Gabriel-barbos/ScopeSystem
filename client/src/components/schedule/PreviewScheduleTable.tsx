import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  const [editableData, setEditableData] = useState<Record<string, any>[]>([])
  const [matches, setMatches] = useState<Record<number, { product?: any; client?: any }>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const isInternalUpdate = useRef(false)
  
  const lastExternalData = useRef<Record<string, any>[]>([])

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    if (data === lastExternalData.current) {
      return
    }
    
    lastExternalData.current = data

    const updatedData = data.map((row, idx) => {
      const productMatch = findBestMatch(row[productColumn], products)
      const clientMatch = findBestMatch(row[clientColumn], clients)

      return {
        ...row,
        _originalIndex: idx,
        ...(clientMatch && { ClienteId: clientMatch.id }),
        ...(productMatch && { EquipamentoId: productMatch.id }),
      }
    })

    updatedData.sort((a, b) => {
      const aHasError = !a.ClienteId || (!a.EquipamentoId && a.TipoServico === "installation")
      const bHasError = !b.ClienteId || (!b.EquipamentoId && b.TipoServico === "installation")
      return Number(bHasError) - Number(aHasError)
    })

    setCurrentPage(1)
    setEditableData(updatedData)

    const newMatches: Record<number, any> = {}
    updatedData.forEach((row) => {
      const idx = row._originalIndex
      const productMatch = findBestMatch(row[productColumn], products)
      const clientMatch = findBestMatch(row[clientColumn], clients)
      newMatches[idx] = { product: productMatch, client: clientMatch }
    })
    setMatches(newMatches)
  }, [data, products, clients, productColumn, clientColumn])

  useEffect(() => {
    if (editableData.length > 0) {
      onDataChange?.(editableData)
    }
  }, [editableData])

  if (!data.length) return null

  const allColumns = Object.keys(data[0])
  const columns = allColumns.filter(col => !HIDDEN_COLUMNS.includes(col) && !col.endsWith('Id'))
  
  const totalPages = Math.ceil(editableData.length / pageSize)
  const previewData = editableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleCellChange = (originalIdx: number, col: string, value: string) => {
    const realIdx = editableData.findIndex(row => row._originalIndex === originalIdx)
    if (realIdx === -1) return

    isInternalUpdate.current = true

    const updated = [...editableData]
    updated[realIdx] = { ...updated[realIdx], [col]: value }

    if (col === productColumn || col === clientColumn) {
      const newMatch = col === productColumn
        ? findBestMatch(value, products)
        : findBestMatch(value, clients)

      const idColumn = col === productColumn ? 'EquipamentoId' : 'ClienteId'
      if (newMatch) {
        updated[realIdx][idColumn] = newMatch.id
      } else {
        delete updated[realIdx][idColumn]
      }

      setMatches(prev => ({
        ...prev,
        [originalIdx]: {
          ...prev[originalIdx],
          [col === productColumn ? 'product' : 'client']: newMatch
        }
      }))
    }

    setEditableData(updated)
  }

  const handleMatchSelect = (originalIdx: number, col: string, itemId: string) => {
    const realIdx = editableData.findIndex(row => row._originalIndex === originalIdx)
    if (realIdx === -1) return

    isInternalUpdate.current = true

    const list = col === productColumn ? products : clients
    const selected = list.find(i => i._id === itemId)

    if (selected) {
      const idColumn = col === productColumn ? 'EquipamentoId' : 'ClienteId'
      const updated = [...editableData]
      updated[realIdx] = {
        ...updated[realIdx],
        [col]: selected.name,
        [idColumn]: selected._id
      }
      setEditableData(updated)

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
      return (
        <Input
          value={row[col] || ""}
          onChange={(e) => handleCellChange(originalIdx, col, e.target.value)}
          className="h-8 text-sm border-transparent hover:border-input focus:border-primary"
        />
      )
    }

    const match = isProductCol ? matches[originalIdx]?.product : matches[originalIdx]?.client
    const list = isProductCol ? products : clients
    const hasMatch = !!match

    return (
      <div className="flex items-center gap-2">
        <Select
          value={match?.id || ""}
          onValueChange={(val) => handleMatchSelect(originalIdx, col, val)}
        >
          <SelectTrigger className={cn(
            "h-8 text-sm",
            hasMatch ? "border-green-500/50 bg-green-50/50" : "border-amber-500/50 bg-amber-50/50"
          )}>
            <div className="flex items-center gap-2 w-full">
              {hasMatch ? (
                <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
              )}
              <span className="truncate">
                {match?.name || row[col] || "Selecionar"}
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
    )
  }

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[300px] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
            <TableRow>
              <TableHead className="w-8" />
              {columns.map((col) => (
                <TableHead key={col} className="font-semibold whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row) => {
              const originalIdx = row._originalIndex
              const hasClientError = !matches[originalIdx]?.client
              const hasProductError = !matches[originalIdx]?.product && row.TipoServico === "installation"
              const hasError = hasClientError || hasProductError

              return (
                <TableRow
                  key={originalIdx}
                  className={cn(
                    "transition-colors",
                    hasError
                      ? "bg-amber-50/40 dark:bg-amber-900/20 border-l-4 border-l-amber-500"
                      : "hover:bg-muted/50"
                  )}
                >
                  <TableCell className="w-8 p-2">
                    {hasError && (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </TableCell>

                  {columns.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap">
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

      {editableData.length > pageSize && (
        <div className="flex items-center justify-between pt-2 px-1">
          <p className="text-xs text-muted-foreground">
            {editableData.length} registro{editableData.length > 1 ? "s" : ""} no total
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
                page === 1 || page === totalPages ||
                Math.abs(page - currentPage) <= 1
              )
              .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...")
                acc.push(page)
                return acc
              }, [])
              .map((page, idx) =>
                page === "..." ? (
                  <span key={`e-${idx}`} className="text-xs text-muted-foreground px-1">...</span>
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