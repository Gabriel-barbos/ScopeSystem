import {
  UserSearch,
  Calendar,
  AlertCircle,
  CheckCircle,
  Wrench,
  CircleX,
  Settings,
  SquareX,
  ClipboardList,
  BellPlus,
  TriangleAlert,
  Shield,
  Headset,
  Wallet,
} from "lucide-react";
import { LucideIcon } from "lucide-react";



// Status
export type StatusType =
  | "criado"
  | "agendado"
  | "atrasado"
  | "concluido"
  | "cancelado"
  | "observacao";

// Serviços
export type ServiceType = "maintenance" | "installation" | "removal";

export type BackendRole =
  | "administrator"
  | "validation"
  | "support"
  | "scheduling"
  | "billing";

export type RoleType =
  | "Administrador"
  | "Validação"
  | "Suporte"
  | "Agendamento"
  | "Financeiro";

interface BadgeConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}


export const statusConfig: Record<StatusType, BadgeConfig> = {
  criado: {
    label: "Criado",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    icon: BellPlus,
  },
  agendado: {
    label: "Agendado",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: Calendar,
  },
  atrasado: {
    label: "Atrasado",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    icon: AlertCircle,
  },
  observacao: {
    label: "Em Observação",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    icon: TriangleAlert,
  },
  cancelado: {
    label: "Cancelado",
    className:
      "bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    icon: SquareX,
  },
  concluido: {
    label: "Concluído",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
};


export const serviceConfig: Record<string, BadgeConfig> = {
  maintenance: {
    label: "Manutenção",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    icon: Settings,
  },
  installation: {
    label: "Instalação",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    icon: Wrench,
  },
  removal: {
    label: "Remoção",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    icon: CircleX,
  },
  default: {
    label: "Outro",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    icon: ClipboardList,
  },
};


export const roleConfig: Record<RoleType, BadgeConfig> = {
  Administrador: {
    label: "Administrador",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    icon: Shield,
  },
  Suporte: {
    label: "Suporte",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: Headset,
  },
  Agendamento: {
    label: "Agendamento",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    icon: Calendar,
  },
  Financeiro: {
    label: "Financeiro",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
    icon: Wallet,
  },
  Validação: {
    label: "Validação",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    icon: Wrench,
  },
};


const roleAliasMap: Record<BackendRole, RoleType> = {
  administrator: "Administrador",
  support: "Suporte",
  scheduling: "Agendamento",
  validation: "Validação",
  billing: "Financeiro",
};


export const getStatusConfig = (status: string): BadgeConfig =>
  statusConfig[status as StatusType] || statusConfig.criado;

export const getServiceConfig = (serviceType: string): BadgeConfig =>
  serviceConfig[serviceType] || serviceConfig.default;

export const getRoleConfig = (role: string): BadgeConfig => {
  const normalizedRole =
    roleAliasMap[role as BackendRole] ?? role;

  return (
    roleConfig[normalizedRole as RoleType] || {
      label: normalizedRole,
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      icon: UserSearch,
    }
  );
};


export const statusFilterOptions = Object.entries(statusConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  })
);

export const serviceFilterOptions = (data: any[]) => {
  const services = new Set(
    data.map((item) => item.serviceType).filter(Boolean)
  );

  return Array.from(services).map((service) => ({
    value: service,
    label: getServiceConfig(service).label,
  }));
};

export const roleFilterOptions = Object.entries(roleConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  })
);
