import { useState, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { serviceApi, type ResolvedVinItem, type BulkValidationResponse } from "@/services/ServiceService";
import { parseValidationSheet, type ParsedRow } from "@/utils/parseValidationSheet";
import { useProductService } from "@/services/ProductService";
import { findBestMatch } from "@/utils/Matchutils";

// ── Constants ──
export const CHUNK_SIZE = 50;
export const PAGE_SIZE = 50;

// ── Types ──
export type Step = 1 | 2 | 3;
export type Phase = "idle" | "parsing" | "resolving" | "matching" | "ready" | "submitting" | "done";

export interface ProcessedRow {
  parsed: ParsedRow;
  resolved: ResolvedVinItem | null;
  productMatch: { id: string; name: string } | null;
  errors: string[];
  isDuplicate: boolean;
}

// ── Validation ──
export function validateRow(
  row: ParsedRow,
  resolved: ResolvedVinItem | null,
  productMatch: { id: string; name: string } | null,
  isDuplicate: boolean
): string[] {
  const errors: string[] = [];
  const v = row.validationData;
  if (!row.vin) errors.push("Chassi ausente");
  else if (isDuplicate) errors.push("Chassi duplicado na planilha");
  if (!resolved?.found) errors.push("Agendamento não encontrado");
  if (!v.deviceId) errors.push("ID Dispositivo obrigatório");
  if (!v.technician) errors.push("Técnico obrigatório");
  if (!v.installationLocation) errors.push("Local de Instalação obrigatório");
  if (v.product && !productMatch) errors.push(`Produto "${v.product}" não encontrado`);
  return errors;
}

function recomputeDuplicates(rows: ProcessedRow[]): ProcessedRow[] {
  const vinMap = new Map<string, number[]>();
  rows.forEach((r, i) => {
    if (!r.parsed.vin) return;
    vinMap.set(r.parsed.vin.toUpperCase(), [...(vinMap.get(r.parsed.vin.toUpperCase()) ?? []), i]);
  });
  const dups = new Set<number>();
  vinMap.forEach((idxs) => { if (idxs.length > 1) idxs.forEach((i) => dups.add(i)); });
  return rows.map((r, i) => {
    const isDup = dups.has(i);
    const errors = validateRow(r.parsed, r.resolved, r.productMatch, isDup);
    return { ...r, isDuplicate: isDup, errors };
  });
}

// ── Hook ──
export function useBulkValidation() {
  const [step, setStep] = useState<Step>(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<BulkValidationResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<{ cancelled: boolean } | null>(null);

  const { data: productsData } = useProductService();
  const products = useMemo(() => (productsData as { _id: string; name: string }[]) ?? [], [productsData]);

  function reset() {
    if (abortRef.current) abortRef.current.cancelled = true;
    setStep(1); setPhase("idle"); setProgress(0); setRows([]); setFileName("");
    setDragActive(false); setResult(null); setCurrentPage(1); setShowOnlyErrors(false);
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) { toast.error("Formato inválido. Use .xlsx ou .xls"); return; }
    if (abortRef.current) abortRef.current.cancelled = true;
    const abort = { cancelled: false };
    abortRef.current = abort;
    setFileName(file.name);
    setPhase("parsing");
    setProgress(5);

    try {
      const parsed = await parseValidationSheet(file);
      if (abort.cancelled) return;
      if (parsed.length === 0) { toast.error("Planilha vazia."); setPhase("idle"); return; }
      if (parsed.length > 500) { toast.error("Máximo de 500 registros por lote."); setPhase("idle"); return; }

      // Resolve VINs
      setPhase("resolving"); setProgress(15);
      const vins = parsed.map((r) => r.vin).filter(Boolean);
      const resolved = await serviceApi.resolveVins(vins);
      if (abort.cancelled) return;
      const resolvedMap = new Map(resolved.map((r) => [r.vin.toUpperCase(), r]));

      // Duplicates
      const vinMap = new Map<string, number[]>();
      parsed.forEach((p, i) => {
        if (!p.vin) return;
        vinMap.set(p.vin.toUpperCase(), [...(vinMap.get(p.vin.toUpperCase()) ?? []), i]);
      });
      const dupSet = new Set<number>();
      vinMap.forEach((idxs) => { if (idxs.length > 1) idxs.forEach((i) => dupSet.add(i)); });

      // Product matching in chunks
      setPhase("matching"); setProgress(30);
      const pmResults: Record<number, { id: string; name: string } | null> = {};

      await new Promise<void>((res) => {
        let proc = 0;
        function chunk() {
          if (abort.cancelled) { res(); return; }
          const end = Math.min(proc + CHUNK_SIZE, parsed.length);
          for (let i = proc; i < end; i++) {
            const pn = parsed[i].validationData.product;
            if (pn && products.length) {
              const m = findBestMatch(pn, products);
              pmResults[i] = m ? { id: m.id, name: m.name } : null;
            } else { pmResults[i] = null; }
          }
          proc = end;
          setProgress(30 + Math.round((proc / parsed.length) * 60));
          if (proc < parsed.length) setTimeout(chunk, 0); else res();
        }
        setTimeout(chunk, 0);
      });
      if (abort.cancelled) return;

      // Build rows
      const processed: ProcessedRow[] = parsed.map((p, i) => {
        const res = resolvedMap.get(p.vin.toUpperCase()) ?? null;
        const pm = pmResults[i] ?? null;
        const isDup = dupSet.has(i);
        return { parsed: p, resolved: res, productMatch: pm, errors: validateRow(p, res, pm, isDup), isDuplicate: isDup };
      });

      setRows(processed); setStep(2); setPhase("ready"); setProgress(100); setCurrentPage(1);
    } catch {
      if (!abort.cancelled) { toast.error("Erro ao processar planilha."); setPhase("idle"); }
    }
  }, [products]);

  const handleDeleteRow = useCallback((line: number) => {
    setRows((prev) => recomputeDuplicates(prev.filter((r) => r.parsed._line !== line)));
  }, []);

  const handleProductChange = useCallback((line: number, productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setRows((prev) => recomputeDuplicates(prev.map((r) =>
      r.parsed._line === line ? { ...r, productMatch: { id: product._id, name: product.name } } : r
    )));
  }, [products]);

  const handleConfirm = useCallback(async () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) { toast.error("Nenhum registro válido para enviar."); return; }
    setPhase("submitting");
    try {
      const resp = await serviceApi.bulkValidation({
        items: valid.map((r) => ({
          vin: r.parsed.vin,
          validationData: {
            ...r.parsed.validationData,
            product: r.productMatch?.id ?? r.parsed.validationData.product,
          },
        })),
      });
      setResult(resp); setStep(3); setPhase("done");
    } catch { toast.error("Erro ao enviar validação em lote."); setPhase("ready"); }
  }, [rows]);

  // Derived
  const isProcessing = phase === "parsing" || phase === "resolving" || phase === "matching";
  const isSubmitting = phase === "submitting";
  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const validCount = rows.length - errorCount;
  const foundCount = rows.filter((r) => r.resolved?.found).length;
  const notFoundCount = rows.filter((r) => r.resolved && !r.resolved.found).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  const displayRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => (b.errors.length > 0 ? 1 : 0) - (a.errors.length > 0 ? 1 : 0));
    return showOnlyErrors ? sorted.filter((r) => r.errors.length > 0) : sorted;
  }, [rows, showOnlyErrors]);

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE);
  const pagedRows = displayRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const progressLabel = phase === "parsing" ? "Lendo planilha…"
    : phase === "resolving" ? "Verificando agendamentos…"
    : phase === "matching" ? "Identificando produtos…" : "";

  return {
    step, phase, progress, progressLabel, rows: pagedRows, allRows: rows, fileName,
    result, dragActive, currentPage, totalPages, showOnlyErrors, inputRef,
    isProcessing, isSubmitting, errorCount, validCount, foundCount, notFoundCount, duplicateCount,
    displayRowsCount: displayRows.length, products,
    reset, handleFile, handleClose: (onOpenChange: (o: boolean) => void) => { onOpenChange(false); setTimeout(reset, 300); },
    handleDeleteRow, handleProductChange, handleConfirm,
    setDragActive, setCurrentPage, setShowOnlyErrors, setStep, setRows, setFileName,
  };
}
