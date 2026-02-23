import {
    Hash,
    Car,
    KeySquare,
    SatelliteDish,
    ContactRound,
    UserCog,
    MapPin,
    Gauge,
    Router,
    FileText,
    ShieldMinus,
    BookUser,
    LocateFixed,
    Folder,
} from "lucide-react";
import { Service } from "@/services/ServiceService";


export type FieldDef = {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    field: keyof Service;
    format?: (value: any, service: Service) => string;
    editable?: boolean;
    truncate?: boolean;
};


export const formatDate = (
    date?: string | null,
    opts?: Intl.DateTimeFormatOptions
) =>
    date
        ? new Date(date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              ...opts,
          })
        : "Não informado";

export const formatDateTime = (date?: string | null) =>
    formatDate(date, { hour: "2-digit", minute: "2-digit" });


export const getSourceBadge = (source?: string) => {
    switch (source) {
        case "validation":
            return { label: "Validado", variant: "secondary" as const };
        case "legacy":
            return { label: "Legado", variant: "outline" as const };
        default:
            return { label: "Importado", variant: "secondary" as const };
    }
};


export const COL_LEFT: FieldDef[] = [
    { icon: SatelliteDish, label: "ID do dispositivo", field: "deviceId" },
    { icon: Hash, label: "Chassi", field: "vin" },
    { icon: Car, label: "Modelo", field: "model" },
    {
        icon: KeySquare,
        label: "Placa",
        field: "plate",
        format: (v) => v || "Não informada",
    },
    {
        icon: SatelliteDish,
        label: "Equipamento",
        field: "product",
        format: (v) => v?.name || "Não informado",
        editable: false,
    },
];

export const COL_CENTER_LEFT: FieldDef[] = [
    {
        icon: ContactRound,
        label: "Cliente",
        field: "client",
        format: (v) => v?.name || "Não informado",
        editable: false,
    },
    { icon: BookUser, label: "Técnico", field: "technician" },
    {
        icon: UserCog,
        label: "Prestador",
        field: "provider",
        format: (v) => v || "Não informado",
    },
    {
        icon: LocateFixed,
        label: "Local de Instalação",
        field: "installationLocation",
        truncate: true,
    },
    {
        icon: MapPin,
        label: "Endereço do Serviço",
        field: "serviceAddress",
        truncate: true,
    },
];

export const COL_CENTER_RIGHT: FieldDef[] = [
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
        editable: false,
    },
    {
        icon: Router,
        label: "Dispositivo Secundário",
        field: "secondaryDevice",
        format: (v) => v || "Não informado",
    },
    {
        icon: Folder,
        label: "Grupo de Veículos",
        field: "vehicleGroup",
        format: (v) => v || "Não informado",
    },
    {
        icon: FileText,
        label: "Notas de Validação",
        field: "validationNotes",
        format: (v) => v || "Não informado",
        truncate: true,
    },
];



const ALL_COLUMNS = [...COL_LEFT, ...COL_CENTER_LEFT, ...COL_CENTER_RIGHT];

export const EDITABLE_FIELDS = ALL_COLUMNS.filter(
    (f) => f.editable !== false
).map((f) => f.field);

export const EXTRA_EDITABLE_FIELDS: (keyof Service)[] = ["notes"];



export function buildTSV(service: Service, notes: string): string {
    const allFields = [...COL_LEFT, ...COL_CENTER_LEFT, ...COL_CENTER_RIGHT];

    const headers = [...allFields.map((f) => f.label), "Observações"];
    const values = [
        ...allFields.map((f) => {
            const raw = service[f.field];
            return f.format ? f.format(raw, service) : String(raw ?? "Não informado");
        }),
        notes || "Sem observações",
    ];

    return [headers.join("\t"), values.join("\t")].join("\n");
}