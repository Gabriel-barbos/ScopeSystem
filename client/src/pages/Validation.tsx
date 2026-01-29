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
      {/* 🔑 Wrapper precisa ocupar toda a altura do <main> */}
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col">
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

          {/* 🔑 Content ocupa o resto do Card */}
          <CardContent className="flex-1 flex flex-col gap-6">
            <ScheduleAutocomplete
              schedules={schedules}
              isLoading={isLoading}
              onSelect={handleSelectSchedule}
              selectedSchedule={selectedSchedule}
            />

            {/* 🔑 Detalhes ocupam o espaço restante */}
            <div className="flex-1">
              {selectedSchedule ? (
                <ScheduleDetails
                  schedule={selectedSchedule}
                  onValidationSubmit={handleValidationSubmit}
                  onValidationCancel={() => setSelectedSchedule(null)}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <EmptyValidationState />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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