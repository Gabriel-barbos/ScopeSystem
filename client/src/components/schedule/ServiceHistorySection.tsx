import { useState, useCallback } from "react";
import { CalendarCheck, Eye, SatelliteDish, UserCog, HardDrive, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceSummary } from "@/services/ScheduleService";
import { Service } from "@/services/ServiceService";
import { getServiceConfig } from "@/utils/badges";
import ServiceDrawer from "@/components/service/ServiceDrawer";

//helpers 
function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// card de um service
function ServiceHistoryCard({
  service,
  onOpen,
}: {
  service: ServiceSummary;
  onOpen: (s: ServiceSummary) => void;
}) {
  const svcConfig = getServiceConfig(service.serviceType);
  const Icon = svcConfig.icon;

  return (
    <div
      onClick={() => onOpen(service)}
      className="
        flex items-center gap-4 px-4 py-3 rounded-xl border
        bg-sky-50/40 dark:bg-sky-950/20
        border-sky-200/60 dark:border-sky-800/40
        hover:bg-sky-50/80 dark:hover:bg-sky-950/40
        hover:border-sky-300/60 dark:hover:border-sky-700/50
        transition-all duration-150 cursor-pointer group
      "
    >
      {/* Badge tipo serviço */}
      <span
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          text-xs font-medium border shrink-0 ${svcConfig.className}
        `}
      >
        <Icon className="h-3 w-3" />
        {svcConfig.label}
      </span>

      {/* Info central */}
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1">
        {service.validatedAt && (
          <span className="inline-flex items-center gap-1 text-xs">
            <CalendarCheck className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
            {formatDate(service.validatedAt)}
          </span>
        )}
        {service.deviceId && (
          <span className="inline-flex items-center gap-1 text-xs font-mono">
            <SatelliteDish className="h-3 w-3 shrink-0" />
            {service.deviceId}
          </span>
        )}
        {service.technician && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <UserCog className="h-3 w-3 shrink-0" />
            {service.client.name}
          </span>
        )}
        {service.protocolNumber && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <HardDrive className="h-3 w-3 shrink-0" />
            {service.product.name}
          </span>
        )}
      </div>

      {/* Ação */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-100/60"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(service);
        }}
      >
        <Eye className="h-4 w-4 mr-1.5" />
        Detalhes
      </Button>
    </div>
  );
}

interface ServiceHistorySectionProps {
  services: ServiceSummary[];
}

export default function ServiceHistorySection({ services }: ServiceHistorySectionProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpen = useCallback((s: ServiceSummary) => {
    // Converte ServiceSummary para Service (campos suficientes para o drawer)
    setSelectedService(s as unknown as Service);
    setDrawerOpen(true);
  }, []);

  const handleClose = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  if (services.length === 0) return null;

  return (
    <>
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-2 px-1 pt-2 pb-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          <History className="h-3.5 w-3.5" />
          Histórico de Serviços ({services.length})
        </div>
        <div className="flex-1 h-px bg-sky-200/60 dark:bg-sky-800/40" />
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-1.5 px-1">
        {services.map((service) => (
          <ServiceHistoryCard key={service._id} service={service} onOpen={handleOpen} />
        ))}
      </div>

      <ServiceDrawer
        open={drawerOpen}
        onClose={handleClose}
        service={selectedService}
      />
    </>
  );
}
