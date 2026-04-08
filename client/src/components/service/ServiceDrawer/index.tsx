import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Pencil,
    Trash2,
    X,
    Check,
    CalendarCheck,
    Calendar,
    ClipboardCopy,
    ClipboardCheck,
    Loader2,
    Wrench,
    CalendarClock,
} from "lucide-react";

import InfoField from "@/components/global/InfoField";
import EditableField from "@/components/global/EditableField";
import { getStatusConfig, getServiceConfig } from "@/utils/badges";
import { ConfirmModal } from "@/components/global/ConfirmModal";
import { Service } from "@/services/ServiceService";
import RoleIf from "../../layout/RoleIf";
import { Roles } from "@/utils/roles";
import { useAuth } from "@/context/Authcontext";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { useServiceDrawer } from "./useServiceDrawer";
import {
    COL_LEFT,
    COL_CENTER_LEFT,
    COL_CENTER_RIGHT,
    COL_SCHEDULE,
    FieldDef,
    formatDate,
    formatDateTime,
    getSourceBadge,
} from "./fields";


type ServiceDrawerProps = {
    open: boolean;
    onClose: () => void;
    service: Service | null;
};

type ActiveTab = "service" | "schedule";



function FieldValue({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    const showTooltip = !!value && value !== "Não informado" && value !== "Não informada";

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-default max-w-[220px]">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                            <span className="text-sm text-muted-foreground block">{label}</span>
                            <p className="font-medium text-sm truncate">{value}</p>
                        </div>
                    </div>
                </TooltipTrigger>
                {showTooltip && (
                    <TooltipContent side="bottom" className="max-w-[360px] whitespace-normal">
                        <p className="text-sm">{value}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}


function FieldColumn({
    fields,
    service,
    isEditing,
    onUpdate,
}: {
    fields: FieldDef[];
    service: Service;
    isEditing: boolean;
    onUpdate: (field: keyof Service, value: any) => void;
}) {
    return (
        <div className="space-y-4">
            {fields.map((def) => {
                const raw = service[def.field];
                const display = def.format
                    ? def.format(raw, service)
                    : String(raw ?? "Não informado");

                if (def.field === "blockingEnabled") {
                    return (
                        <div key={def.field} className="flex items-center gap-3">
                            <def.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                                <span className="text-sm text-muted-foreground block">{def.label}</span>
                                <Badge variant={raw ? "default" : "secondary"} className="mt-0.5">
                                    {raw ? "Habilitado" : "Desabilitado"}
                                </Badge>
                            </div>
                        </div>
                    );
                }

                if (isEditing && def.editable !== false) {
                    return (
                        <EditableField
                            key={def.field}
                            icon={def.icon}
                            label={def.label}
                            value={String(raw ?? "")}
                            onChange={(value) => onUpdate(def.field, value)}
                            placeholder={def.label}
                        />
                    );
                }

                return (
                    <FieldValue
                        key={def.field}
                        icon={def.icon}
                        label={def.label}
                        value={display}
                    />
                );
            })}
        </div>
    );
}

function TabToggle({
    active,
    onChange,
}: {
    active: ActiveTab;
    onChange: (t: ActiveTab) => void;
}) {
    return (
        <div className="inline-flex rounded-lg border bg-muted p-0.5 gap-0.5">
            <button
                onClick={() => onChange("service")}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    active === "service"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Wrench className="h-3 w-3" />
                Serviço
            </button>
            <button
                onClick={() => onChange("schedule")}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    active === "schedule"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                <CalendarClock className="h-3 w-3" />
                Agendamento
            </button>
        </div>
    );
}

function ScheduleFieldGrid({
    service,
    isEditing,
    onUpdate,
}: {
    service: Service;
    isEditing: boolean;
    onUpdate: (field: keyof Service, value: any) => void;
}) {
    const hasAnyData = COL_SCHEDULE.some((def) => {
        const v = service[def.field];
        return v !== null && v !== undefined && v !== "";
    });

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sem dados de agendamento</p>
                <p className="text-xs text-muted-foreground max-w-[260px]">
                    Este serviço não possui dados de agendamento — provavelmente foi criado por importação direta.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-x-8 gap-y-5">
            {COL_SCHEDULE.map((def) => {
                const raw = service[def.field];
                const display = def.format
                    ? def.format(raw, service)
                    : String(raw ?? "Não informado");

                if (isEditing && def.editable !== false) {
                    return (
                        <EditableField
                            key={def.field}
                            icon={def.icon}
                            label={def.label}
                            value={String(raw ?? "")}
                            onChange={(value) => onUpdate(def.field, value)}
                            placeholder={def.label}
                        />
                    );
                }

                return (
                    <FieldValue
                        key={def.field}
                        icon={def.icon}
                        label={def.label}
                        value={display}
                    />
                );
            })}
        </div>
    );
}



const ServiceDrawer = ({ open, onClose, service }: ServiceDrawerProps) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("service");
    const { user } = useAuth();

    const canEditSchedule =
        user?.role === "administrator" || user?.role === "scheduling";

    const {
        current,
        isEditing,
        openDeleteModal,
        copied,
        isSaving,
        isDeleting,
        handleEdit,
        handleCancel,
        handleUpdate,
        handleSave,
        handleDelete,
        handleCopyAll,
        setOpenDeleteModal,
    } = useServiceDrawer(service, onClose);

    if (!service || !current) return null;

    const isLegacy = current.source === "legacy";
    const statusBadge = getStatusConfig(current.status);
    const serviceBadge = getServiceConfig(current.serviceType);
    const sourceBadge = getSourceBadge(current.source);
    const StatusIcon = statusBadge.icon;
    const ServiceIcon = serviceBadge.icon;

    const scheduleEditing = isEditing && activeTab === "schedule" && canEditSchedule;

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent
                    side="bottom"
                    className="min-h-[55vh] max-h-[78vh] h-auto flex flex-col gap-0 p-0"
                >
                    {/* ── Header ── */}
                    <SheetHeader className="px-6 py-4 border-b shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 rounded-lg">
                                    <AvatarImage
                                        src={service.client?.image?.[0]}
                                        alt={service.client?.name}
                                        className="object-contain"
                                    />
                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                                        {service.client?.name?.[0] ?? "S"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex flex-col gap-1">
                                    <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="text-lg font-semibold truncate max-w-[240px] cursor-default">
                                                    {current.vin}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <p>{current.vin}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${serviceBadge.className}`}>
                                            <ServiceIcon className="h-3.5 w-3.5" />
                                            {serviceBadge.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusBadge.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
                                    {copied ? (
                                        <ClipboardCheck className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <ClipboardCopy className="h-4 w-4" />
                                    )}
                                    {copied ? "Copiado!" : ""}
                                </Button>

                                {isEditing ? (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5">
                                            <X className="h-4 w-4" /> Cancelar
                                        </Button>
                                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            {isSaving ? "Salvando..." : "Salvar"}
                                        </Button>
                                    </>
                                ) : (
                                    !isLegacy && (
                                        <>
                                            <RoleIf roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION, Roles.SCHEDULING]}>
                                                <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1.5">
                                                    <Pencil className="h-4 w-4" /> Editar
                                                </Button>
                                            </RoleIf>
                                            <RoleIf roles={[Roles.ADMIN]}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setOpenDeleteModal(true)}
                                                    disabled={isDeleting}
                                                    className="gap-1.5 text-destructive hover:text-destructive"
                                                >
                                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    Excluir
                                                </Button>
                                            </RoleIf>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                        <div className="flex gap-0 h-full divide-x">

                            <div className="flex-1 px-6 py-5 overflow-y-auto">
                                {activeTab === "service" && (
                                    <div className="flex gap-8">
                                        <FieldColumn
                                            fields={COL_LEFT}
                                            service={current}
                                            isEditing={isEditing}
                                            onUpdate={handleUpdate}
                                        />
                                        <Separator orientation="vertical" className="h-auto" />
                                        <FieldColumn
                                            fields={COL_CENTER_LEFT}
                                            service={current}
                                            isEditing={isEditing}
                                            onUpdate={handleUpdate}
                                        />
                                        <Separator orientation="vertical" className="h-auto" />
                                        <FieldColumn
                                            fields={COL_CENTER_RIGHT}
                                            service={current}
                                            isEditing={isEditing}
                                            onUpdate={handleUpdate}
                                        />
                                    </div>
                                )}

                                {activeTab === "schedule" && (
                                    <ScheduleFieldGrid
                                        service={current}
                                        isEditing={scheduleEditing}
                                        onUpdate={handleUpdate}
                                    />
                                )}
                            </div>

                            <div className="w-[300px] shrink-0 flex flex-col gap-4 px-5 py-5 bg-muted/30">

                                {/* Validado por */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                            {current.validatedBy?.[0]?.toUpperCase() ?? "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Validado por</span>
                                        <p className="font-medium text-sm">{current.validatedBy || "Não informado"}</p>
                                    </div>
                                </div>

                                <Separator />

                                <InfoField
                                    icon={CalendarCheck}
                                    label="Instalado em"
                                    value={formatDate(current.validatedAt)}
                                />
                                <InfoField
                                    icon={Calendar}
                                    label="Data agendada"
                                    value={formatDate(current.scheduledDate)}
                                />

                                <Separator />

                                {/* Observações */}
                                <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Observações
                                    </span>
                                    <Textarea
                                        value={current.notes || ""}
                                        onChange={(e) =>
                                            isEditing && handleUpdate("notes", e.target.value)
                                        }
                                        readOnly={!isEditing}
                                        placeholder={isEditing ? "Adicione observações..." : "Sem observações"}
                                        className={cn(
                                            "flex-1 resize-none min-h-[120px] text-sm",
                                            !isEditing && "bg-transparent border-dashed cursor-default"
                                        )}
                                    />
                                </div>

                                {/* Aviso de permissão na aba de agendamento */}
                                {activeTab === "schedule" && isEditing && !canEditSchedule && (
                                    <p className="text-xs text-muted-foreground italic">
                                        Somente Administradores e Agendadores podem editar dados do agendamento.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <SheetFooter className="border-t px-6 py-3 shrink-0">
                        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <span>Criado por {current.createdBy || "Sistema"}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>Criado em {formatDateTime(current.createdAt)}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>Modificado em {formatDateTime(current.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <TabToggle active={activeTab} onChange={setActiveTab} />
                                <Badge variant={sourceBadge.variant} className="text-xs">
                                    {sourceBadge.label}
                                </Badge>
                                <span>Protocolo: {current.protocolNumber || "—"}</span>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmModal
                open={openDeleteModal}
                onOpenChange={(o) => !o && setOpenDeleteModal(false)}
                title="Excluir serviço"
                description={`Tem certeza que deseja excluir o serviço do veículo "${service.vin}"?`}
                confirmText="Excluir"
                onConfirm={handleDelete}
            />
        </>
    );
};

export default ServiceDrawer;