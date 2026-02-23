import { Calendar, CalendarPlus, SquarePen, CirclePlus, FileSpreadsheet, FilePen } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniversalDrawer } from "@/components/UniversalDrawer";
import { ImportModal } from "@/components/ImportModal";
import ScheduleForm from "@/components/forms/ScheduleForm";
import ScheduleTable from "@/components/schedule/ScheduleTable/ScheduleTable";
import { useScheduleService } from "@/services/ScheduleService";
import type { SchedulePayload } from "@/services/ScheduleService";
import { useAuth } from "@/context/Authcontext";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EditScheduleModal } from "@/components/schedule/EditScheduleModal";
export default function Appointments() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const { bulkUpdateSchedules } = useScheduleService()

  const { bulkCreateSchedules } = useScheduleService();
  const { user } = useAuth();

  function openCreate() {
    setEditingScheduleId(null);
    setIsDrawerOpen(true);
  }


  const handleImport = async (data: Record<string, any>[]) => {
    try {
      // Transformar dados do Excel em payload válido
      const schedules: SchedulePayload[] = data.map((row) => ({
        plate: row.Placa || undefined,
        vin: row.Chassi,
        model: row.Modelo,
        serviceType: row.TipoServico || "maintenance",
        client: row.ClienteId,
        product: row.EquipamentoId || undefined,
        scheduledDate: row.Data || undefined,
        notes: row.Observacoes || undefined,
        provider: row.Prestador || undefined,
        NumeroPedido : "NumeroPedido",
        // Regras de negócio adicionais
        status: row.Data ? "agendado" : "criado",
        createdBy: user?.name || "Sistema",
      }));

      // Enviar para o backend
      await bulkCreateSchedules.mutateAsync(schedules);

      toast.success(`${schedules.length} agendamentos importados com sucesso!`);
      setModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao importar agendamentos");
      console.error("Erro no import:", error);
    }
  };

    const handleBulkUpdate = async (data: Record<string, any>[]) => {
    try {
      const result = await bulkUpdateSchedules.mutateAsync(data)
      
      toast.success(result.message)
      
      //  erros parciais
      if (result.errors && result.errors.length > 0) {
        toast.warning("Alguns registros apresentaram erros", {
          description: result.errors.slice(0, 3).join(", ")
        })
      }
    } catch (error: any) {
      toast.error("Erro ao modificar agendamentos", {
        description: error.response?.data?.error || error.message
      })
      
      //
      if (error.response?.data?.details) {
        console.error("Detalhes dos erros:", error.response.data.details)
      }
      
      throw error 
    }
  }
  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Agendamentos</CardTitle>
            <CardDescription>Gerencie seus agendamentos</CardDescription>
          </div>
          <Button className="ml-auto" variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            Importar Dados<FileSpreadsheet />
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={() => setEditModalOpen(true)}> <FilePen /> </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar em Lote</p>
            </TooltipContent>
          </Tooltip>


          <Button size="sm" onClick={openCreate}>
            Criar Agendamento <CalendarPlus />
          </Button>

          <UniversalDrawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              setIsDrawerOpen(open);
              if (!open) setEditingScheduleId(null);
            }}
            title={editingScheduleId ? "Editar Agendamento" : "Cadastrar Agendamento"}
            icon={editingScheduleId ? <SquarePen /> : <CirclePlus />}
            styleType={editingScheduleId ? "edit" : "create"}
          >
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-4 scrollbar-hidden">
              <ScheduleForm
                scheduleId={editingScheduleId}
                onSuccess={() => {
                  setIsDrawerOpen(false);
                  setEditingScheduleId(null);
                }}
                onCancel={() => {
                  setIsDrawerOpen(false);
                  setEditingScheduleId(null);
                }}
              />
            </div>
          </UniversalDrawer>
        </div>
      </CardHeader>
      <CardContent>
        <ImportModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Importar Agendamentos"
          templateUrl="/templates/agendamentos.xlsx"
          templateName="template-agendamentos.xlsx"
          onImport={handleImport}
          columnMapping={{
            Placa: "Placa",
            Chassi: "Chassi",
            Modelo: "Modelo",
            Cliente: "Cliente",
            Equipamento: "Equipamento",
            TipoServico: "TipoServico",
            Data: "Data",
            Prestador: "Prestador",
            NumeroPedido : "NumeroPedido",
            Observacoes: "Observacoes",
          }}
        />

          <EditScheduleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        templateUrl="/templates/Edit_agendamentos.xlsx"
        templateName="template-edicao-agendamentos.xlsx"
        onUpdate={handleBulkUpdate}
      />
        <ScheduleTable />
      </CardContent>
    </Card>
  );
}