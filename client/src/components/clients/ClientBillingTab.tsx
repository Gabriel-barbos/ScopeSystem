import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cpu,
  Wrench,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Car,
  PlusCircle,
  MinusCircle,
  Calendar,
} from "lucide-react";

// ---------- MOCK DATA ----------
const contractedTechnologies = [
  { name: "GV50CG + BLOQUEIO", vehicles: 2450 },
  { name: "FM130 + Identificação de motorista", vehicles: 1890 },
  { name: "GV50 + Buzzer", vehicles: 895 },
];

const installationTypes = [
  { name: "PDI", vehicles: 3120 },
  { name: "in Loco", vehicles: 1580 },
  { name: "Pátio", vehicles: 535 },
];

const currentBilling = {
  generatedAt: "29/04/2026",
  period: "Abril / 2026",
  activeVehicles: 5235,
  newInstallations: 352,
  removals: 23,
  monthlyFee: 48200,
  installationsFee: 5280,
  removalsDiscount: -1480,
  total: 52000,
};

const billingHistory = [
  {
    date: "01/04/2026",
    period: "Mar/2026",
    vehicles: 4906,
    installations: 298,
    removals: 41,
    monthlyFee: 45100,
    total: 49870,
  },
  {
    date: "01/03/2026",
    period: "Fev/2026",
    vehicles: 4649,
    installations: 215,
    removals: 18,
    monthlyFee: 42780,
    total: 46210,
  },
  {
    date: "01/02/2026",
    period: "Jan/2026",
    vehicles: 4452,
    installations: 187,
    removals: 32,
    monthlyFee: 40970,
    total: 43890,
  },
  {
    date: "01/01/2026",
    period: "Dez/2025",
    vehicles: 4297,
    installations: 264,
    removals: 27,
    monthlyFee: 39530,
    total: 43680,
  },
  {
    date: "01/12/2025",
    period: "Nov/2025",
    vehicles: 4060,
    installations: 198,
    removals: 35,
    monthlyFee: 37350,
    total: 40540,
  },
  {
    date: "01/11/2025",
    period: "Out/2025",
    vehicles: 3897,
    installations: 172,
    removals: 22,
    monthlyFee: 35850,
    total: 38620,
  },
];

// ---------- HELPERS ----------
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value);

export function ClientBillingTab({ clientId }: { clientId: string }) {
  // TODO: Implementar busca real de faturamento usando o clientId
  void clientId;

  const handleRecalculate = () => {
    // TODO: Implementar recálculo (recarrega a página)
    window.location.reload();
  };

  const handleGenerateSpreadsheet = () => {
    // TODO: Implementar geração de planilha
  };

  return (
    <div className="space-y-6">
      {/* Header com botão Recalcular */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Faturamento do contrato
          </h2>
          <p className="text-sm text-muted-foreground">
            Resumo da tecnologia contratada e histórico de cobranças
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecalculate}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Recalcular
        </Button>
      </div>

      {/* Grid de informações do contrato */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tecnologia contratada */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Cpu className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">
                Tecnologia contratada
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {contractedTechnologies.map((tech) => (
              <div
                key={tech.name}
                className="flex items-start justify-between gap-3 border-b border-dashed border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium leading-tight">
                  {tech.name}
                </span>
                <Badge variant="secondary" className="shrink-0 font-mono">
                  {formatNumber(tech.vehicles)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tipo de instalação */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Wrench className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">
                Tipo de instalação
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {installationTypes.map((type) => (
              <div
                key={type.name}
                className="flex items-start justify-between gap-3 border-b border-dashed border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium leading-tight">
                  {type.name}
                </span>
                <Badge variant="secondary" className="shrink-0 font-mono">
                  {formatNumber(type.vehicles)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notinha fiscal */}
        <InvoiceCard onGenerateSpreadsheet={handleGenerateSpreadsheet} />
      </div>

      {/* Histórico de faturamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de faturamento</CardTitle>
          <CardDescription>
            Últimos 6 meses de cobranças emitidas para o cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Referência</TableHead>
                  <TableHead className="text-right font-semibold">
                    Veículos
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Instalações
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Remoções
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Mensalidade
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Total
                  </TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((item) => (
                  <TableRow key={item.date} className="group">
                    <TableCell className="font-medium tabular-nums">
                      {item.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.period}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(item.vehicles)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatNumber(item.installations)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-rose-600 dark:text-rose-400">
                      -{formatNumber(item.removals)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.monthlyFee)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100"
                        title="Baixar planilha"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- INVOICE CARD ----------
function InvoiceCard({
  onGenerateSpreadsheet,
}: {
  onGenerateSpreadsheet: () => void;
}) {
  return (
    <div className="relative">
      {/* Wrapper que cria a forma da nota com serrilhado */}
      <div
        className="relative bg-card text-card-foreground shadow-lg ring-1 ring-border/60"
        style={{
          // Serrilhado na parte inferior usando radial-gradient como mask
          WebkitMask:
            "radial-gradient(circle at 8px 100%, transparent 6px, #000 6.5px) 0 100%/16px 100% repeat-x, linear-gradient(#000 0 0) 0 0/100% calc(100% - 8px) no-repeat",
          mask: "radial-gradient(circle at 8px 100%, transparent 6px, #000 6.5px) 0 100%/16px 100% repeat-x, linear-gradient(#000 0 0) 0 0/100% calc(100% - 8px) no-repeat",
        }}
      >
        {/* Faixa superior estilo cabeçalho de nota */}
        <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary-foreground/15">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-widest opacity-80">
                Faturamento atual
              </p>
              <p className="text-xs font-semibold">
                {currentBilling.period}
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
            {currentBilling.generatedAt}
          </span>
        </div>

        {/* Corpo da nota */}
        <div className="space-y-4 px-5 pb-10 pt-5 font-mono">
          {/* Linha de itens */}
          <div className="space-y-2.5 text-xs">
            <InvoiceLine
              icon={<Car className="h-3.5 w-3.5" />}
              label="Veículos ativos"
              value={formatNumber(currentBilling.activeVehicles)}
            />
            <InvoiceLine
              icon={<PlusCircle className="h-3.5 w-3.5" />}
              label="Novas instalações"
              value={`+${formatNumber(currentBilling.newInstallations)}`}
            />
            <InvoiceLine
              icon={<MinusCircle className="h-3.5 w-3.5" />}
              label="Remoções"
              value={`-${formatNumber(currentBilling.removals)}`}
            />
          </div>

          {/* Divisor pontilhado */}
          <div className="border-t border-dashed border-border" />

          {/* Breakdown de valores */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Mensalidade</span>
              <span className="tabular-nums">
                {formatCurrency(currentBilling.monthlyFee)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Instalações</span>
              <span className="tabular-nums">
                {formatCurrency(currentBilling.installationsFee)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Remoções</span>
              <span className="tabular-nums">
                {formatCurrency(currentBilling.removalsDiscount)}
              </span>
            </div>
          </div>

          {/* Divisor pontilhado */}
          <div className="border-t border-dashed border-border" />

          {/* Total */}
          <div className="flex items-end justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total
            </span>
            <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
              {formatCurrency(currentBilling.total)}
            </span>
          </div>

          {/* Botão de gerar planilha */}
          <Button
            onClick={onGenerateSpreadsheet}
            variant="outline"
            className="w-full gap-2 border-dashed font-sans"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Gerar planilha
          </Button>
        </div>
      </div>
    </div>
  );
}

function InvoiceLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="text-foreground/70">{icon}</span>
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}