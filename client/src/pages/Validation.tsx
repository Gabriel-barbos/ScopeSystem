import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchCheck, Search, FileQuestion, Hash, KeySquare, Car, Wrench, MessageSquare } from "lucide-react";
import InfoField from "@/components/global/InfoField";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { ScheduleAutocomplete } from "@/components/ScheduleAutocomplete";

type ViewState = "empty" | "selected" | "not-found";

import { getStatusConfig, getServiceConfig } from "@/utils/badges";


function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Pesquise um veículo para validar
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Digite o chassi ou placa do veículo no campo acima para começar
      </p>
    </div>
  );
}

interface NotFoundStateProps {
  onReset: () => void;
}

function NotFoundState({ onReset }: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <FileQuestion className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Agendamento não encontrado
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        Não foi possível encontrar um agendamento com os dados informados
      </p>
      <Button variant="outline" onClick={onReset}>
        Nova pesquisa
      </Button>
    </div>
  );
}

interface ScheduleDetailsProps {
  schedule: Schedule;
}

function ScheduleDetails({ schedule }: ScheduleDetailsProps) {
  const status = getStatusConfig(schedule.status);
  const service = getServiceConfig(schedule.serviceType);

  const StatusIcon = status.icon;
  const ServiceIcon = service.icon;

  return (
    <div className="space-y-6">
      {/* Header com título e status */}
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{status.label}</span>
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${service.className}`}>
          <ServiceIcon className="h-3.5 w-3.5" />
          <span>{service.label}</span>
        </span>
      </div>


      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Veículo</h4>
        <div className="grid grid-cols-3 gap-3">
          <InfoField icon={Hash} label="Chassi" value={schedule.vin} />
          {schedule.plate && (
            <InfoField icon={KeySquare} label="Placa" value={schedule.plate} />
          )}
          {schedule.model && (
            <InfoField icon={Car} label="Modelo" value={schedule.model} />
          )}

          <div className="flex items-center gap-3">

            {schedule.client.image?.[0] && (
              <img
                src={schedule.client.image[0]}
                alt={schedule.client.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-medium">{schedule.client.name}</p>
              {schedule.product && (
                <p className="text-xs text-muted-foreground">
                  Equipamento: {schedule.product.name}
                </p>
              )}
              
            </div>

          </div>
          <InfoField icon={MessageSquare} label="Observações" value={schedule.notes} />

        </div>
      </div>



      {/* Placeholder para futuro formulário de validação */}
      <Separator />
      <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Área para formulário de validação
        </p>
      </div>
    </div>
  );
}

function Validation() {
  const { data: schedules = [], isLoading } = useScheduleService();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [viewState, setViewState] = useState<ViewState>("empty");

  const handleSelectSchedule = (schedule: Schedule | null) => {
    setSelectedSchedule(schedule);

    if (schedule) {
      setViewState("selected");
    } else {
      setViewState("empty");
    }
  };

  const handleReset = () => {
    setSelectedSchedule(null);
    setViewState("empty");
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <SearchCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-2xl">Validação</CardTitle>
              <CardDescription>Valide instalações</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Campo de busca */}
          <div className="flex items-end gap-4 mb-6">
            <ScheduleAutocomplete
              schedules={schedules}
              isLoading={isLoading}
              onSelect={handleSelectSchedule}
              selectedSchedule={selectedSchedule}
            />
          </div>

          {/* Estados condicionais */}
          {viewState === "empty" && <EmptyState />}

          {viewState === "not-found" && <NotFoundState onReset={handleReset} />}

          {viewState === "selected" && selectedSchedule && (
            <ScheduleDetails schedule={selectedSchedule} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Validation;