import { useState, useMemo, useCallback } from "react";
import {
  CheckCircle2, Clock, Check, ClipboardCopy, ChevronsLeft,
  ChevronLeft, ChevronRight, ChevronsRight, Search, Upload, Loader2,
} from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/services/ResellerUnits";


export interface ResellerHandlerItem {
  id:          string;
  oldReseller: string;
  newReseller: string;
  unitNumber:  string;
  submittedAt: string;
  askedBy:     string;
}

interface ResellerHandlerProps {
  items:       ResellerHandlerItem[];
  pagination?: PaginationMeta;       
  isLoading?:  boolean;
  isFetching?: boolean;                 
  isUpdating?: boolean;
  onMarkDone:      (id: string)          => void;
  onMarkAllDone:   ()                    => void;
  onBulkMarkDone:  (unitNumbers: string[]) => void;
  onPageChange:    (page: number)        => void;
  onLimitChange:   (limit: number)       => void;
    onCopyAll: () => Promise<string[]>; 

}

const PAGE_SIZES = [10, 25, 50, 100];


const parseTextIds = (text: string) =>
  text.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);

const plural = (count: number, singular: string, pluralSuffix = "s") =>
  `${count} ${singular}${count !== 1 ? pluralSuffix : ""}`;


function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="mb-3 h-8 w-8 animate-spin" />
      <p className="text-sm">Carregando dados...</p>
    </div>
  );
}

function ActionButton({ onClick, disabled, loading, icon: Icon, label, loadingLabel, variant = "outline", className }: {
  onClick:       () => void;
  disabled?:     boolean;
  loading?:      boolean;
  icon:          React.ElementType;
  label:         string;
  loadingLabel?: string;
  variant?:      "outline" | "ghost" | "default";
  className?:    string;
}) {
  return (
    <Button variant={variant} size="sm" onClick={onClick} disabled={disabled} className={className}>
      {loading
        ? <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        : <Icon    className="mr-1 h-4 w-4" />}
      {loading ? (loadingLabel ?? label) : label}
    </Button>
  );
}

function PaginationButton({ onClick, disabled, icon: Icon }: {
  onClick: () => void; disabled: boolean; icon: React.ElementType;
}) {
  return (
    <Button variant="outline" size="icon" className="h-8 w-8" onClick={onClick} disabled={disabled}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Clock className="mb-2 h-8 w-8" />
          <p className="text-sm">Nenhum ID pendente no momento.</p>
        </div>
      </TableCell>
    </TableRow>
  );
}


export default function ResellerHandler({
  items, pagination, isLoading = false, isFetching = false,
  isUpdating = false, onMarkDone, onMarkAllDone, onBulkMarkDone,
  onPageChange, onLimitChange, onCopyAll,
}: ResellerHandlerProps) {
  const [bulkText,      setBulkText]      = useState("");
  const [showBulkArea,  setShowBulkArea]  = useState(false);
  const [copySuccess,   setCopySuccess]   = useState(false);
const [copyLoading, setCopyLoading] = useState(false);

  const bulkIds = useMemo(() => parseTextIds(bulkText), [bulkText]);


  const handleBulkSubmit = useCallback(() => {
    if (!bulkIds.length) return;
    onBulkMarkDone(bulkIds);
    setBulkText("");
    setShowBulkArea(false);
  }, [bulkIds, onBulkMarkDone]);

  const closeBulk = useCallback(() => {
    setBulkText("");
    setShowBulkArea(false);
  }, []);

const handleCopyAll = useCallback(async () => {
  try {
    setCopyLoading(true);                    
    const allUnitNumbers = await onCopyAll();
    const text = allUnitNumbers.join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  } finally {
    setCopyLoading(false);
  }
}, [onCopyAll]);


  if (isLoading) return <LoadingSpinner />;

  const currentPage  = pagination?.page       ?? 1;
  const totalPages   = pagination?.totalPages  ?? 1;
  const total        = pagination?.total       ?? items.length;
  const currentLimit = pagination?.limit       ?? 25;


  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Atualizando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ActionButton
            onClick={() => setShowBulkArea((v) => !v)}
            icon={Upload}
            label={showBulkArea ? "Fechar Bulk" : "Atualizar em Bulk"}
          />
       <ActionButton
  onClick={handleCopyAll}
  disabled={!items.length || copyLoading}
  loading={copyLoading}               // spinner enquanto busca
  icon={ClipboardCopy}
  label={copySuccess ? "Copiado! ✓" : "Copiar Todos"}
  loadingLabel="Buscando..."
/>
          <ActionButton
            onClick={onMarkAllDone}
            disabled={!items.length || isUpdating}
            loading={isUpdating}
            icon={Check}
            label="Concluir Página"
            loadingLabel="Atualizando..."
          />
        </div>
      </div>

      {/* Bulk Area */}
      {showBulkArea && (
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Atualização em Massa</h4>
            <p className="text-xs text-muted-foreground">
              Cole os IDs que já foram tratados para marcá-los como concluídos.
            </p>
          </div>
          <Textarea
            placeholder="Cole os IDs tratados aqui... (um por linha, separados por vírgula ou ponto e vírgula)"
            className="min-h-[120px] resize-none font-mono text-sm"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {plural(bulkIds.length, "ID")} detectado{bulkIds.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={closeBulk}>Cancelar</Button>
              <ActionButton
                onClick={handleBulkSubmit}
                disabled={!bulkIds.length || isUpdating}
                loading={isUpdating}
                icon={Check}
                label={`Marcar ${plural(bulkIds.length, "como Concluído")}`}
                variant="default"
              />
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Tabela */}
      <div className={`rounded-lg border transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Unit Number</TableHead>
              <TableHead>Old Reseller</TableHead>
              <TableHead>Current Reseller</TableHead>
              <TableHead>Enviado em</TableHead>
              <TableHead>Solicitado por</TableHead>
              <TableHead className="w-28 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!items.length ? (
              <EmptyState />
            ) : (
              items.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {(currentPage - 1) * currentLimit + i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium">
                    {item.unitNumber}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.oldReseller || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.newReseller || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.submittedAt}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.askedBy || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButton
                      onClick={() => onMarkDone(item.id)}
                      disabled={isUpdating}
                      icon={Check}
                      label="Concluir"
                      variant="ghost"
                      className="text-green-500 hover:bg-green-500/10 hover:text-green-600"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Exibindo</span>
          <Select
            value={String(currentLimit)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>de {plural(total, "pendente")}</span>
        </div>

        <div className="flex items-center gap-1">
          {([
            [ChevronsLeft,  1],
            [ChevronLeft,   currentPage - 1],
          ] as const).map(([Icon, target], i) => (
            <PaginationButton
              key={`prev-${i}`} icon={Icon}
              onClick={() => onPageChange(target)}
              disabled={!pagination?.hasPrev}
            />
          ))}

          <span className="px-3 text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          {([
            [ChevronRight,  currentPage + 1],
            [ChevronsRight, totalPages],
          ] as const).map(([Icon, target], i) => (
            <PaginationButton
              key={`next-${i}`} icon={Icon}
              onClick={() => onPageChange(target)}
              disabled={!pagination?.hasNext}
            />
          ))}
        </div>
      </div>
    </div>
  );
}