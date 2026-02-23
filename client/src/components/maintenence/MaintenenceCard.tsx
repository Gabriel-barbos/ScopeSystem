import {
    Calendar,
    Mail,
    User,
    Tag,
    ExternalLink,
    ChevronRight,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MaintenanceRequest } from "@/services/MaintenenceRequestService";
import { getStatusConfig, getServiceConfig } from "@/utils/badges";
import type { LucideIcon } from "lucide-react";
import MaintenanceDetailModal from "./MaintenanceDetailModal";
import MaintenanceActionModal from "./MaintenenceActionModal";

import { useState } from "react";
interface MaintenanceCardProps {
    request: MaintenanceRequest;
    onOpen?: (request: MaintenanceRequest) => void;
}

const schedulingMap: Record<string, { statusKey: string; label: string }> = {
  pending: { statusKey: "criado", label: "Criado" },
  waiting_address: { statusKey: "waiting_address", label: "Aguardando Endereço" },
  waiting_responsible: { statusKey: "waiting_responsible", label: "Aguardando Responsável" },
  completed: { statusKey: "concluido", label: "Concluído" },
  cancelled: { statusKey: "cancelado", label: "Cancelado" },
};

const ticketStatusColors: Record<string, string> = {
    Aberto: "bg-emerald-500",
    Fechado: "bg-muted-foreground/40",
    "Em andamento": "bg-primary",
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function BadgeItem({
    icon: Icon,
    label,
    className,
}: {
    icon: LucideIcon;
    label: string;
    className: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${className}`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

export default function MaintenanceCard({ request, onOpen }: MaintenanceCardProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);

    const mapping = schedulingMap[request.schedulingStatus] ?? schedulingMap.pending;
    const schedulingBadge = getStatusConfig(mapping.statusKey);

    const categoryBadge = getServiceConfig(request.category);

    const dotColor = ticketStatusColors[request.status] ?? "bg-muted-foreground/40";

    return (
        <div className="group relative flex bg-card text-card-foreground rounded-xl border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
            <div className="relative w-3 shrink-0 rounded-l-xl bg-primary/80">
                <div className="absolute -right-[5px] top-5 h-2.5 w-2.5 rounded-full bg-background border border-border" />
                <div className="absolute -right-[5px] bottom-5 h-2.5 w-2.5 rounded-full bg-background border border-border" />
            </div>

            <div className="flex-1 min-w-0 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                            </div>
                            <h3 className="truncate text-sm font-semibold text-foreground max-w-sm">
                                {request.subject}
                            </h3>

                            <span className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-medium  bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200 border-teal-300  dark:border-teal-800">
                                #{request.ticketNumber}
                            </span>

                            <BadgeItem
                                icon={schedulingBadge.icon}
                                label={mapping.label}
                                className={schedulingBadge.className}
                            />

                        </div>
                    </div>

                    <Button
          size="sm"
          onClick={() => setActionOpen(true)}
          className="h-8 shrink-0 gap-1.5 px-3.5 text-xs font-medium"
        >
          Abrir
          <ExternalLink className="h-3 w-3" />
        </Button>
                </div>

                <div className="my-3 border-t border-dashed border-border" />

                <div className="flex items-end justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 " />
                            {request.contactName}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 " />
                            {request.contactEmail}
                        </span>
                    </div>

                    <button
                        onClick={() => setDetailsOpen(true)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground/90 transition-colors hover:text-primary"
                    >
                        Ver detalhes
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/90">
                    <Clock className="h-3 w-3" />
                    Solicitado em {formatDate(request.createdAt)} via
                    <span className="font-medium capitalize">
                        {request.source}
                    </span>
                </div>
            </div>

            <div className="relative w-2 shrink-0 rounded-r-xl bg-transparent">
                <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-6 w-2.5 rounded-l-full bg-background border-l border-y border-border" />
            </div>
            <MaintenanceDetailModal
                request={request}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
            />

    <MaintenanceActionModal
        request={request}
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        onSave={(data) => {
          console.log("Salvar:", data);
          setActionOpen(false);
        }}
      />
        </div>

    );
}