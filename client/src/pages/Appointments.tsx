import { Calendar, CalendarPlus, SquarePen, CirclePlus, FileSpreadsheet, FilePen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniversalDrawer } from "@/components/global/UniversalDrawer";
import ScheduleForm from "@/components/forms/ScheduleForm";
import ScheduleTable from "@/components/schedule/ScheduleTable/ScheduleTable";
import { useScheduleService, type BulkUpdateError, type BulkUpdatePayload, type BulkUpdateResponse } from "@/services/ScheduleService";
import { useAuth } from "@/context/Authcontext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EditScheduleModal } from "@/components/schedule/EditScheduleModal";

interface ApiErrorLike {
  response?: {
    data?: {
      errors?: unknown;
      error?: unknown;
      message?: unknown;
      details?: unknown;
    };
  };
  message?: string;
}

function formatBulkUpdateError(error: unknown) {
  const apiError = error as ApiErrorLike;
  const data = apiError?.response?.data;
  const rawErrors = data?.details ?? data?.errors ?? data?.error ?? data?.message ?? apiError?.message;
  const errors = Array.isArray(rawErrors) ? rawErrors : [rawErrors];

  return errors
    .filter(Boolean)
    .map((item) => {
      if (typeof item === "string") return item;
      const detail = item as Record<string, unknown>;
      const line = detail.row ?? detail.line ?? detail.linha;
      const vin = detail.vin ?? detail.chassi;
      const message = detail.message ?? detail.error ?? detail.motivo ?? "Registro inválido";
      return [line ? `Linha ${line}` : null, vin ? `Chassi ${vin}` : null, message]
        .filter(Boolean)
        .join(": ");
    })
    .join(", ");
}

function formatBulkUpdateResultErrors(result: BulkUpdateResponse) {
  const detailErrors = result.details ?? [];
  const structuredErrors = (result.errors ?? []).map(formatBulkUpdateErrorItem);

  return [...detailErrors, ...structuredErrors].filter(Boolean);
}

function formatBulkUpdateErrorItem(item: BulkUpdateError) {
  const line = item.line ?? item.row;
  const vin = item.vin ?? item.chassi;
  const message = item.message ?? item.error ?? "Registro inválido";

  return [line ? `Linha ${line}` : null, vin ? `Chassi ${vin}` : null, message]
    .filter(Boolean)
    .join(": ");
}

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

  const handleBulkUpdate = async (data: BulkUpdatePayload[]) => {
    try {
      const result = await bulkUpdateSchedules.mutateAsync(data);

      if (result.failed && result.failed > 0) {
        const updated = result.updated ?? result.count ?? 0;
        const errors = formatBulkUpdateResultErrors(result);

        toast.warning(`${updated} agendamento(s) atualizado(s), ${result.failed} com erro`, {
          description: errors.slice(0, 3).join(", "),
        });
        return result;
      }

      toast.success(result.message);
      return result;
    } catch (error: unknown) {
      const description = formatBulkUpdateError(error);
      toast.error("Erro ao modificar agendamentos", {
        description: description || "Verifique os dados da planilha e tente novamente.",
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
