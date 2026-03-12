import { useRef, useState } from "react"
import {
  Upload, FileSpreadsheet, X, CloudUpload,
  CheckCircle2, FileWarning, Info, Download, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const ROW_LIMIT = 500

interface Step1UploadProps {
  templateUrl: string
  templateName: string
  onFileLoaded: (file: File, columns: string[], rows: Record<string, any>[]) => void
}

export function Step1Upload({ templateUrl, templateName, onFileLoaded }: Step1UploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [rowCount, setRowCount] = useState(0)
  const [colCount, setColCount] = useState(0)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = async (f: File) => {
    setParsing(true)
    setParseError(null)

    try {
      const XLSX = await import("xlsx")
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "binary" })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const [headerRow] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]
          const columns = (headerRow ?? []).filter(Boolean)
          const rows = XLSX.utils.sheet_to_json(ws, { defVal: "" }) as Record<string, any>[]

          if (rows.length === 0) {
            setParseError("A planilha está vazia ou não possui dados válidos.")
            setParsing(false)
            return
          }

          if (rows.length > ROW_LIMIT) {
            setParseError(`Limite de ${ROW_LIMIT} linhas excedido. O arquivo possui ${rows.length} linhas. Divida a planilha em partes menores.`)
            setParsing(false)
            return
          }

          setFile(f)
          setRowCount(rows.length)
          setColCount(columns.length)
          setParsing(false)
          onFileLoaded(f, columns, rows)
        } catch {
          setParseError("Não foi possível ler a planilha. Verifique o formato.")
          setParsing(false)
        }
      }

      reader.onerror = () => {
        setParseError("Erro ao ler o arquivo.")
        setParsing(false)
      }

      reader.readAsBinaryString(f)
    } catch {
      setParseError("Erro ao processar o arquivo.")
      setParsing(false)
    }
  }

  // ← NOVO: mesmo padrão do ImportModal e EditScheduleModal
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
    } catch {
      setParseError("Erro ao baixar o template. Tente novamente.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f?.name.match(/\.(xlsx|xls)$/)) processFile(f)
    else setParseError("Formato inválido. Use arquivos .xlsx ou .xls")
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const clearFile = () => {
    setFile(null)
    setRowCount(0)
    setColCount(0)
    setParseError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-6">
      {/* Header */}
      <div className="text-center space-y-2 max-w-lg">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <CloudUpload className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Carregar planilha</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Importe sua planilha de agendamentos. Aceitamos arquivos nos formatos{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">.xlsx</code>{" "}
          e{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">.xls</code>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg space-y-3"  // ← space-y-3 para acomodar botão abaixo
          >
            <div
              onDragEnter={() => setDragActive(true)}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative w-full rounded-2xl border-2 border-dashed p-8",
                "flex flex-col items-center justify-center gap-4 cursor-pointer",
                "transition-all duration-300 ease-in-out group",
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-md",
                parsing && "pointer-events-none opacity-60"
              )}
            >
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
                "bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.06),transparent_70%)]",
                dragActive ? "opacity-100" : "group-hover:opacity-100"
              )} />

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                  dragActive ? "bg-primary/15 scale-110" : "bg-muted group-hover:bg-primary/10 group-hover:scale-105"
                )}>
                  {parsing ? (
                    <div className="h-7 w-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className={cn(
                      "h-7 w-7 transition-colors duration-300",
                      dragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  )}
                </div>

                <div className="text-center space-y-1.5">
                  <p className="text-sm font-medium">
                    {parsing ? "Processando arquivo..." : dragActive ? "Solte o arquivo aqui" : "Clique para selecionar ou arraste o arquivo"}
                  </p>
                  {!parsing && !dragActive && (
                    // ← NOVO: aviso de limite substituiu "Tamanho máximo"
                    <div className="flex items-center justify-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Limite de {ROW_LIMIT} linhas por importação
                      </p>
                    </div>
                  )}
                </div>

                {!parsing && !dragActive && (
                  <Button variant="outline" size="sm" className="mt-1 pointer-events-none rounded-lg" tabIndex={-1}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Selecionar arquivo
                  </Button>
                )}
              </div>

              <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleInput} />
            </div>

            {/* ← NOVO: botão de download do template */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={(e) => { e.stopPropagation(); handleDownloadTemplate() }}
            >
              <Download className="h-4 w-4" />
              Baixar template de importação
            </Button>

            {/* Error message */}
            <AnimatePresence>
              {parseError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <FileWarning className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{parseError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg space-y-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{file.name}</p>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background/60 border border-border/50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold tracking-tight">{rowCount.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Linhas encontradas</p>
                </div>
                <div className="rounded-xl bg-background/60 border border-border/50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold tracking-tight">{colCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Colunas detectadas</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 px-4 py-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Na próxima etapa você poderá revisar e ajustar o mapeamento das colunas antes da importação.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}