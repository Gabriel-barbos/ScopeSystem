import { useRef, useState } from "react"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step1UploadProps {
  onFileLoaded: (file: File, columns: string[], rows: Record<string, any>[]) => void
}

export function Step1Upload({ onFileLoaded }: Step1UploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = async (f: File) => {
    const XLSX = await import("xlsx")
    const reader = new FileReader()

    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]

     
      const [headerRow] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]
      const columns = (headerRow ?? []).filter(Boolean)


      const rows = XLSX.utils.sheet_to_json(ws, {
        defVal: "",
      }) as Record<string, any>[]

      setFile(f)
      onFileLoaded(f, columns, rows)
    }

    reader.readAsBinaryString(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f?.name.match(/\.(xlsx|xls)$/)) processFile(f)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const clearFile = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Carregar planilha</h2>
        <p className="text-sm text-muted-foreground">
          Selecione ou arraste um arquivo <span className="font-medium">.xlsx</span> ou <span className="font-medium">.xls</span>
        </p>
      </div>

      {!file ? (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full max-w-md h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <Upload className={cn("h-10 w-10", dragActive ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm text-muted-foreground">
            {dragActive ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleInput}
          />
        </div>
      ) : (
        <div className="w-full max-w-md flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <FileSpreadsheet className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}