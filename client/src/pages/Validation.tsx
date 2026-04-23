import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchCheck, TableProperties } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { useServiceService } from "@/services/ServiceService";
import { productApi } from "@/services/ProductService";
import { ScheduleAutocomplete } from "@/components/schedule/ScheduleAutocomplete";
import { ScheduleDetails } from "@/components/schedule/ScheduleDetails";
import { ValidationForm, ValidationFormData, ProductRef } from "@/components/forms/ValidationForm";
import { ValidationSuccessModal } from "@/components/validation/ValidationSucessModal";
import { EmptyValidationState } from "@/components/validation/EmptyValidationStatus";
import { BulkValidationModal } from "@/components/validation/BulkValidationModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tag } from "antd";
import RoleIf from "@/components/layout/RoleIf";
import { Roles } from "@/utils/roles";


function mapFormToPayload(formData: ValidationFormData) {
  return {
    plate: formData.plate || undefined,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [products, setProducts] = useState<ProductRef[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const queryClient = useQueryClient();

  const { scheduleList, isLoading } = useScheduleService({
    limit: 1000,
    search: searchQuery || undefined,
  });

  const { createFromValidation } = useServiceService();

  useEffect(() => {
    productApi.getAll()
      .then((res) => setProducts(res.data ?? res))
      .catch(() => toast.error("Erro ao carregar produtos"));
  }, []);

  const handleValidationSubmit = async (formData: ValidationFormData) => {
    if (!selectedSchedule) return;

    if (isSubmitting || createFromValidation.isPending) return;

    setIsSubmitting(true);
    try {
      await createFromValidation.mutateAsync({
        scheduleId: selectedSchedule._id,
        validationData: mapFormToPayload(formData),
      });

     
      setSelectedSchedule(null);
      setShowSuccessModal(true);
      toast.success("Validação registrada com sucesso!");
    } catch {
      toast.error("Erro ao validar instalação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => setSelectedSchedule(null);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedSchedule(null); 
  };

  const handleNewValidation = () => {
    setShowSuccessModal(false);
    setSelectedSchedule(null);
  };

  return (
    <>
      <Card style={{ height: "auto", minHeight: 0, maxHeight: "none" }}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
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
          
          <RoleIf roles={[Roles.ADMIN, Roles.SCHEDULING]}>
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => setBulkOpen(true)}>
              <TableProperties className="w-4 h-4" />
              Validar em Lote
              <Tag color="blue"> Beta</Tag>
            </Button>
            </RoleIf>
            
          </div>
        </CardHeader>

        <CardContent className="space-y-6" style={{ height: "auto", minHeight: 0 }}>
          <ScheduleAutocomplete
            schedules={scheduleList}
            isLoading={isLoading}
            onSelect={setSelectedSchedule}
            selectedSchedule={selectedSchedule}
            onSearchChange={setSearchQuery}
          />

          {selectedSchedule ? (
            <>
              <ScheduleDetails schedule={selectedSchedule} />
              <Separator />
              <ValidationForm
                onSubmit={handleValidationSubmit}
                onCancel={handleCancel}
                // Combina os dois estados para garantir que o botão fique bloqueado
                isSubmitting={isSubmitting || createFromValidation.isPending}
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
        onClose={handleCloseSuccessModal}
        onNewValidation={handleNewValidation}
      />

      <BulkValidationModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["schedules"] });
          queryClient.invalidateQueries({ queryKey: ["services"] });
        }}
      />
    </>
  );
}

export default Validation;