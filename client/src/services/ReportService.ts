import { useQuery } from "@tanstack/react-query";
import API from "@/api/axios";


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

export const reportApi = {
  getData: async (params: ReportParams): Promise<ReportData> => {
    console.log("Fazendo requisição com params:", params); // DEBUG
    const { data } = await API.get("/reports", { params });
    console.log(" Resposta recebida:", data); // DEBUG
    return data;
  },

  export: async (type: "schedules" | "services") => {
    const response = await API.get("/reports/export", {
      params: { type },
      responseType: "blob",
    });

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  },
};

export function useReportService(params: ReportParams = {}) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportApi.getData(params),
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });
}