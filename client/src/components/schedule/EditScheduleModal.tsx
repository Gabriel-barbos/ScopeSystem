import { useState, useMemo } from "react"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useClientService } from "@/services/ClientService"
import { useProductService } from "@/services/ProductService"
import { findBestMatch } from "@/utils/Matchutils"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"
import { parseExcelDate, formatDateBR, DATE_FIELDS } from "@/utils/Exceldateutils"


interface MatchedRow {
  payload: Record<string, any>
  clientId?: string
  clientName?: string
  productId?: string
  productName?: string
  rawClient?: string
  rawProduct?: string
}

interface EditScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateUrl: string
  templateName: string
  onUpdate: (data: Record<string, any>[]) => Promise<void>
}


function normalizeKey(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
}

const COLUMN_MAPPING: Record<string, string> = Object.fromEntries(
  SCHEDULE_IMPORT_COLUMNS.flatMap(({ header, aliases = [], field }) =>
    [header, ...aliases].filter(Boolean).map((key) => [normalizeKey(key), field])
  )
)

const PREVIEW_FIELDS = SCHEDULE_IMPORT_COLUMNS.filter(
  (c) => c.field !== "client" && c.field !== "product"
)


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
          {hasMatch ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : !optional ? (
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : null}
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


export function EditScheduleModal({
  open,
  onOpenChange,
  templateUrl,
  templateName,
  onUpdate,
}: EditScheduleModalProps) {
  const [rows, setRows] = useState<MatchedRow[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const { data: clientsRaw } = useClientService()
  const { data: productsRaw } = useProductService()

  const clients: { _id: string; name: string }[] = useMemo(
    () => (clientsRaw as any) ?? [],
    [clientsRaw]
  )
  const products: { _id: string; name: string }[] = useMemo(
    () => (productsRaw as any) ?? [],
    [productsRaw]
  )


  const handleFileUpload = (file: File) => {
    if (!file) return
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const wb = XLSX.read(event.target?.result, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, any>[]

      const parsed: MatchedRow[] = jsonData.map((row) => {
        const payload: Record<string, any> = {}
        let rawClient: string | undefined
        let rawProduct: string | undefined

        for (const [excelCol, value] of Object.entries(row)) {
          const field = COLUMN_MAPPING[normalizeKey(excelCol)]
          if (!field) continue

          if (field === "client") {
            rawClient = String(value ?? "")
          } else if (field === "product") {
            rawProduct = String(value ?? "")
          } else if (DATE_FIELDS.has(field)) {
            payload[field] = parseExcelDate(value) ?? value
          } else {
            payload[field] = value
          }
        }

        const clientMatch = rawClient ? findBestMatch(rawClient, clients) : null
        const productMatch = rawProduct ? findBestMatch(rawProduct, products) : null

        return {
          payload,
          rawClient,
          rawProduct,
          clientId: clientMatch?.id,
          clientName: clientMatch?.name,
          productId: productMatch?.id,
          productName: productMatch?.name,
        }
      })

      setRows(parsed)
      setCurrentPage(1)
    }
    reader.readAsBinaryString(file)
  }


  const handleClientChange = (rowIndex: number, clientId: string) => {
    const client = clients.find((c) => c._id === clientId)
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex
          ? { ...r, clientId: client?._id, clientName: client?.name }
          : r
      )
    )
  }

  const handleProductChange = (rowIndex: number, productId: string) => {
    const product = products.find((p) => p._id === productId)
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex
          ? { ...r, productId: product?._id, productName: product?.name }
          : r
      )
    )
  }


  const buildPayload = () =>
    rows.map(({ payload, clientId, productId }) => ({
      ...payload,
      ...(clientId ? { client: clientId } : {}),
      ...(productId ? { product: productId } : {}),
    }))

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await onUpdate(buildPayload())
      handleClose()
    } finally {
      setLoading(false)
    }
  }


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.name.match(/\.(xlsx|xls)$/)) handleFileUpload(file)
  }

  const handleClose = () => {
    onOpenChange(false)
    setRows([])
    setFileName("")
    setCurrentPage(1)
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(templateUrl)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      Object.assign(document.createElement("a"), { href: url, download: templateName }).click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Erro ao baixar o template. Tente novamente.")
    }
  }


  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE)
  const pageRows = rows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Editar Agendamentos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {rows.length === 0 ? (
            <UploadZone
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
              onDownload={handleDownloadTemplate}
            />
          ) : (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {rows.length} registro{rows.length !== 1 ? "s" : ""} carregados
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{fileName}</p>
                </div>
              </div>

              {/* Tabela */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Cliente</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Produto</th>
                        {PREVIEW_FIELDS.map((col) => (
                          <th key={col.field} className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, pageIdx) => {
                        const absoluteIdx = (currentPage - 1) * ITEMS_PER_PAGE + pageIdx
                        return (
                          <tr key={absoluteIdx} className="border-t hover:bg-muted/20">
                            {/* Cliente */}
                            <td className="px-3 py-2">
                              <MatchSelect
                                value={row.clientId}
                                displayName={row.clientName ?? row.rawClient}
                                options={clients}
                                hasMatch={!!row.clientId}
                                onChange={(id) => handleClientChange(absoluteIdx, id)}
                              />
                            </td>
                            {/* Produto */}
                            <td className="px-3 py-2">
                              <MatchSelect
                                value={row.productId}
                                displayName={row.productName ?? row.rawProduct}
                                options={products}
                                hasMatch={!!row.productId}
                                onChange={(id) => handleProductChange(absoluteIdx, id)}
                                optional
                              />
                            </td>
                            {/* Demais campos */}
                            {PREVIEW_FIELDS.map((col) => (
                              <td key={col.field} className="px-4 py-2 whitespace-nowrap text-muted-foreground text-xs">
                                {DATE_FIELDS.has(col.field)
                                  ? formatDateBR(row.payload[col.field])
                                  : String(row.payload[col.field] ?? "—")}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Página {currentPage} de {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                      Próxima
                    </Button>
                  </div>
                </div>
              )}

              <Button
                variant="ghost" size="sm"
                onClick={() => { setRows([]); setFileName(""); setCurrentPage(1) }}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Carregar outro arquivo
              </Button>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={loading} className="min-w-[120px]">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Modificando...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Modificar</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


function UploadZone({
  dragActive,
  onDrag,
  onDrop,
  onChange,
  onDownload,
}: {
  dragActive: boolean
  onDrag: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDownload: () => void
}) {
  return (
    <div className="space-y-3">
      <div
        onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200",
          "hover:border-primary/50 hover:bg-accent/5",
          dragActive ? "border-primary bg-accent/10 scale-[1.01]" : "border-muted-foreground/55"
        )}
      >
        <input type="file" id="edit-file-upload" accept=".xlsx,.xls" onChange={onChange} className="hidden" />
        <label htmlFor="edit-file-upload" className="flex flex-col items-center justify-center py-12 cursor-pointer">
          <FileSpreadsheet className={cn("w-16 h-16 transition-colors duration-200", dragActive ? "text-primary" : "text-muted-foreground")} />
          <p className="mt-4 text-sm font-medium">{dragActive ? "Solte o arquivo aqui" : "Arraste ou clique para enviar"}</p>
          <p className="text-xs text-muted-foreground mt-1">.xlsx ou .xls</p>
        </label>
      </div>
      <Button variant="outline" size="sm" onClick={onDownload} className="w-full gap-2">
        <Download className="w-4 h-4" />
        Baixar template de edição
      </Button>
    </div>
  )
}