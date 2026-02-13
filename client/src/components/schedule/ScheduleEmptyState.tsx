import React from "react";
import { CalendarPlus, SearchX } from "lucide-react";
import { Button } from "antd";

interface ScheduleEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const ScheduleEmptyState: React.FC<ScheduleEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {hasFilters ? (
      <>
        <SearchX className="h-14 w-14 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Nenhum resultado encontrado
        </h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm">
          Os filtros aplicados não retornaram nenhum agendamento.
          Tente ajustar ou limpar os filtros.
        </p>
        <Button type="primary" onClick={onClearFilters}>
          Limpar todos os filtros
        </Button>
      </>
    ) : (
      <>
        <CalendarPlus className="h-14 w-14 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Nenhum agendamento ainda
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Quando agendamentos forem criados, eles aparecerão aqui.
        </p>
      </>
    )}
  </div>
);

export default ScheduleEmptyState;