import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import API from "@/api/axios";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

// Instância dedicada para exports — sem timeout (arquivos grandes)
const EXPORT_API = axios.create({
  baseURL: API.defaults.baseURL,
  timeout: 0,
});

EXPORT_API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // silent
  }
  return config;
});

EXPORT_API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// ─── Interfaces ───────────────────────────────────────────

export interface ServicesByType {
  instalacoes: number;
  manutencoes: number;
  desinstalacoes: number;
}

export interface SchedulesByStatus {
  pendentes: number;
  cancelados: number;
  concluidos: number;
}

export interface PendingByClient {
  client: string;
  installation: number;
  maintenance: number;
  removal: number;
  total: number;
}

export interface PendingByProvider {
  provider: string;
  pending: number;
}

export interface EvolutionEntry {
  month: string;
  installation: number;
  maintenance: number;
  removal: number;
  total: number;
}

export interface DayEntry {
  day: string;
  installation: number;
  maintenance: number;
  removal: number;
  total: number;
}

export interface ServiceByClient {
  client: string;
  total: number;
}

export interface ReportDailyClient {
  client: string;
  installation: number;
  maintenance: number;
  removal: number;
  total: number;
}

export interface ReportDaily {
  totals: {
    installation: number;
    maintenance: number;
    removal: number;
    total: number;
  };
  clients: ReportDailyClient[];
}

export interface ReportData {
  servicesByType: ServicesByType;
  schedulesByStatus: SchedulesByStatus;
  pendingByClient: PendingByClient[];
  pendingByProvider: PendingByProvider[];
  evolutionByMonth: EvolutionEntry[];
  evolutionByDay: Record<string, DayEntry[]>;
  servicesByClient: ServiceByClient[];
  reportDaily: ReportDaily;
}

interface ReportParams {
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

export interface ExportPayload {
  type: "services" | "schedules";
  includeOldData?: boolean;
  dateFrom?: string | null;
  dateTo?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────

function dateRangeToStrings(dateRange?: DateRange) {
  if (!dateRange?.from) return { dateFrom: null, dateTo: null };
  return {
    dateFrom: format(dateRange.from, "yyyy-MM-dd"),
    dateTo: dateRange.to
      ? format(dateRange.to, "yyyy-MM-dd")
      : format(dateRange.from, "yyyy-MM-dd"),
  };
}

// ─── API ─────────────────────────────────────────────────

export const reportApi = {
  getData: async (params: ReportParams): Promise<ReportData> => {
    const { data } = await API.get("/reports", { params });
    return data;
  },

  export: async (
    type: "schedules" | "services",
    dateRange?: DateRange,
    includeOldData?: boolean
  ) => {
    const { dateFrom, dateTo } = dateRangeToStrings(dateRange);

    const payload: ExportPayload = {
      type,
      includeOldData: type === "services" ? (includeOldData ?? false) : false,
      dateFrom,
      dateTo,
    };

    const response = await EXPORT_API.post("/reports/export", payload, {
      responseType: "blob",
    });

    const timestamp = format(new Date(), "yyyy-MM-dd");
    const suffix = includeOldData ? "-com-legado" : "";
    const periodSuffix = dateFrom ? `-${dateFrom}-a-${dateTo}` : "";
    const filename = `${type}-report${suffix}${periodSuffix}-${timestamp}.xlsx`;

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
};

// ─── Hook ─────────────────────────────────────────────────

export function useReportService(params: ReportParams = {}) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportApi.getData(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}