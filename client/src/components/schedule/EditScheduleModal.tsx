import { useState } from "react"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClientService } from "@/services/ClientService"
import { findBestMatch } from "@/utils/Matchutils"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"
import { parseExcelDate, formatDateBR, DATE_FIELDS } from "@/utils/Exceldateutils"

interface EditScheduleModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templateUrl: string
    templateName: string
    onUpdate: (data: Record<string, any>[]) => Promise<void>
}

// Normaliza para lookup case-insensitive: minúsculo + sem acento + sem espaço lateral
function normalizeKey(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

// Deriva o mapeamento de SCHEDULE_IMPORT_COLUMNS (fonte única de verdade)
// Resultado: { "chassi" → "vin", "cliente" → "client", "tiposervico" → "serviceType", ... }
// Todas as chaves já são normalizadas, então o lookup é sempre case-insensitive
const COLUMN_MAPPING: Record<string, string> = Object.fromEntries(
    SCHEDULE_IMPORT_COLUMNS.flatMap(({ header, aliases = [], field }) =>
        [header, ...aliases]
            .filter(Boolean)
            .map((key) => [normalizeKey(key), field])
    )
)

export function EditScheduleModal({
    open,
    onOpenChange,
    templateUrl,
    templateName,
    onUpdate
}: EditScheduleModalProps) {
    const [data, setData] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [fileName, setFileName] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // Carrega clientes para resolver nome → _id no campo "client"
    const { data: clientsRaw } = useClientService()
    const clients = (clientsRaw as any)?.data ?? clientsRaw ?? []

    const handleFileUpload = (file: File) => {
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (event) => {
            const wb = XLSX.read(event.target?.result, { type: "binary" })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, any>[]

            const mappedData = jsonData.map(row => {
                const result: Record<string, any> = {}

                for (const [excelCol, value] of Object.entries(row)) {
                    // Normaliza a chave da coluna do Excel para busca case-insensitive
                    const normalizedCol = normalizeKey(excelCol)
                    const dbField = COLUMN_MAPPING[normalizedCol]

                    if (!dbField) continue // ignora colunas desconhecidas

                    if (dbField === "client" && typeof value === "string") {
                        // Resolve o nome do cliente para seu _id via fuzzy match
                        const match = findBestMatch(value, clients)
                        result[dbField] = match?.id ?? value
                    } else if (DATE_FIELDS.has(dbField)) {
                        // Converte serial do Excel ou qualquer formato → "YYYY-MM-DD"
                        result[dbField] = parseExcelDate(value) ?? value
                    } else {
                        result[dbField] = value
                    }
                }

                return result
            })

            setData(mappedData)
            setCurrentPage(1)
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

    const handleUpdate = async () => {
        setLoading(true)
        try {
            await onUpdate(data)
            handleClose()
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        setData([])
        setFileName("")
        setCurrentPage(1)
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

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )
    const totalPages = Math.ceil(data.length / itemsPerPage)

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Editar Agendamentos</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                    {data.length === 0 ? (
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
                                    id="edit-file-upload"
                                    accept=".xlsx,.xls"
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="edit-file-upload"
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
                                Baixar template de edição
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        {data.length} registro{data.length !== 1 ? "s" : ""} para modificar
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">{fileName}</p>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                {Object.keys(data[0] || {}).map(key => (
                                                    <th key={key} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((row, idx) => (
                                                <tr key={idx} className="border-t hover:bg-muted/20">
                                                    {Object.entries(row).map(([key, value], i) => (
                                                        <td key={i} className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                                                            {DATE_FIELDS.has(key)
                                                                ? formatDateBR(value)
                                                                : String(value ?? "—")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Página {currentPage} de {totalPages}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Próxima
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setData([]); setFileName(""); setCurrentPage(1) }}
                                className="w-full text-muted-foreground hover:text-foreground"
                            >
                                Carregar outro arquivo
                            </Button>
                        </div>
                    )}
                </div>

                {data.length > 0 && (
                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} disabled={loading} className="min-w-[120px]">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Modificando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Modificar
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}