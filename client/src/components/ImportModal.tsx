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
  // columnMapping agora é opcional — se não for passado, usa SCHEDULE_IMPORT_COLUMNS
  columnMapping?: Record<string, string>
}

// Normaliza string para lookup case-insensitive (minúsculo + sem acento)
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

// Constrói o mapeamento inicial a partir de SCHEDULE_IMPORT_COLUMNS:
// { "coluna normalizada do excel" → "field do banco" }
// Isso detecta automaticamente header + aliases, case-insensitive
const BASE_COLUMN_MAP: Record<string, string> = Object.fromEntries(
  SCHEDULE_IMPORT_COLUMNS.flatMap(({ header, aliases = [], field }) =>
    [header, ...aliases]
      .filter(Boolean)
      .map((key) => [normalizeKey(key), field])
  )
)

// Dado um array de colunas do Excel, retorna o mapeamento inicial
// { "nome exato da coluna" → "field" } para as que forem reconhecidas
function buildInitialMapping(excelCols: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const col of excelCols) {
    const field = BASE_COLUMN_MAP[normalizeKey(col)]
    if (field) result[col] = field
  }
  return result
}

// Aplica o mapeamento nos dados brutos do Excel
// Converte { "coluna Excel" → valor } em { "field do banco" → valor }
function applyMapping(
  rows: Record<string, any>[],
  mapping: Record<string, string>
): Record<string, any>[] {
  return rows.map((row) => {
    const result: Record<string, any> = {}
    for (const [excelCol, value] of Object.entries(row)) {
      const field = mapping[excelCol]
      if (field) {
        result[field] = DATE_FIELDS.has(field) ? parseExcelDate(value) ?? value : value
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
  // Dados brutos do Excel, com as colunas originais intactas
  const [rawData, setRawData] = useState<Record<string, any>[]>([])
  // Mapeamento editável: coluna Excel → field do banco
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState("")

  const { data: products } = useProductService()
  const { data: clients } = useClientService()

  // Colunas que vieram do Excel (nomes originais, para exibição no painel)
  const excelColumns = useMemo(
    () => (rawData.length > 0 ? Object.keys(rawData[0]) : []),
    [rawData]
  )

  // Dados já mapeados para os fields do banco, prontos para a PreviewTable e para importar
  const mappedData = useMemo(
    () => applyMapping(rawData, columnMapping),
    [rawData, columnMapping]
  )

  const handleFileUpload = (file: File) => {
    if (!file) return
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const wb = XLSX.read(event.target?.result, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, any>[]

      setRawData(jsonData)
      setColumnMapping(buildInitialMapping(Object.keys(jsonData[0] ?? {})))
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
      await onImport(mappedData)
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
            /* ── Upload ───────────────────────────────────────────────── */
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-lg transition-all duration-200",
                  "hover:border-primary/50 hover:bg-accent/5",
                  dragActive
                    ? "border-primary bg-accent/10 scale-[1.01]"
                    : "border-muted-foreground/55"
                )}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center py-12 cursor-pointer"
                >
                  <div className={cn("transition-all duration-300", dragActive ? "scale-110" : "scale-100")}>
                    <FileSpreadsheet className={cn(
                      "w-16 h-16 transition-colors duration-200",
                      dragActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <p className="mt-4 text-sm font-medium">
                    {dragActive ? "Solte o arquivo aqui" : "Arraste ou clique para enviar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx ou .xls</p>
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar template
              </Button>
            </div>
          ) : (
            /* ── Arquivo carregado ────────────────────────────────────── */
            <div className="space-y-5">
              {/* Cabeçalho com nome do arquivo */}
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {rawData.length} registro{rawData.length !== 1 ? "s" : ""} encontrado{rawData.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">{fileName}</p>
                </div>
              </div>

              {/* Painel de mapeamento de colunas */}
              <ColumnMappingPanel
                excelColumns={excelColumns}
                mapping={columnMapping}
                onMappingChange={setColumnMapping}
              />

              {/* Preview da tabela com dados já mapeados */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Pré-visualização dos dados</p>
                <PreviewTable
                  data={mappedData}
                  onDataChange={(updated) => {
                    // PreviewTable devolve os dados com ClienteId/EquipamentoId resolvidos
                    // Precisamos sincronizar de volta com o rawData
                    // Como os índices são 1:1, reconstruímos o rawData com os IDs
                    setRawData((prev) =>
                      prev.map((row, i) => ({ ...row, ...updated[i] }))
                    )
                  }}
                  products={products?.filter((p: any) => p.category === "Dispositivo")}
                  clients={clients}
                  productColumn="product"
                  clientColumn="client"
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