import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  
  // Match exato
  const exact = options.find(opt => normalize(opt.name) === normalized)
  if (exact) return { id: exact._id, name: exact.name }
  
  // Contém o input
  const contains = options.find(opt => normalize(opt.name).includes(normalized))
  if (contains) return { id: contains._id, name: contains.name }
  
  // Input contém parte do nome
  const partial = options.find(opt => normalized.includes(normalize(opt.name)))
  if (partial) return { id: partial._id, name: partial.name }
  
  return null
}

export function PreviewTable({ 
  data, 
  maxRows = 5, 
  onDataChange,
  products = [],
  clients = [],
  productColumn = "Equipamento",
  clientColumn = "Cliente"
}: PreviewTableProps) {
  const [editableData, setEditableData] = useState(data)
  const [matches, setMatches] = useState<Record<number, { product?: any; client?: any }>>({})

  useEffect(() => {
    const updatedData = data.map((row, idx) => {
      const productMatch = findBestMatch(row[productColumn], products)
      const clientMatch = findBestMatch(row[clientColumn], clients)
      
      return {
        ...row,
        // Salvar IDs das referências matched
        ...(clientMatch && { ClienteId: clientMatch.id }),
        ...(productMatch && { EquipamentoId: productMatch.id }),
      }
    })
    
    setEditableData(updatedData)
    
    // Salvar matches para exibição visual
    const newMatches: Record<number, any> = {}
    data.forEach((row, idx) => {
      const productMatch = findBestMatch(row[productColumn], products)
      const clientMatch = findBestMatch(row[clientColumn], clients)
      newMatches[idx] = { product: productMatch, client: clientMatch }
    })
    setMatches(newMatches)
  }, [data, products, clients, productColumn, clientColumn])

  useEffect(() => {
    onDataChange?.(editableData)
  }, [editableData])

  if (!data.length) return null

  
  const allColumns = Object.keys(data[0])
  const columns = allColumns.filter(col => !col.endsWith('Id'))
  const previewData = editableData.slice(0, maxRows)

  const handleCellChange = (rowIdx: number, col: string, value: string) => {
    const updated = [...editableData]
    updated[rowIdx] = { ...updated[rowIdx], [col]: value }

    if (col === productColumn || col === clientColumn) {
      const newMatch = col === productColumn 
        ? findBestMatch(value, products)
        : findBestMatch(value, clients)
      
      // Atualizar ID matched
      const idColumn = col === productColumn ? 'EquipamentoId' : 'ClienteId'
      if (newMatch) {
        updated[rowIdx][idColumn] = newMatch.id
      } else {
        delete updated[rowIdx][idColumn]
      }
      
      setMatches(prev => ({
        ...prev,
        [rowIdx]: {
          ...prev[rowIdx],
          [col === productColumn ? 'product' : 'client']: newMatch
        }
      }))
    }
    
    setEditableData(updated)
  }

  const handleMatchSelect = (rowIdx: number, col: string, itemId: string) => {
    const list = col === productColumn ? products : clients
    const selected = list.find(i => i._id === itemId)
    
    if (selected) {
      const idColumn = col === productColumn ? 'EquipamentoId' : 'ClienteId'
      const updated = [...editableData]
      updated[rowIdx] = { 
        ...updated[rowIdx], 
        [col]: selected.name,
        [idColumn]: selected._id
      }
      setEditableData(updated)
      
      // Atualizar matches
      setMatches(prev => ({
        ...prev,
        [rowIdx]: {
          ...prev[rowIdx],
          [col === productColumn ? 'product' : 'client']: { id: selected._id, name: selected.name }
        }
      }))
    }
  }

  const renderCell = (row: any, col: string, rowIdx: number) => {
    const isProductCol = col === productColumn
    const isClientCol = col === clientColumn
    const isMatchable = isProductCol || isClientCol
    
    if (!isMatchable) {
      return (
        <Input
          value={row[col] || ""}
          onChange={(e) => handleCellChange(rowIdx, col, e.target.value)}
          className="h-8 text-sm border-transparent hover:border-input focus:border-primary"
        />
      )
    }

    const match = isProductCol ? matches[rowIdx]?.product : matches[rowIdx]?.client
    const list = isProductCol ? products : clients
    const hasMatch = !!match

    return (
      <div className="flex items-center gap-2">
        <Select 
          value={match?.id || ""} 
          onValueChange={(val) => handleMatchSelect(rowIdx, col, val)}
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
              {columns.map((col) => (
                <TableHead key={col} className="font-semibold whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                {columns.map((col) => (
                  <TableCell key={col} className="whitespace-nowrap">
                    {renderCell(row, col, idx)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {data.length > maxRows && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Mostrando {maxRows} de {data.length} registros
        </p>
      )}
    </div>
  )
}