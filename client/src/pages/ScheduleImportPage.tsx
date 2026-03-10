import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SCHEDULE_IMPORT_COLUMNS } from "@/utils/ScheduleImportconfig"
import { Step1Upload } from "@/components/imports/steps/Step1Upload"
import { Step2ColumnMapping } from "@/components/imports/steps/Step2ColumnMapping"
import { Step3Validation } from "@/components/imports/steps/Step3Validation"
import { Step4Summary } from "@/components/imports/steps/Step4Summary"
import type { RowError } from "@/components/imports/steps/Step3Validation"
import { useScheduleService } from "@/services/ScheduleService"
import { useAuth } from "@/context/Authcontext"
import { buildSchedulePayload } from "@/utils/Buildschedulepayload"
import { toast } from "sonner"

type ImportStatus = "idle" | "loading" | "success" | "error"

function normalizeKey(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
}

function buildInitialMapping(excelCols: string[]): Record<string, string> {
  const lookup = Object.fromEntries(
    SCHEDULE_IMPORT_COLUMNS.flatMap(({ header, aliases = [], field }) =>
      [header, ...aliases].filter(Boolean).map((key) => [normalizeKey(key), field])
    )
  )
  return Object.fromEntries(
    excelCols.flatMap((col) => {
      const field = lookup[normalizeKey(col)]
      return field ? [[col, field]] : []
    })
  )
}

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Colunas" },
  { id: 3, label: "Validação" },
  { id: 4, label: "Confirmação" },
]

export default function ScheduleImportPage() {
  const navigate = useNavigate()
  const { bulkCreateSchedules } = useScheduleService()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [excelColumns, setExcelColumns] = useState<string[]>([])

  // rawRows: linhas brutas do Excel (colunas originais)
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([])

  // matchedRows: rawRows enriquecidas com ClienteId / EquipamentoId pelo Step 3
  const [matchedRows, setMatchedRows] = useState<Record<string, any>[]>([])

  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<RowError[]>([])
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle")
  const [importError, setImportError] = useState<string>()

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileLoaded = (f: File, columns: string[], rows: Record<string, any>[]) => {
    setFile(f)
    setExcelColumns(columns)
    setRawRows(rows)
    setMatchedRows(rows) 
    setMapping(buildInitialMapping(columns))
    setErrors([])
    setImportStatus("idle")
    setImportError(undefined)
  }

  const handleConfirmImport = async () => {
    setImportStatus("loading")
    try {
      // matchedRows já tem ClienteId / EquipamentoId populados pelo Step 3
      const payload = buildSchedulePayload(matchedRows, mapping, {
        createdBy: user?.name || "Sistema",
      })
      await bulkCreateSchedules.mutateAsync(payload)
      setImportStatus("success")
      toast.success(`${payload.length} agendamentos importados com sucesso!`)
    } catch (err: any) {
      setImportStatus("error")
      const msg = err?.response?.data?.error ?? err?.message ?? "Erro desconhecido"
      setImportError(msg)
      toast.error("Erro ao importar agendamentos")
    }
  }

  const canAdvance = () => {
    if (step === 1) return !!file && rawRows.length > 0
    if (step === 2) return Object.keys(mapping).length > 0
    if (step === 3) return errors.length === 0
    return false
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-page-background">
      <div className=" mx-auto px-4 py-8 space-y-8">

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Importação em massa</h1>
            <p className="text-sm text-muted-foreground">
              {rawRows.length > 0
                ? `${rawRows.length} linhas carregadas — ${file?.name}`
                : "Agendamentos"}
            </p>
          </div>
        </div>

        <Stepper current={step} steps={STEPS} />

        <div className="rounded-2xl border border-border bg-card px-6 py-8 shadow-sm min-h-[320px]">
          {step === 1 && (
            <Step1Upload onFileLoaded={handleFileLoaded} />
          )}
          {step === 2 && (
            <Step2ColumnMapping
              excelColumns={excelColumns}
              mapping={mapping}
              onMappingChange={setMapping}
            />
          )}
          {step === 3 && (
            // Step 3 recebe rawRows e mapping, e devolve matchedRows + errors
            <Step3Validation
              rows={rawRows}
              mapping={mapping}
              onRowsChange={setMatchedRows}
              onErrorsChange={setErrors}
            />
          )}
          {step === 4 && (
            <Step4Summary
              rows={matchedRows}
              status={importStatus}
              errorMessage={importError}
              onConfirm={handleConfirmImport}
            />
          )}
        </div>

        {importStatus === "idle" && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 1))} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            {step < 4 && (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
                Avançar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {(importStatus === "success" || importStatus === "error") && (
          <div className="flex justify-center gap-3">
            {importStatus === "error" && (
              <Button variant="outline" onClick={() => setImportStatus("idle")}>
                Tentar novamente
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/appointments")}>
              Voltar para Agendamentos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stepper ──────────────────────────────────────────────────────────────────

interface StepperProps {
  current: number
  steps: { id: number; label: string }[]
}

function Stepper({ current, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((s, i) => {
        const isDone = s.id < current
        const isActive = s.id === current
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                isDone && "bg-primary border-primary text-primary-foreground",
                isActive && "border-primary text-primary bg-primary/10",
                !isDone && !isActive && "border-border text-muted-foreground bg-background"
              )}>
                {isDone ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={cn(
                "text-xs font-medium whitespace-nowrap",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-px mx-3 mb-5 transition-colors",
                isDone ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}