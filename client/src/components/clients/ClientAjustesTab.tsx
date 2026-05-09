import { useState } from "react";
import {
  User,
  FileUser,
  UserCircle,
  KeyRound,
  Plus,
  FileText,
  MoreVertical,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Cpu,
  Wrench,
  Save,
  CopyCheck,
  BadgeCheck,
  ClipboardList,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ContractFormDialog } from "./ContractFormDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { clientApi } from "@/services/ClientService";

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
// MOCK DATA
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

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Field({
  label,
  icon: Icon,
  ...props
}: {
  label: string;
  icon: React.ElementType;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9 h-9" {...props} />
      </div>
    </div>
  );
}

// ── Contract price row ──────────────────────────
function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">{brl(value)}</span>
    </div>
  );
}

// ── Expandable Contract Item ────────────────────
function ContractItem({
  contract,
  expanded,
  onToggle,
}: {
  contract: Contract;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="rounded-xl border bg-background overflow-hidden transition-all">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-accent/40 transition-colors text-left"
      >
        {/* Icon */}
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Cpu className="h-5 w-5 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{contract.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
              {contract.model}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {contract.durationMonths} meses
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0 mr-1">
          <p className="text-sm font-bold text-primary tabular-nums">
            {brl(contract.monthlyPrice)}
          </p>
          <p className="text-[10px] text-muted-foreground">/ mês</p>
        </div>

        {/* Chevron */}
        <div className="text-muted-foreground shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 bg-muted/20">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 mt-2">
            Tabela de valores
          </p>
          <div className="rounded-lg border border-border/60 bg-background px-3 py-1 divide-y divide-border/40">
            <PriceRow label="Mensalidade" value={contract.monthlyPrice} />
            <PriceRow label="Instalação PDI" value={contract.installationPDI} />
            <PriceRow label="Instalação Concessionária" value={contract.installationDealer} />
            <PriceRow label="Instalação In Loco" value={contract.installationInLoco} />
            <PriceRow label="Desinstalação" value={contract.uninstallation} />
            <PriceRow label="Perda de Dispositivo" value={contract.deviceLoss} />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs">Duração do contrato: <strong className="text-foreground">{contract.durationMonths} meses</strong></span>
          </div>
        </div>
      )}
    </li>
  );
}

// ── Switch Row ──────────────────────────────────
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
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer select-none">
          {label}
        </Label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && children && (
        <div className="px-4 pb-3 pt-0.5 border-t border-border/50 bg-muted/20 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────
type Props = { clientId: string };

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export function ClientAjustesTab({ clientId }: Props) {
  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => clientApi.getById(clientId),
    enabled: !!clientId,
  });

  // Contract expand state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contractFormOpen, setContractFormOpen] = useState(false);

  // Condition switches
  const [freeInstall, setFreeInstall] = useState(true);
  const [prepaid, setPrepaid] = useState(false);
  const [variablePrice, setVariablePrice] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 text-muted-foreground">
        <span className="h-5 w-5 animate-spin border-2 border-current border-t-transparent rounded-full mr-2 inline-block" />
        Carregando cliente...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Cliente não encontrado.
      </div>
    );
  }

  const isSubClient = Boolean(client.parent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 p-4">
      {/* ─── Coluna esquerda: Form ─── */}
      <aside className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2 pb-4">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarImage src={client.image?.[0]} />
            <AvatarFallback>{client.name?.[0] ?? "?"}</AvatarFallback>
          </Avatar>
          <Badge variant={isSubClient ? "secondary" : "default"} className="mt-1">
            {isSubClient ? "Sub-cliente" : "Cliente Principal"}
          </Badge>
        </div>

        <Separator className="mb-4" />

        <div key={client._id} className="space-y-3">
          <Field label="Nome" icon={User} defaultValue={client.name ?? ""} placeholder="Nome do cliente" />
          <Field label="Descrição" icon={FileUser} defaultValue={client.description ?? ""} placeholder="Descrição" />
          <Field
            label="Cliente Principal"
            icon={UserCircle}
            defaultValue={client.parent?.name ?? ""}
            placeholder="Nenhum (cliente principal)"
          />

          <Separator className="my-5" />

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credenciais Mzone
          </p>
          <Field label="Login" icon={User} defaultValue="gg" placeholder="Login" />
          <Field label="Senha" icon={KeyRound} type="password" defaultValue="gg" placeholder="Senha" />
        </div>

        <div className="flex gap-2 pt-6">
          <Button className="flex-1">Salvar</Button>
          <Button variant="outline">Cancelar</Button>
        </div>
      </aside>

      {/* ─── Coluna direita: Contratos + Condições ─── */}
      <section className="flex flex-col gap-4">

        {/* ── Contratos ── */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-none">Contratos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clique para expandir e ver os valores
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setContractFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          </header>

          <ul className="space-y-2">
            {mockContracts.map((c) => (
              <ContractItem
                key={c._id}
                contract={c}
                expanded={expandedId === c._id}
                onToggle={() => setExpandedId(expandedId === c._id ? null : c._id)}
              />
            ))}
          </ul>
        </div>

        {/* ── Condições ── */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <header className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-none">Condições</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Condições comerciais aplicadas aos contratos
              </p>
            </div>
          </header>

          <div className="space-y-2">

            {/* 1. Custo de instalação isento */}
            <SwitchRow
              id="free-install"
              label="Custo de instalação isento"
              checked={freeInstall}
              onCheckedChange={setFreeInstall}
            />

            {/* 2. Mensalidade já paga */}
            <SwitchRow
              id="prepaid"
              label="Mensalidade já paga"
              checked={prepaid}
              onCheckedChange={setPrepaid}
            >
              <div className="pt-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Período já pago
                </Label>
                <Input
                  placeholder="Ex: Janeiro/2024 – Março/2024"
                  className="h-8 text-sm"
                />
              </div>
            </SwitchRow>

            {/* 3. Preço variável por tamanho de frota */}
            <SwitchRow
              id="variable-price"
              label="Preço variável por tamanho de frota"
              checked={variablePrice}
              onCheckedChange={setVariablePrice}
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Se a frota passar de
                  </Label>
                  <div className="relative">
                    <Input placeholder="Ex: 50" className="h-8 text-sm pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      carros
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-4">→</span>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    O valor será maior em
                  </Label>
                  <div className="relative">
                    <Input placeholder="Ex: 10" className="h-8 text-sm pr-6" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </SwitchRow>

            {/* 4. Custo de manutenção */}
            <SwitchRow
              id="maintenance"
              label="Custo de manutenção"
              checked={maintenance}
              onCheckedChange={setMaintenance}
            >
              <div className="pt-1 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Valores de manutenção
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">PDI</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="0,00" className="h-8 text-sm pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> In Loco
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="0,00" className="h-8 text-sm pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Concessionária</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="0,00" className="h-8 text-sm pl-7" />
                    </div>
                  </div>
                </div>
              </div>
            </SwitchRow>

          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50">
            <Button className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              Salvar condições
            </Button>
            <Button variant="outline" className="flex items-center gap-1.5">
              <CopyCheck className="h-4 w-4" />
              Aplicar em contratos
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <MoreVertical className="h-4 w-4" />
              Selecionar individualmente
            </Button>
          </div>
        </div>

      </section>

      <ContractFormDialog
        open={contractFormOpen}
        onClose={() => setContractFormOpen(false)}
      />
    </div>
  );
}