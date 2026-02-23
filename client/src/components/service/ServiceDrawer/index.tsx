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
} from "lucide-react";

import InfoField from "@/components/global/InfoField";
import EditableField from "@/components/global/EditableField";
import { getStatusConfig, getServiceConfig } from "@/utils/badges";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Service } from "@/services/ServiceService";
import RoleIf from "../../RoleIf";
import { Roles } from "@/utils/roles";

import { useServiceDrawer } from "./useServiceDrawer";
import {
    COL_LEFT,
    COL_CENTER_LEFT,
    COL_CENTER_RIGHT,
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


const ServiceDrawer = ({ open, onClose, service }: ServiceDrawerProps) => {
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

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent
                    side="bottom"
                    className="min-h-[50vh] max-h-[72vh] h-auto flex flex-col"
                >
                    <SheetHeader>
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
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${serviceBadge.className}`}
                                        >
                                            <ServiceIcon className="h-3.5 w-3.5" />
                                            {serviceBadge.label}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}
                                        >
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusBadge.label}
                                        </span>

                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                  
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyAll}
                                                className="gap-1.5"
                                            >
                                                {copied ? (
                                                    <ClipboardCheck className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ClipboardCopy className="h-4 w-4" />
                                                )}
                                                {copied ? "Copiado!" : ""}
                                            </Button>
                                   

                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            className="gap-1.5"
                                        >
                                            <X className="h-4 w-4" /> Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="gap-1.5"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                            {isSaving ? "Salvando..." : "Salvar"}
                                        </Button>
                                    </>
                                ) : (
                                    !isLegacy && (
                                        <RoleIf roles={[Roles.ADMIN, Roles.SUPPORT, Roles.VALIDATION, Roles.SCHEDULING]}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleEdit}
                                                className="gap-1.5"
                                            >
                                                <Pencil className="h-4 w-4" /> Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setOpenDeleteModal(true)}
                                                disabled={isDeleting}
                                                className="gap-1.5 text-destructive hover:text-destructive"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                                Excluir
                                            </Button>
                                        </RoleIf>
                                    )
                                )}
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 flex justify-between py-6 overflow-y-auto">
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

                        <Separator orientation="vertical" className="h-auto mx-4" />

                        <div className="w-[360px] flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {current.validatedBy?.[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <FieldValue
                                    icon={() => null}
                                    label="Validado por"
                                    value={current.validatedBy || "Não informado"}
                                />
                            </div>

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

                            <div className="flex-1 flex flex-col min-h-0">
                                <span className="text-sm text-muted-foreground mb-2 block">
                                    Observações
                                </span>
                                <Textarea
                                    value={current.notes || ""}
                                    onChange={(e) =>
                                        isEditing && handleUpdate("notes", e.target.value)
                                    }
                                    readOnly={!isEditing}
                                    placeholder={
                                        isEditing ? "Adicione observações..." : "Sem observações"
                                    }
                                    className="flex-1 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="border-t pt-3">
                        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <span>Criado por {current.createdBy || "Sistema"}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>Criado em {formatDateTime(current.createdAt)}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>Modificado em {formatDateTime(current.updatedAt)}</span>
                            </div>
                            <span> <Badge variant={sourceBadge.variant} className="text-xs mx-1">
                                {sourceBadge.label}
                            </Badge>Protocolo: {current.protocolNumber || "—"}</span>

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