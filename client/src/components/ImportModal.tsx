import { useState } from "react"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PreviewTable } from "@/components/schedule/PreviewScheduleTable"
import { Upload, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClientService } from "@/services/ClientService"
import { useProductService } from "@/services/ProductService";


interface ImportModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    templateUrl: string
    templateName: string
    onImport: (data: Record<string, any>[]) => void | Promise<void>
    columnMapping?: Record<string, string>
}

export function ImportModal({
    open,
    onOpenChange,
    title = "Importar dados",
    templateUrl,
    templateName,
    onImport,
    columnMapping
}: ImportModalProps) {
    const [data, setData] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [fileName, setFileName] = useState("")

    const { data: products } = useProductService()
    const { data: clients } = useClientService()
    const handleFileUpload = (file: File) => {
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (event) => {
            const wb = XLSX.read(event.target?.result, { type: "binary" })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(ws)

            const mappedData = columnMapping
                ? jsonData.map(row =>
                    Object.entries(columnMapping).reduce((acc, [key, value]) => ({
                        ...acc,
                        [value]: row[key]
                    }), {})
                )
                : jsonData

            setData(mappedData as Record<string, any>[])
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

    const handleImport = async () => {
        setLoading(true)
        try {
            await onImport(data)
            onOpenChange(false)
            setData([])
            setFileName("")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        setData([])
        setFileName("")
    }

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch(templateUrl)

            if (!response.ok) {
                throw new Error("Template não encontrado")
            }

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
                                    id="file-upload"
                                    accept=".xlsx,.xls"
                                    onChange={handleInputChange}
                                    className="hidden"
                                />

                                <label
                                    htmlFor="file-upload"
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
                                            {data.length} registro{data.length > 1 ? "s" : ""} encontrado{data.length > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Pré-visualização</p>
                                <PreviewTable
                                    data={data}
                                    onDataChange={setData}
                                    products={products}
                                    clients={clients}
                                    productColumn="Equipamento"
                                    clientColumn="Cliente"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setData([])
                                    setFileName("")
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