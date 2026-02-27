import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { useServiceService } from "@/services/ServiceService";
import { productApi } from "@/services/ProductService";
import { ScheduleAutocomplete } from "@/components/ScheduleAutocomplete";
import { ScheduleDetails } from "@/components/schedule/ScheduleDetails";
import { ValidationForm, ValidationFormData, ProductRef } from "@/components/forms/ValidationForm";
import { ValidationSuccessModal } from "@/components/ValidationSucessModal";
import { EmptyValidationState } from "@/components/EmptyValidationStatus";
import { toast } from "sonner";

function mapFormToPayload(formData: ValidationFormData) {
  return {
    deviceId: formData.equipmentId,
    technician: formData.technicianName,
    installationLocation: formData.installationLocation,
    product: formData.productId || undefined,
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
  const { scheduleList, isLoading } = useScheduleService();
  const { createFromValidation } = useServiceService();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [products, setProducts] = useState<ProductRef[]>([]);

  // Carrega todos os produtos uma vez ao montar — mesma abordagem do ScheduleDrawer
  useEffect(() => {
    productApi.getAll()
      .then((res) => setProducts(res.data ?? res))
      .catch(() => toast.error("Erro ao carregar produtos"));
  }, []);

  const handleValidationSubmit = async (formData: ValidationFormData) => {
    if (!selectedSchedule) return;
    try {
      await createFromValidation.mutateAsync({
        scheduleId: selectedSchedule._id,
        validationData: mapFormToPayload(formData),
      });
      setShowSuccessModal(true);
      toast.success("Validação registrada com sucesso!");
    } catch {
      toast.error("Erro ao validar instalação. Tente novamente.");
    }
  };

  const handleCancel = () => setSelectedSchedule(null);

  const handleNewValidation = () => {
    setShowSuccessModal(false);
    setSelectedSchedule(null);
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
              <CardDescription>Valide e registre os dados de instalação dos equipamentos</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6" style={{ height: "auto", minHeight: 0 }}>
          <ScheduleAutocomplete
            schedules={scheduleList}
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
                onCancel={handleCancel}
                isSubmitting={createFromValidation.isPending}
                products={products}
                defaultProductId={selectedSchedule.product?._id ?? ""}
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
        onNewValidation={handleNewValidation}
      />
    </>
  );
}

export default Validation;