import { Hash, KeySquare, Car, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import InfoField from "@/components/global/InfoField";
import { Schedule } from "@/services/ScheduleService";
import { getStatusConfig, getServiceConfig } from "@/utils/badges";
import { ValidationForm, ValidationFormData } from "@/components/forms/ValidationForm";

interface ScheduleDetailsProps {
  schedule: Schedule;
  onValidationSubmit: (data: ValidationFormData) => void;
  onValidationCancel: () => void;
  isSubmitting?: boolean;
}

export function ScheduleDetails({ 
  schedule, 
  onValidationSubmit,
  onValidationCancel,
  isSubmitting = false
}: ScheduleDetailsProps) {
  const status = getStatusConfig(schedule.status);
  const service = getServiceConfig(schedule.serviceType);

  const ServiceIcon = service.icon;

  return (
    <div className="space-y-6">
      {/* Informações do Veículo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Informações do Veículo
          </h4>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${service.className}`}
          >
            <ServiceIcon className="h-3.5 w-3.5" />
            <span>{service.label}</span>
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InfoField icon={Hash} label="Chassi" value={schedule.vin} />
          {schedule.plate && (
            <InfoField icon={KeySquare} label="Placa" value={schedule.plate} />
          )}
          {schedule.model && (
            <InfoField icon={Car} label="Modelo" value={schedule.model} />
          )}
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Informações do Cliente
        </h4>
        
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          {schedule.client.image?.[0] && (
            <img
              src={schedule.client.image[0]}
              alt={schedule.client.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-border"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {schedule.client.name}
            </p>
            {schedule.product && (
              <p className="text-xs text-muted-foreground">
                Equipamento: <span className="font-medium">{schedule.product.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Observações (se houver) */}
      {schedule.notes && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Observações</h4>
          <div className="p-3 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground">{schedule.notes}</p>
          </div>
        </div>
      )}

      {/* Separador antes do formulário */}
      <Separator className="my-6" />

      {/* Formulário de Validação */}
      <ValidationForm
        onSubmit={onValidationSubmit}
        onCancel={onValidationCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}