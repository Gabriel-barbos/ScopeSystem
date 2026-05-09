import { useState } from "react";
import {
  X,
  Copy,
  ChevronDown,
  FileText,
  Cpu,
  DollarSign,
  Clock,
  Wrench,
  ClipboardList,
  BadgeCheck,
  CheckCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
type Contract = {
  _id: string;
  name: string;
  model: string;
  monthlyPrice: number;
  installationPDI: number;
  installationDealer: number;
  installationInLoco: number;
  uninstallation: number;
  deviceLoss: number;
  durationMonths: number;
};

// ──────────────────────────────────────────────
// MOCK DATA (reuses same list)
// ──────────────────────────────────────────────
const mockContracts: Contract[] = [
  {
    _id: "c1",
    name: "Pacote 2G + Bloqueio",
    model: "GV50P",
    monthlyPrice: 19.99,
    installationPDI: 50.0,
    installationDealer: 80.0,
    installationInLoco: 120.0,
    uninstallation: 40.0,
    deviceLoss: 250.0,
    durationMonths: 36,
  },
  {
    _id: "c2",
    name: "Pacote 4G + Bloqueio",
    model: "X3 TECH",
    monthlyPrice: 29.99,
    installationPDI: 60.0,
    installationDealer: 90.0,
    installationInLoco: 140.0,
    uninstallation: 50.0,
    deviceLoss: 320.0,
    durationMonths: 36,
  },
  {
    _id: "c3",
    name: "Pacote 4G + Sem Bloqueio",
    model: "GV50CG",
    monthlyPrice: 39.99,
    installationPDI: 70.0,
    installationDealer: 100.0,
    installationInLoco: 160.0,
    uninstallation: 60.0,
    deviceLoss: 380.0,
    durationMonths: 36,
  },
  {
    _id: "c4",
    name: "Pacote Premium 4G",
    model: "GV75MG",
    monthlyPrice: 49.99,
    installationPDI: 80.0,
    installationDealer: 120.0,
    installationInLoco: 180.0,
    uninstallation: 70.0,
    deviceLoss: 450.0,
    durationMonths: 36,
  },
];

const DEVICE_MODELS = ["GV50P", "GV50CG", "GV75MG", "X3 TECH", "Teltonika FMB920", "Queclink GV350MG"];

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Labeled currency input ──────────────────────
function CurrencyField({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
          R$
        </span>
        <Input
          className="pl-8 h-9 text-sm tabular-nums"
          placeholder="0,00"
          defaultValue={defaultValue}
        />
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Switch row ──────────────────────────────────
function SwitchRow({
  id,
  label,
  checked,
  onCheckedChange,
  children,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer select-none">
          {label}
        </Label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && children && (
        <div className="px-3.5 pb-3 pt-0.5 border-t border-border/50 bg-muted/20 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────
type Props = {
  open: boolean;
  onClose: () => void;
};

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export function ContractFormDialog({ open, onClose }: Props) {
  const [clonedFrom, setClonedFrom] = useState<Contract | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Condition switches
  const [freeInstall, setFreeInstall] = useState(true);
  const [prepaid, setPrepaid] = useState(false);
  const [variablePrice, setVariablePrice] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  function handleClone(contract: Contract) {
    setClonedFrom(contract);
    setSelectedModel(contract.model);
  }

  function clearClone() {
    setClonedFrom(null);
    setSelectedModel("");
  }

  const cv = (field: keyof Contract) =>
    clonedFrom ? String(clonedFrom[field]) : undefined;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {clonedFrom ? "Clonar contrato" : "Novo contrato"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {clonedFrom
                    ? `Baseado em: ${clonedFrom.name}`
                    : "Preencha os dados do novo contrato"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Clone button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Copy className="h-3.5 w-3.5" />
                    Clonar existente
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Selecione um contrato para clonar
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mockContracts.map((c) => (
                    <DropdownMenuItem
                      key={c._id}
                      className="flex items-center gap-2 cursor-pointer"
                      onSelect={() => handleClone(c)}
                    >
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Cpu className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.model}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0">
                        {brl(c.monthlyPrice)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Clone banner */}
          {clonedFrom && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/8 border border-primary/20 px-3 py-2">
              <CheckCheck className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-primary flex-1">
                Campos preenchidos com base em <strong>{clonedFrom.name}</strong>. Edite o que precisar.
              </p>
              <button
                onClick={clearClone}
                className="text-xs text-primary/70 hover:text-primary underline underline-offset-2 shrink-0"
              >
                Limpar
              </button>
            </div>
          )}
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6">

          {/* ─ Identificação ─ */}
          <section>
            <SectionHeader icon={FileText} title="Identificação" subtitle="Nome e modelo do equipamento" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Nome do contrato *</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Ex: Pacote 4G + Bloqueio"
                  defaultValue={clonedFrom ? `${clonedFrom.name} (cópia)` : ""}
                />
              </div>

              {/* Model picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Modelo do equipamento *</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal h-9 text-sm"
                    >
                      {selectedModel ? (
                        <span className="flex items-center gap-2">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono font-semibold">{selectedModel}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Selecionar modelo…</span>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {DEVICE_MODELS.map((m) => (
                      <DropdownMenuItem
                        key={m}
                        onSelect={() => setSelectedModel(m)}
                        className="font-mono text-sm"
                      >
                        {m}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Duração do contrato (meses) *
                </Label>
                <div className="relative w-full sm:w-40">
                  <Input
                    className="h-9 text-sm pr-14"
                    placeholder="36"
                    defaultValue={cv("durationMonths")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    meses
                  </span>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ─ Tabela de preços ─ */}
          <section>
            <SectionHeader
              icon={DollarSign}
              title="Tabela de valores"
              subtitle="Todos os valores financeiros deste contrato"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CurrencyField label="Mensalidade *" defaultValue={cv("monthlyPrice")} />
              <CurrencyField label="Instalação PDI" defaultValue={cv("installationPDI")} />
              <CurrencyField label="Instalação Concessionária" defaultValue={cv("installationDealer")} />
              <CurrencyField label="Instalação In Loco" defaultValue={cv("installationInLoco")} />
              <CurrencyField label="Desinstalação" defaultValue={cv("uninstallation")} />
              <CurrencyField label="Perda de Dispositivo" defaultValue={cv("deviceLoss")} />
            </div>

            {clonedFrom && (
              <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <p className="text-xs">
                  Valores carregados de <strong className="text-foreground">{clonedFrom.name}</strong> — edite os que forem diferentes.
                </p>
              </div>
            )}
          </section>

          <Separator />

          {/* ─ Condições ─ */}
          <section>
            <SectionHeader
              icon={ClipboardList}
              title="Condições deste contrato"
              subtitle="As condições abaixo serão aplicadas especificamente neste contrato"
            />

            <div className="space-y-2">
              {/* 1. Custo de instalação isento */}
              <SwitchRow
                id="cf-free-install"
                label="Custo de instalação isento"
                checked={freeInstall}
                onCheckedChange={setFreeInstall}
              />

              {/* 2. Mensalidade já paga */}
              <SwitchRow
                id="cf-prepaid"
                label="Mensalidade já paga"
                checked={prepaid}
                onCheckedChange={setPrepaid}
              >
                <div className="pt-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Período já pago
                  </Label>
                  <Input
                    placeholder="Ex: Janeiro/2024 – Março/2024"
                    className="h-8 text-sm"
                  />
                </div>
              </SwitchRow>

              {/* 3. Preço variável por frota */}
              <SwitchRow
                id="cf-variable-price"
                label="Preço variável por tamanho de frota"
                checked={variablePrice}
                onCheckedChange={setVariablePrice}
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Se a frota passar de
                    </Label>
                    <div className="relative">
                      <Input placeholder="50" className="h-8 text-sm pr-14" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        carros
                      </span>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm mt-5">→</span>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      O valor será maior em
                    </Label>
                    <div className="relative">
                      <Input placeholder="10" className="h-8 text-sm pr-6" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </SwitchRow>

              {/* 4. Custo de manutenção */}
              <SwitchRow
                id="cf-maintenance"
                label="Custo de manutenção"
                checked={maintenance}
                onCheckedChange={setMaintenance}
              >
                <div className="pt-1 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Valores de manutenção</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">PDI</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="0,00" className="h-8 text-sm pl-7" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                        <Wrench className="h-3 w-3" /> In Loco
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="0,00" className="h-8 text-sm pl-7" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Concessionária</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="0,00" className="h-8 text-sm pl-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </SwitchRow>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 bg-background border-t border-border/60 px-6 py-4 flex items-center gap-2">
          <Button className="flex-1 sm:flex-none">
            {clonedFrom ? "Criar contrato clonado" : "Criar contrato"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {clonedFrom && (
            <Badge variant="secondary" className="ml-auto hidden sm:flex items-center gap-1">
              <Copy className="h-3 w-3" />
              Clonado de: {clonedFrom.model}
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
