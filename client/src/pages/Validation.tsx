import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchCheck } from "lucide-react";
import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { ScheduleAutocomplete } from "@/components/ScheduleAutocomplete";
import { ScheduleDetails } from "@/components/schedule/ScheduleDetails";
import { ValidationFormData } from "@/components/forms/ValidationForm";
import { ValidationSuccessModal } from "@/components/ValidationSucessModal";
import { EmptyValidationState } from "@/components/EmptyValidationStatus";
import { toast } from "sonner";

function Validation() {
  const { data: schedules = [], isLoading } = useScheduleService();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectSchedule = (schedule: Schedule | null) => {
    setSelectedSchedule(schedule);
  };

  const handleValidationSubmit = async (data: ValidationFormData) => {
    if (!selectedSchedule) return;

    setIsSubmitting(true);
    
    try {
      console.log("Validation data submitted:", {
        scheduleId: selectedSchedule._id,
        ...data,
      });
      
      // Aqui você faria a chamada à API
      // await validationService.submit(selectedSchedule._id, data);
      
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mostrar modal de sucesso
      setShowSuccessModal(true);
      
      // Toast de confirmação
      toast.success("Validação registrada com sucesso!");
    } catch (error) {
      toast.error("Erro ao validar instalação. Tente novamente.");
      console.error("Validation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationCancel = () => {
    setSelectedSchedule(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Manter o agendamento selecionado para visualização
  };

  const handleNewValidation = () => {
    setShowSuccessModal(false);
    setSelectedSchedule(null);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <SearchCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-2xl">Validação de Instalação</CardTitle>
              <CardDescription>
                Valide e registre os dados de instalação dos equipamentos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campo de busca - sempre visível */}
          <ScheduleAutocomplete
            schedules={schedules}
            isLoading={isLoading}
            onSelect={handleSelectSchedule}
            selectedSchedule={selectedSchedule}
          />

          {/* Estado vazio ou detalhes do agendamento */}
          {selectedSchedule ? (
            <ScheduleDetails
              schedule={selectedSchedule}
              onValidationSubmit={handleValidationSubmit}
              onValidationCancel={handleValidationCancel}
              isSubmitting={isSubmitting}
            />
          ) : (
            <EmptyValidationState />
          )}
        </CardContent>
      </Card>

      {/* Modal de sucesso */}
      <ValidationSuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onNewValidation={handleNewValidation}
      />
    </>
  );
}

export default Validation;