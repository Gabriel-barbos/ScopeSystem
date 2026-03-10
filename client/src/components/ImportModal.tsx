import { useState, useMemo } from "react"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PreviewTable } from "@/components/schedule/PreviewScheduleTable"
import { ColumnMappingPanel } from "@/components/ColumnMappingPanel"
import { Upload, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClientService } from "@/services/ClientService"
import { useProductService } from "@/services/ProductService"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"
import { parseExcelDate, DATE_FIELDS } from "@/utils/Exceldateutils"

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  templateUrl: string
  templateName: string
  onImport: (data: Record<string, any>[]) => void | Promise<void>
}

function normalizeKey(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
}

// { "coluna normalizada" → "field do banco" } — usado para deteção automática
const BASE_COLUMN_MAP: Record<string, string> = Object.fromEntries(
  SCHEDULE_IMPORT_COLUMNS.flatMap(({ header, aliases = [], field }) =>
    [header, ...aliases].filter(Boolean).map((key) => [normalizeKey(key), field])
  )
)

// Detecta automaticamente quais colunas do Excel mapeiam para qual field
// Retorna { "Chassi" → "vin", "Data" → "scheduledDate", ... }
function buildInitialMapping(excelCols: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const col of excelCols) {
    const field = BASE_COLUMN_MAP[normalizeKey(col)]
    if (field) result[col] = field
  }
  return result
}

// Converte rawData (colunas PT) → payload (fields EN) apenas no momento de importar
// Também aplica conversão de datas e preserva ClienteId/EquipamentoId resolvidos pela PreviewTable
function buildPayload(
  rows: Record<string, any>[],
  mapping: Record<string, string>
): Record<string, any>[] {
  return rows.map((row) => {
    const result: Record<string, any> = {}

    for (const [excelCol, field] of Object.entries(mapping)) {
      // Para client e product, usa os IDs já resolvidos pela PreviewTable se existirem
      if (field === "client") {
        result[field] = row["ClienteId"] ?? row[excelCol]
      } else if (field === "product") {
        result[field] = row["EquipamentoId"] ?? row[excelCol]
      } else if (DATE_FIELDS.has(field)) {
        const parsed = parseExcelDate(row[excelCol])
        if (parsed) result[field] = parsed
      } else if (row[excelCol] !== undefined && row[excelCol] !== null && row[excelCol] !== "") {
        result[field] = field === "vin" ? String(row[excelCol]).trim() : row[excelCol]
      }
    }

    return result
  })
}

export function ImportModal({
  open,
  onOpenChange,
  title = "Importar dados",
  templateUrl,
  templateName,
  onImport,
}: ImportModalProps) {
  // rawData sempre em português (colunas originais do Excel) — nunca convertido
  const [rawData, setRawData] = useState<Record<string, any>[]>([])
  // mapping: { "coluna Excel PT" → "field banco EN" }
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState("")

  const { data: products } = useProductService()
  const { data: clients } = useClientService()

  const excelColumns = useMemo(
    () => (rawData.length > 0 ? Object.keys(rawData[0]) : []),
    [rawData]
  )

  // Qual coluna do Excel corresponde a "client" e "product" no mapeamento atual
  // Passado para a PreviewTable para ela saber qual coluna exibir o select de match
  const clientColumn = useMemo(
    () => Object.entries(columnMapping).find(([, f]) => f === "client")?.[0] ?? "Cliente",
    [columnMapping]
  )
  const productColumn = useMemo(
    () => Object.entries(columnMapping).find(([, f]) => f === "product")?.[0] ?? "Equipamento",
    [columnMapping]
  )

  const handleFileUpload = (file: File) => {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const wb = XLSX.read(event.target?.result, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, any>[]
      // Lê headers diretamente da planilha (linha 1) — sheet_to_json omite colunas
      // inteiramente ausentes nos dados, então a union de rows ainda falha quando
      // NENHUMA linha tem valor naquela coluna (ex: 200 linhas, só 14 com Placa)
      const sheetHeaders = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })[0] ?? []
      setRawData(jsonData)
      setColumnMapping(buildInitialMapping(sheetHeaders.map(String)))
    }
    reader.readAsBinaryString(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.name.match(/\.(xlsx|xls)$/)) handleFileUpload(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      // Conversão para EN acontece AQUI, não antes — rawData sempre fica em PT
      await onImport(buildPayload(rawData, columnMapping))
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setRawData([])
    setColumnMapping({})
    setFileName("")
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(templateUrl)
      if (!response.ok) throw new Error("Template não encontrado")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = templateName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar template:", error)
      alert("Erro ao baixar o template. Tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {rawData.length === 0 ? (
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-lg transition-all duration-200",
                  "hover:border-primary/50 hover:bg-accent/5",
                  dragActive ? "border-primary bg-accent/10 scale-[1.01]" : "border-muted-foreground/55"
                )}
              >
                <input type="file" id="file-upload" accept=".xlsx,.xls" onChange={handleInputChange} className="hidden" />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-12 cursor-pointer">
                  <div className={cn("transition-all duration-300", dragActive ? "scale-110" : "scale-100")}>
                    <FileSpreadsheet className={cn("w-16 h-16 transition-colors duration-200", dragActive ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <p className="mt-4 text-sm font-medium">
                    {dragActive ? "Solte o arquivo aqui" : "Arraste ou clique para enviar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx ou .xls</p>
                </label>
              </div>

              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Baixar template
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {rawData.length} registro{rawData.length !== 1 ? "s" : ""} encontrado{rawData.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">{fileName}</p>
                </div>
              </div>

              {/* Painel mostra colunas PT → campo PT (FIELD_LABELS resolve field→header) */}
              <ColumnMappingPanel
                excelColumns={excelColumns}
                mapping={columnMapping}
                onMappingChange={setColumnMapping}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium">Pré-visualização dos dados</p>
                {/* PreviewTable recebe rawData (PT) — nunca dados convertidos */}
                <PreviewTable
                  data={rawData}
                  onDataChange={(processed) => {
                    // A PreviewTable adiciona _originalIndex, ClienteId, EquipamentoId no processedData.
                    // Só nos interessa salvar de volta os IDs resolvidos — o resto é dado interno da tabela.
                    setRawData((prev) =>
                      prev.map((row, i) => {
                        const match = processed.find((p) => p._originalIndex === i)
                        if (!match) return row
                        return {
                          ...row,
                          ...(match.ClienteId    && { ClienteId:     match.ClienteId }),
                          ...(match.EquipamentoId && { EquipamentoId: match.EquipamentoId }),
                        }
                      })
                    )
                  }}
                  products={products?.filter((p: any) => p.category === "Dispositivo")}
                  clients={clients}
                  productColumn={productColumn}
                  clientColumn={clientColumn}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setRawData([]); setColumnMapping({}); setFileName("") }}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Carregar outro arquivo
              </Button>
            </div>
          )}
        </div>

        {rawData.length > 0 && (
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}