import { useState, useCallback } from "react";
import {
  Wrench,
  MapPin,
  User,
  Gauge,
  Hash,
  Loader2,
  Monitor,
  CheckCircle2,
  Eye,
  MessageSquare,
} from "lucide-react";
import { InputWithIcon } from "@/components/InputWithIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/Authcontext";

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
  validatedBy: string;
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
  validatedBy: "",
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

export function ValidationForm({ onSubmit, onCancel, isSubmitting = false }: ValidationFormProps) {
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [equipmentIdError, setEquipmentIdError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateField = useCallback((field: keyof ValidationFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateEquipmentId = (value: string) => {
    if (value.length !== 15) {
      return "O ID do dispositivo deve conter exatamente 15 dígitos";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateEquipmentId(formData.equipmentId);
    if (error) {
      setEquipmentIdError(error);
      return;
    }

    onSubmit({ ...formData, validatedBy: user?.name || "" });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-sm overflow-hidden">
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
                  onChange={(e) => {
                    if (key === "equipmentId") {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                      updateField("equipmentId", value);
                      setEquipmentIdError(validateEquipmentId(value));
                    } else {
                      updateField(key as keyof ValidationFormData, e.target.value);
                    }
                  }}
                  disabled={isSubmitting}
                  required={required}
                  className="h-9 text-sm"
                />
                {key === "equipmentId" && equipmentIdError && (
                  <p className="text-xs text-destructive mt-1">{equipmentIdError}</p>
                )}
              </Field>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Validando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Validar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
