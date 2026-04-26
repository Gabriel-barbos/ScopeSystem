import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  FileSpreadsheet, Download, Upload, CheckCircle2, XCircle, AlertTriangle,
  AlertCircle, ChevronRight, Loader2, Trash2, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadValidationTemplate } from "@/utils/parseValidationSheet";
import { useBulkValidation, type Step, type ProcessedRow, PAGE_SIZE } from "./useBulkValidation";

// ── Sub-components ──

function StepIndicator({ step, current }: { step: Step; current: Step }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
        done ? "bg-primary text-primary-foreground" :
        active ? "border-2 border-primary text-primary bg-primary/10" :
        "border-2 border-muted text-muted-foreground"
      )}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </div>
      <span className={cn("text-xs", active ? "font-medium" : "text-muted-foreground")}>
        {step === 1 ? "Upload" : step === 2 ? "Revisão" : "Resultado"}
      </span>
      {step < 3 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
    </div>
  );
}

function ProgressBar({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/90 px-3 py-2.5 border-b border-border">
        <div className="h-3 w-32 rounded bg-muted-foreground/20" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-3 py-2.5 border-b border-border/50 animate-pulse">
          <div className="h-3 w-4 rounded bg-muted-foreground/10" />
          <div className="h-3 w-32 rounded bg-muted-foreground/10" />
          <div className="h-3 w-40 rounded bg-muted-foreground/10" />
          <div className="h-3 w-24 rounded bg-muted-foreground/10" />
          <div className="h-3 w-28 rounded bg-muted-foreground/10" />
        </div>
      ))}
    </div>
  );
}

function SummaryBadges({ found, notFound, errors, duplicates, total }: {
  found: number; notFound: number; errors: number; duplicates: number; total: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border">
        <FileSpreadsheet className="w-3 h-3 text-muted-foreground" /> {total} total
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> {found} encontrado{found !== 1 ? "s" : ""}
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
        <XCircle className="w-3 h-3" /> {notFound} não encontrado{notFound !== 1 ? "s" : ""}
      </div>
      {errors > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3" /> {errors} com erro{errors !== 1 ? "s" : ""}
        </div>
      )}
      {duplicates > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
          <AlertCircle className="w-3 h-3" /> {duplicates} duplicado{duplicates !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function RowErrorTooltip({ errors }: { errors: string[] }) {
  if (errors.length === 0) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 opacity-60" />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[240px] space-y-1">
        {errors.map((e, i) => <p key={i} className="text-xs">• {e}</p>)}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Main Component ──

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkValidationModal({ open, onOpenChange, onSuccess }: Props) {
  const vm = useBulkValidation();

  const close = () => { onOpenChange(false); setTimeout(vm.reset, 300); };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); vm.setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) vm.handleFile(f); };
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); vm.setDragActive(e.type === "dragenter" || e.type === "dragover"); };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Validação em Lote</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            {([1, 2, 3] as Step[]).map((s) => <StepIndicator key={s} step={s} current={vm.step} />)}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-4">

          {/* ── Step 1: Upload ── */}
          {vm.step === 1 && (
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl transition-all duration-200",
                  "hover:border-primary/50 hover:bg-accent/5",
                  vm.dragActive ? "border-primary bg-accent/10 scale-[1.005]" : "border-muted-foreground/40"
                )}
              >
                <input ref={vm.inputRef} type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) vm.handleFile(f); }} />
                <label
                  onClick={() => vm.inputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-14 cursor-pointer"
                >
                  {vm.isProcessing
                    ? <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    : <FileSpreadsheet className={cn("w-14 h-14 transition-colors", vm.dragActive ? "text-primary" : "text-muted-foreground")} />
                  }
                  <p className="mt-3 text-sm font-medium">
                    {vm.isProcessing ? "Processando..." : vm.dragActive ? "Solte aqui" : "Arraste ou clique para enviar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx ou .xls · máximo 500 registros</p>
                </label>
              </div>

              {vm.isProcessing && <ProgressBar progress={vm.progress} label={vm.progressLabel} />}
              {vm.isProcessing && <SkeletonTable />}

              <Button variant="outline" size="sm" className="w-full gap-2" onClick={downloadValidationTemplate}>
                <Download className="w-4 h-4" /> Baixar template
              </Button>

              <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 px-4 py-3">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Preencha a planilha com os dados de validação. Campos obrigatórios: <strong>Chassi</strong>, <strong>ID Dispositivo</strong>, <strong>Técnico</strong> e <strong>Local de Instalação</strong>.
                  Bloqueio Ativo aceita: Sim/Não, S/N, 1/0. Datas no formato DD/MM/AAAA.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {vm.step === 2 && (
            <TooltipProvider delayDuration={200}>
              <div className="space-y-4">
                <SummaryBadges
                  found={vm.foundCount} notFound={vm.notFoundCount}
                  errors={vm.errorCount} duplicates={vm.duplicateCount}
                  total={vm.allRows.length}
                />

                {vm.errorCount > 0 && (
                  <div className="rounded-lg border border-amber-400/50 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-600/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {vm.errorCount} linha{vm.errorCount > 1 ? "s" : ""} com problemas — apenas as válidas ({vm.validCount}) serão processadas
                      </p>
                      <Button variant="outline" size="sm" onClick={() => vm.setShowOnlyErrors((v) => !v)} className="h-7 text-xs gap-1 ml-auto">
                        {vm.showOnlyErrors ? <><ChevronDown className="h-3 w-3" />Todas</> : <><ChevronUp className="h-3 w-3" />Só erros</>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <ScrollArea className="h-[420px] rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
                      <tr className="border-b border-border">
                        {["", "#", "Chassi", "Modelo", "Placa", "Cliente", "Produto", "ID Disp.", "Técnico", "Local", ""].map((h, i) => (
                          <th key={i} className="text-left px-2.5 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vm.rows.map((row) => (
                        <PreviewRow
                          key={row.parsed._line}
                          row={row}
                          products={vm.products}
                          onDelete={() => vm.handleDeleteRow(row.parsed._line)}
                          onProductChange={(id) => vm.handleProductChange(row.parsed._line, id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>

                {/* Pagination */}
                {vm.totalPages > 1 && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                      Exibindo{" "}
                      <span className="font-medium text-foreground">
                        {(vm.currentPage - 1) * PAGE_SIZE + 1}–{Math.min(vm.currentPage * PAGE_SIZE, vm.displayRowsCount)}
                      </span>{" "}
                      de <span className="font-medium text-foreground">{vm.displayRowsCount}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                        onClick={() => vm.setCurrentPage((p) => Math.max(1, p - 1))} disabled={vm.currentPage === 1}>
                        Anterior
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">{vm.currentPage} / {vm.totalPages}</span>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                        onClick={() => vm.setCurrentPage((p) => Math.min(vm.totalPages, p + 1))} disabled={vm.currentPage === vm.totalPages}>
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TooltipProvider>
          )}

          {/* ── Step 3: Result ── */}
          {vm.step === 3 && vm.result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{vm.result.summary.created}</p>
                  <p className="text-xs text-muted-foreground">criados</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-muted/50 border">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{vm.result.summary.skipped}</p>
                  <p className="text-xs text-muted-foreground">pulados</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mb-1" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{vm.result.summary.errors}</p>
                  <p className="text-xs text-muted-foreground">erros</p>
                </div>
              </div>

              {vm.result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Erros detalhados</p>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          {["Linha", "Chassi", "Motivo"].map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {vm.result.errors.map((e) => (
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
          {vm.step === 2 ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { vm.setStep(1); vm.setRows([]); vm.setFileName(""); }}>
              ← Outro arquivo
            </Button>
          ) : <span />}

          <div className="flex gap-2">
            {vm.step !== 3 && (
              <Button variant="outline" onClick={close} disabled={vm.isProcessing || vm.isSubmitting}>Cancelar</Button>
            )}
            {vm.step === 2 && (
              <Button onClick={vm.handleConfirm} disabled={vm.validCount === 0 || vm.isSubmitting} className="min-w-32">
                {vm.isSubmitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                  : <><Upload className="w-4 h-4 mr-2" />Validar {vm.validCount} registro{vm.validCount !== 1 ? "s" : ""}</>
                }
              </Button>
            )}
            {vm.step === 3 && (
              <Button onClick={() => { onSuccess(); close(); }}>Fechar</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Table Row ──

function PreviewRow({ row, products, onDelete, onProductChange }: {
  row: ProcessedRow;
  products: { _id: string; name: string }[];
  onDelete: () => void;
  onProductChange: (id: string) => void;
}) {
  const { parsed, resolved, productMatch, errors } = row;
  const v = parsed.validationData;
  const hasError = errors.length > 0;
  const hasProductInSheet = !!v.product;

  return (
    <tr className={cn(
      "border-b border-border/50 transition-colors",
      hasError ? "bg-amber-50/60 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "hover:bg-muted/30"
    )}>
      <td className="px-2.5 py-2"><RowErrorTooltip errors={errors} /></td>
      <td className="px-2.5 py-2 text-muted-foreground">{parsed._line}</td>
      <td className="px-2.5 py-2 font-mono">{parsed.vin || <span className="text-red-500">—</span>}</td>
      <td className="px-2.5 py-2">{resolved?.schedule?.model ?? "—"}</td>
      <td className="px-2.5 py-2">{resolved?.schedule?.plate ?? v.plate ?? "—"}</td>
      <td className="px-2.5 py-2 max-w-[140px] truncate">{resolved?.schedule?.client ?? "—"}</td>
      <td className="px-2.5 py-2">
        {hasProductInSheet ? (
          <Select value={productMatch?.id ?? ""} onValueChange={onProductChange}>
            <SelectTrigger className={cn(
              "h-7 text-xs min-w-[130px] max-w-[180px]",
              productMatch
                ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20"
                : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/20"
            )}>
              <div className="flex items-center gap-1.5 w-full overflow-hidden">
                {productMatch
                  ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  : <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                }
                <span className="truncate">{productMatch?.name ?? v.product ?? "Selecionar..."}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="px-2.5 py-2 font-mono">{v.deviceId ?? <span className="text-red-500 font-sans">—</span>}</td>
      <td className="px-2.5 py-2">{v.technician ?? <span className="text-red-500">—</span>}</td>
      <td className="px-2.5 py-2 max-w-[120px] truncate">{v.installationLocation ?? <span className="text-red-500">—</span>}</td>
      <td className="px-2.5 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remover linha</TooltipContent>
        </Tooltip>
      </td>
    </tr>
  );
}
