import { useState, useCallback } from "react";
import { Wrench, MapPin, User, Gauge, Hash, Loader2, SatelliteDish , CheckCircle2 } from "lucide-react";
import { InputWithIcon } from "@/components/InputWithIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export function ValidationForm({ onSubmit, onCancel, isSubmitting = false }: ValidationFormProps) {
  const [formData, setFormData] = useState(INITIAL_DATA);

  const updateField = useCallback((field: keyof ValidationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleSecondary = () => {
    setFormData(prev => ({
      ...prev,
      hasSecondaryDevice: !prev.hasSecondaryDevice,
      secondaryDeviceId: prev.hasSecondaryDevice ? "" : prev.secondaryDeviceId,
    }));
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
          <h4 className="text-sm font-semibold">Dados de Instalação</h4>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          * Obrigatório
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
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

          <Field label="Bloqueio" required>
            <div className="flex gap-1 pt-0.5">
              <ToggleButton active={formData.blockingEnabled} onClick={() => updateField("blockingEnabled", true)} label="Habilitado" disabled={isSubmitting} />
              <ToggleButton active={!formData.blockingEnabled} onClick={() => updateField("blockingEnabled", false)} label="Desabilitado" disabled={isSubmitting} />
            </div>
          </Field>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SatelliteDish className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dispositivo Secundário</p>
                <p className="text-xs text-muted-foreground">Adicionar segundo rastreador</p>
              </div>
            </div>
            <Switch checked={formData.hasSecondaryDevice} onCheckedChange={toggleSecondary} disabled={isSubmitting} />
          </div>

          {formData.hasSecondaryDevice && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <InputWithIcon
                icon={<Wrench className="h-3.5 w-3.5" />}
                placeholder="ID do dispositivo secundário"
                value={formData.secondaryDeviceId}
                onChange={(e) => updateField("secondaryDeviceId", e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-sm"
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