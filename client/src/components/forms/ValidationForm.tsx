import { useState } from "react";
import { Wrench, MapPin, User, Gauge, Hash, Loader2 } from "lucide-react";
import { InputWithIcon } from "@/components/InputWithIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ValidationFormProps {
  onSubmit: (data: ValidationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

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

export function ValidationForm({ onSubmit, onCancel, isSubmitting = false }: ValidationFormProps) {
  const [hasSecondaryDevice, setHasSecondaryDevice] = useState(false);
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [formData, setFormData] = useState<ValidationFormData>({
    equipmentId: "",
    installationLocation: "",
    technicianName: "",
    address: "",
    hasSecondaryDevice: false,
    secondaryDeviceId: "",
    odometer: "",
    blockingEnabled: true,
    protocolNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      hasSecondaryDevice,
      blockingEnabled,
    });
  };

  const handleInputChange = (field: keyof ValidationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-lg border border-muted bg-muted/20 p-6">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        Dados de Instalação
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Linha 1: ID do Equipamento + Local de Instalação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment-id" className="text-sm font-medium">
                ID do Equipamento *
              </Label>
              <InputWithIcon
                id="equipment-id"
                icon={<Wrench className="h-4 w-4" />}
                placeholder="Digite o ID do equipamento"
                value={formData.equipmentId}
                onChange={(e) => handleInputChange("equipmentId", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installation-location" className="text-sm font-medium">
                Local de Instalação *
              </Label>
              <InputWithIcon
                id="installation-location"
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Ex: Soleira do carro"
                value={formData.installationLocation}
                onChange={(e) => handleInputChange("installationLocation", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Linha 2: Nome do Técnico + Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technician-name" className="text-sm font-medium">
                Nome do Técnico *
              </Label>
              <InputWithIcon
                id="technician-name"
                icon={<User className="h-4 w-4" />}
                placeholder="Digite o nome do técnico"
                value={formData.technicianName}
                onChange={(e) => handleInputChange("technicianName", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Endereço *
              </Label>
              <InputWithIcon
                id="address"
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Digite o endereço do serviço"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Linha 3: Dispositivo Secundário (checkbox) + Odômetro */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="secondary-device"
                  checked={hasSecondaryDevice}
                  onCheckedChange={(checked) => {
                    setHasSecondaryDevice(checked === true);
                    if (!checked) {
                      handleInputChange("secondaryDeviceId", "");
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="secondary-device"
                  className="text-sm font-medium cursor-pointer"
                >
                  Dispositivo Secundário
                </Label>
              </div>

              {hasSecondaryDevice && (
                <InputWithIcon
                  id="secondary-device-id"
                  icon={<Wrench className="h-4 w-4" />}
                  placeholder="Digite o ID do dispositivo secundário"
                  value={formData.secondaryDeviceId}
                  onChange={(e) => handleInputChange("secondaryDeviceId", e.target.value)}
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometer" className="text-sm font-medium">
                Odômetro (km)
              </Label>
              <InputWithIcon
                id="odometer"
                icon={<Gauge className="h-4 w-4" />}
                placeholder="Ex: 45000"
                type="number"
                value={formData.odometer}
                onChange={(e) => handleInputChange("odometer", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Linha 4: Bloqueio + Número de Protocolo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bloqueio *</Label>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blocking-yes"
                    checked={blockingEnabled}
                    onCheckedChange={(checked) => setBlockingEnabled(checked === true)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="blocking-yes"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Sim
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blocking-no"
                    checked={!blockingEnabled}
                    onCheckedChange={(checked) => setBlockingEnabled(checked === false)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="blocking-no"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Não
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol-number" className="text-sm font-medium">
                Número de Protocolo
              </Label>
              <InputWithIcon
                id="protocol-number"
                icon={<Hash className="h-4 w-4" />}
                placeholder="Digite o número do protocolo"
                value={formData.protocolNumber}
                onChange={(e) => handleInputChange("protocolNumber", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                "Validar Instalação"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}