import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FileSpreadsheet, Download, Upload, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { serviceApi, ResolvedVinItem } from "@/services/ServiceService";
import { parseValidationSheet, downloadValidationTemplate, ParsedRow } from "@/utils/parseValidationSheet";


type Step = 1 | 2 | 3;

interface RowStatus {
  parsed: ParsedRow;
  resolved: ResolvedVinItem | null;
  incomplete: boolean; // missing required fields
}

function isIncomplete(row: ParsedRow) {
  const v = row.validationData;
  return !row.vin || !v.deviceId || !v.technician || !v.installationLocation;
}


function StepIndicator({ step, current }: { step: Step; current: Step }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
          done   ? "bg-primary text-primary-foreground" :
          active ? "border-2 border-primary text-primary" :
                   "border-2 border-muted text-muted-foreground"
        )}
      >
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </div>
      <span className={cn("text-xs", active ? "font-medium" : "text-muted-foreground")}>
        {step === 1 ? "Upload" : step === 2 ? "Preview" : "Resultado"}
      </span>
      {step < 3 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
    </div>
  );
}


function RowBadge({ found, incomplete }: { found: boolean; incomplete: boolean }) {
  if (incomplete)
    return <Badge variant="outline" className="text-amber-600 border-amber-400 gap-1"><AlertTriangle className="w-3 h-3" />Incompleto</Badge>;
  if (found)
    return <Badge variant="outline" className="text-green-600 border-green-400 gap-1"><CheckCircle2 className="w-3 h-3" />Encontrado</Badge>;
  return <Badge variant="outline" className="text-red-500 border-red-400 gap-1"><XCircle className="w-3 h-3" />Não encontrado</Badge>;
}


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkValidationModal({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [rows, setRows] = useState<RowStatus[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlyFound, setOnlyFound] = useState(true);
  const [result, setResult] = useState<Awaited<ReturnType<typeof serviceApi.bulkValidation>> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep(1); setRows([]); setFileName(""); setDragActive(false);
    setLoading(false); setOnlyFound(true); setResult(null);
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(reset, 300);
  }

  async function handleFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Formato inválido. Use .xlsx ou .xls"); return;
    }
    setFileName(file.name);
    setLoading(true);

    try {
      const parsed = await parseValidationSheet(file);
      if (parsed.length === 0) { toast.error("Planilha vazia."); return; }
      if (parsed.length > 500) { toast.error("Máximo de 200 registros por lote."); return; }

      const vins = parsed.map((r) => r.vin).filter(Boolean);
      const resolved = await serviceApi.resolveVins(vins);
      const resolvedMap = new Map(resolved.map((r) => [r.vin, r]));

      setRows(
        parsed.map((p) => ({
          parsed: p,
          resolved: resolvedMap.get(p.vin) ?? null,
          incomplete: isIncomplete(p),
        }))
      );
      setStep(2);
    } catch {
      toast.error("Erro ao processar planilha.");
    } finally {
      setLoading(false);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  // ── Step 2: confirm ──
  const validRows = rows.filter((r) => r.resolved?.found && !r.incomplete);
  const canConfirm = validRows.length > 0;

  async function handleConfirm() {
    const toSend = onlyFound
      ? validRows
      : rows.filter((r) => !r.incomplete && r.resolved?.found !== false);

    if (toSend.length === 0) { toast.error("Nenhum registro válido para enviar."); return; }
    setLoading(true);

    try {
      const response = await serviceApi.bulkValidation({
        items: toSend.map((r) => ({ vin: r.parsed.vin, validationData: r.parsed.validationData })),
      });
      setResult(response);
      setStep(3);
    } catch {
      toast.error("Erro ao enviar validação em lote.");
    } finally {
      setLoading(false);
    }
  }

  // ── Summary badges ──
  const found = rows.filter((r) => r.resolved?.found).length;
  const notFound = rows.filter((r) => r.resolved && !r.resolved.found).length;
  const incomplete = rows.filter((r) => r.incomplete).length;


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Validação em Lote</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            {([1, 2, 3] as Step[]).map((s) => <StepIndicator key={s} step={s} current={step} />)}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-4">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg transition-all",
                  "hover:border-primary/50 hover:bg-accent/5",
                  dragActive ? "border-primary bg-accent/10" : "border-muted-foreground/40"
                )}
              >
                <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <label
                  htmlFor="bulk-file-input"
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-12 cursor-pointer"
                >
                  {loading
                    ? <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    : <FileSpreadsheet className={cn("w-12 h-12 transition-colors", dragActive ? "text-primary" : "text-muted-foreground")} />
                  }
                  <p className="mt-3 text-sm font-medium">
                    {loading ? "Processando..." : dragActive ? "Solte aqui" : "Arraste ou clique para enviar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx ou .xls · máximo 200 registros</p>
                </label>
              </div>

              <Button variant="outline" size="sm" className="w-full gap-2" onClick={downloadValidationTemplate}>
                <Download className="w-4 h-4" /> Baixar template
              </Button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Summary badges */}
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {found} encontrado{found !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <XCircle className="w-3.5 h-3.5" /> {notFound} não encontrado{notFound !== 1 ? "s" : ""}
                </div>
                {incomplete > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> {incomplete} com dados incompletos
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Status","Linha","Chassi","Modelo","Placa","Cliente","ID Dispositivo","Técnico","Local"].map((h) => (
                          <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rows.map(({ parsed, resolved, incomplete: inc }) => (
                        <tr key={parsed._line} className="hover:bg-muted/30">
                          <td className="px-3 py-2"><RowBadge found={resolved?.found ?? false} incomplete={inc} /></td>
                          <td className="px-3 py-2 text-muted-foreground">{parsed._line}</td>
                          <td className="px-3 py-2 font-mono">{parsed.vin || "—"}</td>
                          <td className="px-3 py-2">{resolved?.schedule?.model ?? "—"}</td>
                          <td className="px-3 py-2">{resolved?.schedule?.plate ?? parsed.validationData.plate ?? "—"}</td>
                          <td className="px-3 py-2">{resolved?.schedule?.client ?? "—"}</td>
                          <td className="px-3 py-2 font-mono">{parsed.validationData.deviceId ?? <span className="text-red-500">—</span>}</td>
                          <td className="px-3 py-2">{parsed.validationData.technician ?? <span className="text-red-500">—</span>}</td>
                          <td className="px-3 py-2">{parsed.validationData.installationLocation ?? <span className="text-red-500">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <Checkbox id="only-found" checked={onlyFound} onCheckedChange={(c) => setOnlyFound(!!c)} />
                <Label htmlFor="only-found" className="text-sm cursor-pointer">
                  Processar apenas os encontrados ({found})
                </Label>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.summary.created}</p>
                  <p className="text-xs text-muted-foreground">criados</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-muted/50 border">
                  <p className="text-2xl font-bold">{result.summary.skipped}</p>
                  <p className="text-xs text-muted-foreground">pulados</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.summary.errors}</p>
                  <p className="text-xs text-muted-foreground">erros</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Erros detalhados</p>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          {["Linha","Chassi","Motivo"].map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.errors.map((e) => (
                          <tr key={e.line} className="text-red-600 dark:text-red-400">
                            <td className="px-3 py-2">{e.line}</td>
                            <td className="px-3 py-2 font-mono">{e.vin}</td>
                            <td className="px-3 py-2">{e.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t mt-2">
          {step === 2 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setStep(1); setRows([]); setFileName(""); }}>
              ← Outro arquivo
            </Button>
          )}
          {step !== 2 && <span />}

          <div className="flex gap-2">
            {step !== 3 && (
              <Button variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
            )}
            {step === 2 && (
              <Button onClick={handleConfirm} disabled={!canConfirm || loading} className="min-w-28">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />Confirmar e Validar</>}
              </Button>
            )}
            {step === 3 && (
              <Button onClick={() => { onSuccess(); handleClose(); }}>Fechar</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
