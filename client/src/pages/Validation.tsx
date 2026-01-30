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
import { ScheduleAutocomplete } from "@/components/ScheduleAutocomplete";
import { ScheduleDetails } from "@/components/schedule/ScheduleDetails";
import { ValidationForm, ValidationFormData } from "@/components/forms/ValidationForm";
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowSuccessModal(true);
      toast.success("Validação registrada com sucesso!");
    } catch (error) {
      toast.error("Erro ao validar instalação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* SOLUÇÃO: style inline para forçar height auto */}
      <Card style={{ height: 'auto', minHeight: 0, maxHeight: 'none' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <SearchCheck className="h-6 w-6 text-primary" />
            </div>

            <div>
              <CardTitle className="text-2xl">
                Validação de Instalação
              </CardTitle>
              <CardDescription>
                Valide e registre os dados de instalação dos equipamentos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6" style={{ height: 'auto', minHeight: 0 }}>
          {/* Campo de busca */}
          <ScheduleAutocomplete
            schedules={schedules}
            isLoading={isLoading}
            onSelect={handleSelectSchedule}
            selectedSchedule={selectedSchedule}
          />

          {selectedSchedule ? (
            <>
              {/* Informações do veículo e cliente */}
              <ScheduleDetails schedule={selectedSchedule} />

              {/* Separador */}
              <Separator />

              {/* Formulário de validação */}
              <ValidationForm
                onSubmit={handleValidationSubmit}
                onCancel={() => setSelectedSchedule(null)}
                isSubmitting={isSubmitting}
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