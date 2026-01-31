import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { useServiceService } from "@/services/ServiceService";
import { ScheduleAutocomplete } from "@/components/ScheduleAutocomplete";
import { ScheduleDetails } from "@/components/schedule/ScheduleDetails";
import { ValidationForm, ValidationFormData } from "@/components/forms/ValidationForm";
import { ValidationSuccessModal } from "@/components/ValidationSucessModal";
import { EmptyValidationState } from "@/components/EmptyValidationStatus";
import { toast } from "sonner";

// Mapeia os campos do formulário para o formato que o backend espera
function mapFormToPayload(formData: ValidationFormData) {
  return {
    deviceId: formData.equipmentId,
    technician: formData.technicianName,
    installationLocation: formData.installationLocation,
    serviceAddress: formData.address,
    odometer: formData.odometer ? Number(formData.odometer) : undefined,
    blockingEnabled: formData.blockingEnabled,
    protocolNumber: formData.protocolNumber || undefined,
    validatedBy: formData.validatedBy,
    validationNotes: formData.hasObservations ? formData.observations : undefined,
    secondaryDevice: formData.hasSecondaryDevice ? formData.secondaryDeviceId : undefined,
    status: formData.keepUnderObservation ? "observacao" : "concluido",
  };
}

function Validation() {
  const { data: schedules = [], isLoading } = useScheduleService();
  const { createFromValidation } = useServiceService();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleValidationSubmit = async (formData: ValidationFormData) => {
    if (!selectedSchedule) return;

    try {
      await createFromValidation.mutateAsync({
        scheduleId: selectedSchedule._id,
        validationData: mapFormToPayload(formData),
      });

      setShowSuccessModal(true);
      toast.success("Validação registrada com sucesso!");
    } catch (error) {
      toast.error("Erro ao validar instalação. Tente novamente.");
    }
  };

  return (
    <>
      <Card style={{ height: "auto", minHeight: 0, maxHeight: "none" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <SearchCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Validação de Instalação</CardTitle>
              <CardDescription>
                Valide e registre os dados de instalação dos equipamentos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6" style={{ height: "auto", minHeight: 0 }}>
          <ScheduleAutocomplete
            schedules={schedules}
            isLoading={isLoading}
            onSelect={setSelectedSchedule}
            selectedSchedule={selectedSchedule}
          />

          {selectedSchedule ? (
            <>
              <ScheduleDetails schedule={selectedSchedule} />
              <Separator />
              <ValidationForm
                onSubmit={handleValidationSubmit}
                onCancel={() => setSelectedSchedule(null)}
                isSubmitting={createFromValidation.isPending}
              />
            </>
          ) : (
            <EmptyValidationState />
          )}
        </CardContent>
      </Card>

      <ValidationSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNewValidation={() => {
          setShowSuccessModal(false);
          setSelectedSchedule(null);
        }}
      />
    </>
  );
}

export default Validation;