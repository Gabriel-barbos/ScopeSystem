import { useState, useCallback } from "react";
import { Wrench, MapPin, User, Gauge, Hash, Loader2, Monitor, CheckCircle2, Eye, MessageSquare } from "lucide-react";
import { InputWithIcon } from "@/components/InputWithIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ValidationFormData {
  equipmentId: string;
  installationLocation: string;
  technicianName: string;
  address: string;
  hasSecondaryDevice: boolean;
  secondaryDeviceId?: string;
  odometer: string;
  blockingEnabled: boolean;
  protocolNumber: string;
  keepUnderObservation: boolean;
  hasObservations: boolean;
  observations?: string;
}

interface ValidationFormProps {
  onSubmit: (data: ValidationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const INITIAL_DATA: ValidationFormData = {
  equipmentId: "",
  installationLocation: "",
  technicianName: "",
  address: "",
  hasSecondaryDevice: false,
  secondaryDeviceId: "",
  odometer: "",
  blockingEnabled: true,
  protocolNumber: "",
  keepUnderObservation: false,
  hasObservations: false,
  observations: "",
};

const FIELDS = [
  { key: "equipmentId", label: "ID Equipamento", icon: Wrench, placeholder: "Digite o ID", required: true },
  { key: "installationLocation", label: "Local de Instalação", icon: MapPin, placeholder: "Ex: Soleira do carro", required: true },
  { key: "technicianName", label: "Técnico Responsável", icon: User, placeholder: "Nome do técnico", required: true },
  { key: "address", label: "Endereço do Serviço", icon: MapPin, placeholder: "Endereço completo", required: true, colSpan: 2 },
  { key: "odometer", label: "Odômetro (km)", icon: Gauge, placeholder: "Ex: 45000", type: "number" },
  { key: "protocolNumber", label: "Nº Protocolo", icon: Hash, placeholder: "Número do protocolo" },
] as const;

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

const ToggleButton = ({ active, onClick, label, disabled }: { active: boolean; onClick: () => void; label: string; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "px-4 py-1.5 text-xs font-medium rounded-md transition-all border focus:outline-none focus:ring-2 focus:ring-primary/20",
      active ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:bg-muted/50",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {label}
  </button>
);

const CheckboxItem = ({ id, checked, onCheckedChange, icon: Icon, label, disabled }: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} disabled={disabled} />
    <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </label>
  </div>
);

const SwitchCard = ({ icon: Icon, title, description, checked, onCheckedChange, disabled, children }: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
    {checked && children && <div className="mt-3 pt-3 border-t border-border/50">{children}</div>}
  </div>
);

export function ValidationForm({ onSubmit, onCancel, isSubmitting = false }: ValidationFormProps) {
  const [formData, setFormData] = useState(INITIAL_DATA);

  const updateField = useCallback((field: keyof ValidationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleField = useCallback((field: keyof ValidationFormData, clearField?: keyof ValidationFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
      ...(clearField && prev[field] ? { [clearField]: "" } : {}),
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
          <h4 className="text-sm font-semibold">Dados de Instalação</h4>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">* Obrigatório</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Dynamic Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
          {FIELDS.map(({ key, label, icon: Icon, placeholder, required, type, colSpan }) => (
            <div key={key} className={colSpan === 2 ? "lg:col-span-2" : undefined}>
              <Field label={label} required={required}>
                <InputWithIcon
                  icon={<Icon className="h-3.5 w-3.5" />}
                  placeholder={placeholder}
                  type={type}
                  value={formData[key as keyof ValidationFormData] as string}
                  onChange={(e) => updateField(key as keyof ValidationFormData, e.target.value)}
                  disabled={isSubmitting}
                  required={required}
                  className="h-9 text-sm"
                />
              </Field>
            </div>
          ))}

          {/* Blocking Toggle */}
          <Field label="Bloqueio" required>
            <div className="flex gap-1 pt-0.5">
              <ToggleButton active={formData.blockingEnabled} onClick={() => updateField("blockingEnabled", true)} label="Habilitado" disabled={isSubmitting} />
              <ToggleButton active={!formData.blockingEnabled} onClick={() => updateField("blockingEnabled", false)} label="Desabilitado" disabled={isSubmitting} />
            </div>
          </Field>

          {/* Checkboxes Row */}
          <div className="lg:col-span-2 flex items-end pb-1">
            <div className="flex items-center gap-6 p-2.5 rounded-lg bg-muted/30 border border-border/50 w-full">
              <CheckboxItem
                id="keepUnderObservation"
                checked={formData.keepUnderObservation}
                onCheckedChange={(checked) => updateField("keepUnderObservation", checked)}
                icon={Eye}
                label="Manter em observação"
                disabled={isSubmitting}
              />
              <CheckboxItem
                id="hasObservations"
                checked={formData.hasObservations}
                onCheckedChange={(checked) => {
                  updateField("hasObservations", checked);
                  if (!checked) updateField("observations", "");
                }}
                icon={MessageSquare}
                label="Adicionar observações"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="mt-4 space-y-3">
          {/* Secondary Device */}
          <SwitchCard
            icon={Monitor}
            title="Dispositivo Secundário"
            description="Adicionar segundo rastreador"
            checked={formData.hasSecondaryDevice}
            onCheckedChange={() => toggleField("hasSecondaryDevice", "secondaryDeviceId")}
            disabled={isSubmitting}
          >
            <InputWithIcon
              icon={<Wrench className="h-3.5 w-3.5" />}
              placeholder="ID do dispositivo secundário"
              value={formData.secondaryDeviceId}
              onChange={(e) => updateField("secondaryDeviceId", e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </SwitchCard>

          {/* Observations Textarea */}
          {formData.hasObservations && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Observações</span>
              </div>
              <Textarea
                placeholder="Digite suas observações aqui..."
                value={formData.observations}
                onChange={(e) => updateField("observations", e.target.value)}
                disabled={isSubmitting}
                className="min-h-[70px] text-sm resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting} className="h-8 px-3 text-xs">
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 px-4 text-xs gap-1.5">
            {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Validando...</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Validar</>}
          </Button>
        </div>
      </form>
    </div>
  );
}