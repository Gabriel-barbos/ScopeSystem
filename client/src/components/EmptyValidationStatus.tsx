import { Search, Calendar, ClipboardCheck } from "lucide-react";

export function EmptyValidationState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Selecione um agendamento para validar
      </h3>
      
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
        Use o campo de busca acima para encontrar um carro por chassi, placa
        ou nome do cliente
      </p>

 
    </div>
  );
}