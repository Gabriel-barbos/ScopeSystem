import { Calendar, CalendarPlus, SquarePen, CirclePlus, FileSpreadsheet, FilePen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniversalDrawer } from "@/components/global/UniversalDrawer";
import ScheduleForm from "@/components/forms/ScheduleForm";
import ScheduleTable from "@/components/schedule/ScheduleTable/ScheduleTable";
import { useScheduleService } from "@/services/ScheduleService";
import { useAuth } from "@/context/Authcontext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EditScheduleModal } from "@/components/schedule/EditScheduleModal";

export default function Appointments() {
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { bulkUpdateSchedules } = useScheduleService();
  const { user } = useAuth();

  function openCreate() {
    setEditingScheduleId(null);
    setIsDrawerOpen(true);
  }

  const handleBulkUpdate = async (data: Record<string, any>[]) => {
    try {
      const result = await bulkUpdateSchedules.mutateAsync(data);
      toast.success(result.message);
      if (result.errors?.length > 0) {
        toast.warning("Alguns registros apresentaram erros", {
          description: result.errors.slice(0, 3).join(", "),
        });
      }
    } catch (error: any) {
      toast.error("Erro ao modificar agendamentos", {
        description: error.response?.data?.error || error.message,
      });
      throw error;
    }
  };

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

          {/* Redireciona para a nova página de importação */}
          <Button
            className="ml-auto"
            variant="outline"
            size="sm"
            onClick={() => navigate("/import/schedules")}
          >
            Importar Dados <FileSpreadsheet className="ml-1.5 h-4 w-4" />
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                <FilePen />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar em Lote</p>
            </TooltipContent>
          </Tooltip>

          <Button size="sm" onClick={openCreate}>
            Criar Agendamento <CalendarPlus className="ml-1.5 h-4 w-4" />
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
                onSuccess={() => { setIsDrawerOpen(false); setEditingScheduleId(null); }}
                onCancel={() => { setIsDrawerOpen(false); setEditingScheduleId(null); }}
              />
            </div>
          </UniversalDrawer>
        </div>
      </CardHeader>

      <CardContent>
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