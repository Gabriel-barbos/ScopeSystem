import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Calendar, Wrench, Loader2 } from "lucide-react";

interface ExportButtonProps {
  onExportSchedules: () => void | Promise<void>;
  onExportServices: () => void | Promise<void>;
  className?: string;
}


export function ExportButton({
  onExportSchedules,
  onExportServices,
}: ExportButtonProps) {
  const [loading, setLoading] = useState<null | "schedules" | "services">(null);

  const handleExport = async (
    type: "schedules" | "services",
    action: () => Promise<void>
  ) => {
    try {
      setLoading(type);
      await action();
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              Exportar para Excel
              <FileDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!!loading}
          onClick={() =>
            handleExport("schedules", onExportSchedules)
          }
        >
          {loading === "schedules" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="mr-2 h-4 w-4" />
          )}
          Agendamentos
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!!loading}
          onClick={() =>
            handleExport("services", onExportServices)
          }
        >
          {loading === "services" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wrench className="mr-2 h-4 w-4" />
          )}
          Serviços
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
