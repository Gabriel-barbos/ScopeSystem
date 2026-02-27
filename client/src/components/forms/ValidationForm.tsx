import { useState, useCallback } from "react";
import {
  Wrench, MapPin, User, Gauge, Hash, Loader2, Monitor,
  CheckCircle2, Shield, MessageSquare, Eye, ChevronsUpDown, Check, Package,
} from "lucide-react";
import { InputWithIcon } from "@/components/InputWithIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/Authcontext";

export interface ProductRef {
  _id: string;
  name: string;
}

export interface ValidationFormData {
  equipmentId: string;
  productId: string;
  installationLocation: string;
  technicianName: string;
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
  products: ProductRef[];
  defaultProductId?: string;
}

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

export function ValidationForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  products,
  defaultProductId = "",
}: ValidationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ValidationFormData>({
    equipmentId: "",
    productId: defaultProductId,
    installationLocation: "",
    technicianName: "",
    hasSecondaryDevice: false,
    secondaryDeviceId: "",
    odometer: "",
    blockingEnabled: true,
    protocolNumber: "",
    keepUnderObservation: false,
    hasObservations: false,
    observations: "",
    validatedBy: "",
  });
  const [equipmentIdError, setEquipmentIdError] = useState<string | null>(null);
  const [openProduct, setOpenProduct] = useState(false);

  const updateField = useCallback((field: keyof ValidationFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateEquipmentId = (value: string) =>
    value.length !== 15 ? "O ID do dispositivo deve conter exatamente 15 dígitos" : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEquipmentId(formData.equipmentId);
    if (error) { setEquipmentIdError(error); return; }
    onSubmit({ ...formData, validatedBy: user?.name || "" });
  };

  const selectedProductName = products.find((p) => p._id === formData.productId)?.name;

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4 space-y-3">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">

          {/* ID Equipamento */}
          <Field label="ID Equipamento" required>
            <InputWithIcon
              icon={<Wrench className="h-3.5 w-3.5" />}
              placeholder="Digite o ID"
              value={formData.equipmentId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                updateField("equipmentId", value);
                setEquipmentIdError(validateEquipmentId(value));
              }}
              disabled={isSubmitting}
              required
              className="h-9 text-sm"
            />
            {equipmentIdError && <p className="text-xs text-destructive mt-1">{equipmentIdError}</p>}
          </Field>

          {/* Equipamento — combobox pré-preenchido pelo produto do agendamento */}
          <Field label="Equipamento">
            <Popover open={openProduct} onOpenChange={setOpenProduct}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full h-9 justify-between font-normal text-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{selectedProductName ?? "Selecione o equipamento"}</span>
                  </span>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-72">
                <Command>
                  <CommandInput placeholder="Buscar equipamento..." />
                  <CommandList>
                    <CommandEmpty>Nenhum equipamento encontrado</CommandEmpty>
                    <CommandGroup>
                      {products.map((p) => (
                        <CommandItem
                          key={p._id}
                          onSelect={() => {
                            updateField("productId", p._id);
                            setOpenProduct(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", formData.productId === p._id ? "opacity-100" : "opacity-0")} />
                          {p.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>

          {/* Local de Instalação */}
          <Field label="Local de Instalação" required>
            <InputWithIcon
              icon={<MapPin className="h-3.5 w-3.5" />}
              placeholder="Ex: Soleira do carro"
              value={formData.installationLocation}
              onChange={(e) => updateField("installationLocation", e.target.value)}
              disabled={isSubmitting}
              required
              className="h-9 text-sm"
            />
          </Field>

          {/* Técnico Responsável */}
          <Field label="Técnico Responsável" required>
            <InputWithIcon
              icon={<User className="h-3.5 w-3.5" />}
              placeholder="Nome do técnico"
              value={formData.technicianName}
              onChange={(e) => updateField("technicianName", e.target.value)}
              disabled={isSubmitting}
              required
              className="h-9 text-sm"
            />
          </Field>

          {/* Odômetro */}
          <Field label="Odômetro (km)">
            <InputWithIcon
              icon={<Gauge className="h-3.5 w-3.5" />}
              placeholder="Ex: 45000"
              type="number"
              value={formData.odometer}
              onChange={(e) => updateField("odometer", e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </Field>

          {/* Nº Protocolo */}
          <Field label="Nº Protocolo">
            <InputWithIcon
              icon={<Hash className="h-3.5 w-3.5" />}
              placeholder="Número do protocolo"
              value={formData.protocolNumber}
              onChange={(e) => updateField("protocolNumber", e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </Field>

          {/* Bloqueio */}
          <div className="flex items-end pb-1">
            <div className="flex items-center justify-between w-full p-2.5 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="blocking" className="text-sm font-medium cursor-pointer">Bloqueio</Label>
              </div>
              <Switch
                id="blocking"
                checked={formData.blockingEnabled}
                onCheckedChange={(checked) => updateField("blockingEnabled", checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center space-x-2 p-2.5 rounded-lg border bg-card">
            <Checkbox
              id="hasSecondary"
              checked={formData.hasSecondaryDevice}
              onCheckedChange={(checked) => {
                updateField("hasSecondaryDevice", !!checked);
                if (!checked) updateField("secondaryDeviceId", "");
              }}
              disabled={isSubmitting}
            />
            <Label htmlFor="hasSecondary" className="text-sm font-medium cursor-pointer flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              Dispositivo secundário
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-2.5 rounded-lg border bg-card">
            <Checkbox
              id="hasObservations"
              checked={formData.hasObservations}
              onCheckedChange={(checked) => {
                updateField("hasObservations", !!checked);
                if (!checked) updateField("observations", "");
              }}
              disabled={isSubmitting}
            />
            <Label htmlFor="hasObservations" className="text-sm font-medium cursor-pointer flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Adicionar observações
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-2.5 rounded-lg border bg-card">
            <Checkbox
              id="keepObservation"
              checked={formData.keepUnderObservation}
              onCheckedChange={(checked) => updateField("keepUnderObservation", !!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="keepObservation" className="text-sm font-medium cursor-pointer flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              Manter em observação
            </Label>
          </div>
        </div>

        {/* Campos condicionais */}
        {(formData.hasSecondaryDevice || formData.hasObservations) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {formData.hasSecondaryDevice && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <Field label="ID do Dispositivo Secundário" required>
                  <InputWithIcon
                    icon={<Monitor className="h-3.5 w-3.5" />}
                    placeholder="Digite o ID do dispositivo secundário"
                    value={formData.secondaryDeviceId || ""}
                    onChange={(e) => updateField("secondaryDeviceId", e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="h-9 text-sm"
                  />
                </Field>
              </div>
            )}

            {formData.hasObservations && (
              <div className={cn("animate-in slide-in-from-top-2 duration-200", !formData.hasSecondaryDevice && "md:col-span-2")}>
                <Field label="Observações de Validação">
                  <Textarea
                    placeholder="Descreva observações relevantes sobre a instalação..."
                    value={formData.observations || ""}
                    onChange={(e) => updateField("observations", e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-[72px] resize-none text-sm"
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Validando...</>
              : <><CheckCircle2 className="h-3.5 w-3.5" /> Validar</>
            }
          </Button>
        </div>
      </form>
    </div>
  );
}