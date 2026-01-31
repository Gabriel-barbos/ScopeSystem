import { useState } from "react"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditScheduleModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templateUrl: string
    templateName: string
    onUpdate: (data: Record<string, any>[]) => Promise<void>
}

// Mapeamento: coluna do Excel -> campo do banco (em inglês)
const COLUMN_MAPPING = {
    "Chassi": "vin",                   
    "Status": "status",
    "Cliente": "client",                
    "Data": "scheduledDate",
    "Modelo": "model",
    "Placa": "plate",
    "Tipo de Serviço": "serviceType",
    "Equipamento": "product",            
    "Produto": "product",
    "Observações": "notes",
    "Prestador": "provider",
    // Nomes alternativos aceitos:
    "VIN": "vin",
    "Data Agendamento": "scheduledDate",
    "Observacoes": "notes",
}

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

    const handleFileUpload = (file: File) => {
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (event) => {
            const wb = XLSX.read(event.target?.result, { type: "binary" })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(ws)

            console.log("Dados brutos do Excel:", jsonData)
            console.log(" Mapeamento de colunas:", COLUMN_MAPPING)

            const mappedData = jsonData.map(row => {
                const mapped = Object.entries(COLUMN_MAPPING).reduce((acc, [excelCol, dbField]) => {
                    if (row[excelCol] !== undefined) {
                        acc[dbField] = row[excelCol]
                    }
                    return acc
                }, {} as Record<string, any>)
                
                console.log("Linha mapeada:", mapped)
                return mapped
            })

            console.log("✅ Dados finais mapeados:", mappedData)
            setData(mappedData)
            setCurrentPage(1)
        }
        reader.readAsBinaryString(file)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if (file?.name.match(/\.(xlsx|xls)$/)) {
            handleFileUpload(file)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFileUpload(file)
    }

    const handleUpdate = async () => {
        setLoading(true)
        try {
            await onUpdate(data)
            onOpenChange(false)
            setData([])
            setFileName("")
            setCurrentPage(1)
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
                                    <div className={cn(
                                        "transition-all duration-300",
                                        dragActive ? "scale-110" : "scale-100"
                                    )}>
                                        <div className="relative">
                                            <FileSpreadsheet className={cn(
                                                "text-green-600 w-16 h-16 transition-colors duration-200",
                                                dragActive ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <div className={cn(
                                                "absolute inset-0 rounded-full blur-xl transition-opacity duration-300",
                                                dragActive ? "opacity-20 bg-primary" : "opacity-0"
                                            )} />
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center space-y-2">
                                        <p className="text-sm font-medium">
                                            Arraste o arquivo ou <span className="text-primary">clique para selecionar</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Formatos aceitos: .xlsx, .xls
                                        </p>
                                    </div>
                                </label>

                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform duration-200" />
                                        Baixar template de exemplo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <FileSpreadsheet className="w-4 h-4 text-primary text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{fileName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {data.length} agendamento{data.length > 1 ? "s" : ""} para modificar
                                        </p>
                                    </div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Pré-visualização</p>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    {Object.keys(data[0] || {}).map(key => (
                                                        <th key={key} className="px-4 py-2 text-left font-medium">
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((row, idx) => (
                                                    <tr key={idx} className="border-t hover:bg-muted/20">
                                                        {Object.values(row).map((value, i) => (
                                                            <td key={i} className="px-4 py-2">
                                                                {String(value)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-xs text-muted-foreground">
                                            Página {currentPage} de {totalPages}
                                        </p>
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
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setData([])
                                    setFileName("")
                                    setCurrentPage(1)
                                }}
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
                                    Modificando agendamentos...
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