import { useState, useEffect, useMemo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Pencil,
    Trash2,
    X,
    Check,
    Hash,
    Car,
    KeySquare,
    SatelliteDish,
    ContactRound,
    UserCog,
    MapPin,
    Gauge,
    Shield,
    Monitor,
    CalendarCheck,
    Router ,
    FileText,
    ShieldMinus ,
    BookUser,
    LocateFixed,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import InfoField from "@/components/global/InfoField";
import EditableField from "@/components/global/EditableField";
import { getStatusConfig, getServiceConfig } from "@/utils/badges";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useServiceService, Service } from "@/services/ServiceService";

type ServiceDrawerProps = {
    open: boolean;
    onClose: () => void;
    service: Service | null;
};

//formatar data
const formatDate = (date?: string | null, opts?: Intl.DateTimeFormatOptions) =>
    date
        ? new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            ...opts,
        })
        : "Não informado";

const formatDateTime = (date?: string | null) =>
    formatDate(date, { hour: "2-digit", minute: "2-digit" });

const SERVICE_TYPE_LABELS: Record<string, string> = {
    installation: "Instalação",
    maintenance: "Manutenção",
    removal: "Remoção",
};

//cada item é um field
type FieldDef = {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    field: keyof Service;
    format?: (value: any, service: Service) => string;
    editable?: boolean; 
};

const COL_LEFT: FieldDef[] = [
    { icon: Monitor, label: "Device ID", field: "deviceId" },
    { icon: Hash, label: "Chassi", field: "vin" },
    { icon: Car, label: "Modelo", field: "model" },
    { icon: KeySquare, label: "Placa", field: "plate", format: (v) => v || "Não informada" },
    {
        icon: SatelliteDish,
        label: "Equipamento",
        field: "product",
        format: (v) => v?.name || "Não informado",
        editable: false,
    },
];

const COL_CENTER_LEFT: FieldDef[] = [
    {
        icon: ContactRound,
        label: "Cliente",
        field: "client",
        format: (v) => v?.name || "Não informado",
        editable: false,
    },
    { icon: BookUser, label: "Técnico", field: "technician" },
    { icon: UserCog, label: "Prestador", field: "provider", format: (v) => v || "Não informado" },
    { icon: LocateFixed, label: "Local de Instalação", field: "installationLocation" },
    { icon: MapPin, label: "Endereço do Serviço", field: "serviceAddress" },
];

const COL_CENTER_RIGHT: FieldDef[] = [
    {
        icon: Gauge,
        label: "Odômetro (km)",
        field: "odometer",
        format: (v) => (v != null ? String(v) : "Não informado"),
    },
    {
        icon: ShieldMinus,
        label: "Bloqueio",
        field: "blockingEnabled",
        format: (v) => (v ? "Habilitado" : "Desabilitado"),
        editable: false, // badge especial — tratado separado
    },
    {
        icon: Router,
        label: "Dispositivo Secundário",
        field: "secondaryDevice",
        format: (v) => v || "Não informado",
    },
    {
        icon: FileText,
        label: "Notas de Validação",
        field: "validationNotes",
        format: (v) => v || "Não informado",
    },
];

//rendeniza a coluna
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
                const display = def.format ? def.format(raw, service) : String(raw ?? "Não informado");

                // Badge especial para blockingEnabled
                if (def.field === "blockingEnabled") {
                    return (
                        <div key={def.field} className="flex items-center gap-3">
                            <def.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                                <span className="text-sm text-muted-foreground block">{def.label}</span>
                                <Badge
                                    variant={raw ? "default" : "secondary"}
                                    className="mt-0.5"
                                >
                                    {raw ? "Habilitado" : "Desabilitado"}
                                </Badge>
                            </div>
                        </div>
                    );
                }

                // Modo edição — apenas campos marcados como editáveis
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

                return <InfoField key={def.field} icon={def.icon} label={def.label} value={display} />;
            })}
        </div>
    );
}

const ServiceDrawer = ({ open, onClose, service }: ServiceDrawerProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState<Service | null>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const { deleteService, updateService } = useServiceService();
    const queryClient = useQueryClient();

    // Resetar estado de edição quando o drawer fecha ou o serviço muda
    useEffect(() => {
        setIsEditing(false);
        setEdited(null);
    }, [service, open]);

    if (!service) return null;

    // Fonte de dados ativa: editado (modo edição) ou original
    const current = edited ?? service;

    const statusBadge = getStatusConfig(current.status);
    const serviceBadge = getServiceConfig(current.serviceType);
    const StatusIcon = statusBadge.icon;
    const ServiceIcon = serviceBadge.icon;

    const handleEdit = () => {
        setEdited({ ...service });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEdited(null);
        setIsEditing(false);
    };

    const handleUpdate = (field: keyof Service, value: any) => {
        if (edited) setEdited({ ...edited, [field]: value });
    };

const handleSave = async () => {
    if (!edited) return;

    try {
        // Monta o payload apenas com os campos editáveis
        const payload: Partial<Service> = {
            deviceId: edited.deviceId,
            vin: edited.vin,
            model: edited.model,
            plate: edited.plate,
            technician: edited.technician,
            provider: edited.provider,
            installationLocation: edited.installationLocation,
            serviceAddress: edited.serviceAddress,
            odometer: edited.odometer,
            secondaryDevice: edited.secondaryDevice,
            validationNotes: edited.validationNotes,
            notes: edited.notes,
        };

        await updateService.mutateAsync({ 
            id: edited._id, 
            payload 
        });

        toast.success("Serviço atualizado com sucesso!");
        setIsEditing(false);
        setEdited(null);
        onClose();
    } catch (error) {
        toast.error("Erro ao atualizar serviço");
        console.error(error);
    }
};

    const handleDelete = async () => {
        try {
            await deleteService.mutateAsync(service._id);
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Serviço excluído com sucesso!");
            setOpenDeleteModal(false);
            onClose();
        } catch {
            toast.error("Erro ao excluir serviço");
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent side="bottom" className="min-h-[50vh] max-h-[72vh] h-auto flex flex-col">
                    {/*header*/}
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
                                    <span className="text-lg font-semibold">{current.vin}</span>
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

                            {/* Botões de ação */}
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5">
                                            <X className="h-4 w-4" /> Cancelar
                                        </Button>
                                        <Button size="sm" onClick={handleSave} className="gap-1.5">
                                            <Check className="h-4 w-4" /> Salvar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1.5">
                                            <Pencil className="h-4 w-4" /> Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setOpenDeleteModal(true)}
                                            className="gap-1.5 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" /> Excluir
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </SheetHeader>

                    {/*4 colunas */}
                    <div className="flex-1 flex justify-between py-6 overflow-y-auto">
                        {/* Colunas 1-3 (esquerda) */}
                        <div className="flex gap-12">
                            <FieldColumn fields={COL_LEFT} service={current} isEditing={isEditing} onUpdate={handleUpdate} />
                            <FieldColumn fields={COL_CENTER_LEFT} service={current} isEditing={isEditing} onUpdate={handleUpdate} />
                            <FieldColumn fields={COL_CENTER_RIGHT} service={current} isEditing={isEditing} onUpdate={handleUpdate} />
                        </div>

                        {/* Coluna  (direita) */}
                        <div className="w-[360px] flex flex-col gap-4">
                            {/* Validado por */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {current.validatedBy?.[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <span className="text-sm text-muted-foreground block">Validado por</span>
                                    <p className="font-medium text-sm truncate">{current.validatedBy || "Não informado"}</p>
                                </div>
                            </div>

                            {/* Datas */}
                            <InfoField icon={CalendarCheck} label="Validado em" value={formatDate(current.validatedAt)} />
                            <InfoField icon={Calendar} label="Data agendada" value={formatDate(current.scheduledDate)} />

                            {/* Observações (notes) */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <span className="text-sm text-muted-foreground mb-2 block">Observações</span>
                                <Textarea
                                    value={current.notes || ""}
                                    onChange={(e) => isEditing && handleUpdate("notes", e.target.value)}
                                    readOnly={!isEditing}
                                    placeholder={isEditing ? "Adicione observações..." : "Sem observações"}
                                    className="flex-1 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/*- FOOTER */}
                    <SheetFooter className="border-t pt-3">
                        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                            {/* Lado esquerdo: criado por + timestamps */}
                            <div className="flex items-center gap-4">
                                <span>Criado por {current.createdBy || "Sistema"}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>Criado em {formatDateTime(current.createdAt)}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>Modificado em {formatDateTime(current.updatedAt)}</span>
                            </div>

                            {/* Lado direito: source + protocolo */}
                            <div className="flex items-center gap-3">
                                <span>Protocolo: {current.protocolNumber || "—"}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {current.source === "validation" ? "Validado" : "Importado"}
                                </Badge>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Modal de confirmação de exclusão */}
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