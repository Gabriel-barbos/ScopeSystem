import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/Authcontext";
import {
  BadgeMinus, CheckCircle2, Clock, Send, ArrowLeftRight,
  Hash, Search, X, Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ResellerHandler from "../components/ResellerUnits/ResellerHandler";
import {
  useResellerUnits,
  useResellerUnitsSummary,
  useResellerUnitsMutations,
  resellerUnitsApi,
  type ResellerUnit,
} from "@/services/ResellerUnits";
import { toast } from "sonner";
import { ChangeResellerModal } from "@/components/ResellerUnits/ChangeResellerModal";
import { Roles } from "@/utils/roles";
import RoleIf from "@/components/RoleIf";
const SummaryCard = ({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) => (
  <div className="flex items-center gap-3 rounded-md border bg-background p-3">
    <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-${color}-500/10`}>
      <Icon className={`h-5 w-5 text-${color}-500`} />
    </div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold text-${color}-500`}>{value}</p>
    </div>
  </div>
);

const SEARCH_STYLES = {
  not_found: { border: "border-muted bg-muted/30" },
  done:      { border: "border-green-500/30 bg-green-500/5" },
  pending:   { border: "border-yellow-500/30 bg-yellow-500/5" },
} as const;

const SEARCH_CONFIG = {
  not_found: {
    icon: Search, iconColor: "text-muted-foreground",
    title: "ID não encontrado", titleColor: "",
    badgeLabel: null, badgeColor: "",
  },
  done: {
    icon: CheckCircle2, iconColor: "text-green-500",
    title: "Já tratado ✓", titleColor: "text-green-600",
    badgeLabel: "Concluído", badgeColor: "border-green-500/30 text-green-500",
  },
  pending: {
    icon: Clock, iconColor: "text-yellow-500",
    title: "Pendente", titleColor: "text-yellow-600",
    badgeLabel: "Pendente", badgeColor: "border-yellow-500/30 text-yellow-500",
  },
} as const;

function SearchResultBanner({ result, query }: {
  result: ResellerUnit | "not_found"; query: string;
}) {
  const type   = result === "not_found" ? "not_found" : result.status;
  const style  = SEARCH_STYLES[type];
  const config = SEARCH_CONFIG[type];
  const Icon   = config.icon;

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${style.border}`}>
      <Icon className={`h-5 w-5 ${config.iconColor}`} />
      <div>
        <p className={`text-sm font-medium ${config.titleColor}`}>{config.title}</p>
        <p className="text-xs text-muted-foreground">
          {result === "not_found"
            ? `"${query}" não existe no sistema.`
            : `ID "${result.unit_number}" — Enviado em ${new Date(result.createdAt).toLocaleString("pt-BR")}`}
        </p>
      </div>
      {config.badgeLabel && (
        <Badge variant="outline" className={`ml-auto ${config.badgeColor}`}>
          {config.badgeLabel}
        </Badge>
      )}
    </div>
  );
}



export default function ResellerUnits() {
  const { user } = useAuth();
  const [isHandlerView, setIsHandlerView] = useState(false);
  const [textValue, setTextValue]         = useState("");
  const [searchQuery, setSearchQuery]     = useState("");

  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(25);

  const { data: unitsData, isLoading, isFetching } = useResellerUnits({
    page,
    limit,
    status: "pending", 
  });

  const { data: summary } = useResellerUnitsSummary();
  const { bulkCreate, bulkUpdateStatus } = useResellerUnitsMutations();

  const items      = useMemo(() => unitsData?.data ?? [], [unitsData]);
  const pagination = unitsData?.pagination;

  const parsedIds = useMemo(
    () => textValue.split(/[\n,;]+/).map((l) => {
      let val = l.trim();
      // Remove prefixos comuns reportados como IMEI, IMEIÇ, IMEI: 
      val = val.replace(/^IMEI(?:Ç|:|;|-|\s)?\s*/i, '').trim();
      return val;
    }).filter(Boolean),
    [textValue]
  );

  const searchResult = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return items.find((i) => i.unit_number.toLowerCase() === q) ?? "not_found";
  }, [searchQuery, items]);


  const handleCopyAll = useCallback(async () => {
    return resellerUnitsApi.exportUnitNumbers({ status: "pending" });
  }, []);

  const handleSubmit = () => {
    if (!parsedIds.length) return;
    const count = parsedIds.length;
    bulkCreate.mutate(
      { units: parsedIds.map((unit_number) => ({ unit_number, askedBy: user?.name ?? "" })) },
      { 
        onSuccess: () => {
          setTextValue("");
          toast.success("IDs enviados para retirada com sucesso!");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Ocorreu um erro inesperado.");
        }
      }
    );
  };

  const markDone = (ids: string[]) => {
    if (ids.length) bulkUpdateStatus.mutate({ ids, status: "done" });
  };

  const handleBulkMarkDone = (unitNumbers: string[]) => {
    const lower = new Set(unitNumbers.map((n) => n.toLowerCase()));
    const ids   = items
      .filter((i) => lower.has(i.unit_number.toLowerCase()))
      .map((i) => i._id);
    markDone(ids);
  };

  


  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BadgeMinus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Retirada de Reseller</CardTitle>
              <CardDescription>
                {isHandlerView
                  ? "Gerenciar IDs recebidos para tratamento"
                  : "Solicitar Retiradas de Reseller"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RoleIf roles={[Roles.ADMIN, Roles.SUPPORT]}>
            <Button
              variant="outline" size="sm"
              onClick={() => setIsHandlerView((v) => !v)}
              className="flex items-center gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {isHandlerView ? "Voltar ao Envio" : "Tratar IDs"}
            </Button>
            </RoleIf>
            <ChangeResellerModal />
          </div>

        </div>
      </CardHeader>

      <CardContent>
        {isHandlerView ? (
          <ResellerHandler
          items={items.map((i) => ({
              id:          i._id,
              unitNumber:  i.unit_number,
              oldReseller: i.old_reseller,
              newReseller: i.new_reseller,
              submittedAt: new Date(i.createdAt).toLocaleString("pt-BR"),
              askedBy:     i.askedBy,
            }))}
            pagination={pagination}
            isLoading={isLoading}
            isFetching={isFetching}      
            isUpdating={bulkUpdateStatus.isPending}
            onMarkDone={(id) => markDone([id])}
            onMarkAllDone={() =>
              markDone(items.filter((i) => i.status === "pending").map((i) => i._id))
            }
            onBulkMarkDone={handleBulkMarkDone}
            onCopyAll={handleCopyAll}
            // Controle de paginação sobe para cá
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}

          />
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar se um ID já foi tratado..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {searchResult && (
              <SearchResultBanner result={searchResult} query={searchQuery} />
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="md:col-span-3">
                <Textarea
                  placeholder="Cole os IDs aqui... (um por linha, separados por vírgula ou ponto e vírgula)"
                  className="min-h-[280px] resize-none font-mono text-sm"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex h-full flex-col rounded-lg border bg-muted/30 p-4">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Resumo Geral
                  </h3>
                  <div className="space-y-3">
                    <SummaryCard icon={CheckCircle2} label="Concluídos"  value={summary?.done    ?? 0} color="green"  />
                    <SummaryCard icon={Clock}        label="Pendentes"   value={summary?.pending ?? 0} color="yellow" />
                  </div>
                  <div className="flex-1" />
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">IDs para envio</span>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-lg font-bold">
                      {parsedIds.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="h-12 w-full text-base font-semibold"
              size="lg"
              onClick={handleSubmit}
              disabled={!parsedIds.length || bulkCreate.isPending}
            >
              {bulkCreate.isPending
                ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                : <Send    className="mr-2 h-5 w-5" />}
              {bulkCreate.isPending
                ? "Enviando..."
                : `Enviar${parsedIds.length ? ` ${parsedIds.length} ID${parsedIds.length > 1 ? "s" : ""}` : ""}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}