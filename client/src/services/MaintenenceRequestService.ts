import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

export interface Vehicle {
  plate?: string;
  vin?: string; // chassi
  serviceAddress?: string;
  responsible?: string;
  responsiblePhone?: string;
}

export interface MaintenanceRequest {
  _id: string;
  ticketNumber: string;
  ticketId: string;
  subject: string;
  description: string;
  contactName: string;
  contactEmail: string;
  status: string;
  category: string;
  source: string;
  schedulingStatus: string;
  client?: string;
  vehicles: Vehicle[];
  schedules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMaintenanceRequestPayload {
  subject?: string;
  schedulingStatus?: string;
  vehicles?: Vehicle[];
  client?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API
export const maintenanceRequestApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MaintenanceRequest>> => {
    const { data } = await API.get("/maintenance", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 1000,
      },
    });
    return data;
  },

  getById: async (id: string): Promise<MaintenanceRequest> => {
    const { data } = await API.get(`/maintenance/${id}`);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateMaintenanceRequestPayload
  ): Promise<MaintenanceRequest> => {
    const { data } = await API.patch(`/maintenance/${id}`, payload);
    return data;
  },

    createSchedules: async (
    id: string, 
    createdBy?: string
  ): Promise<{ schedulesCreated: number }> => {
    const { data } = await API.post(`/maintenance/${id}/create-schedules`, {
      createdBy
    });
    return data;
  },


  delete: async (id: string): Promise<void> => {
    await API.delete(`/maintenance/${id}`);
  },
};

// HOOK
export function useMaintenanceRequestService(params?: {
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const maintenanceRequests = useQuery({
    queryKey: ["maintenanceRequests", params?.page, params?.limit],
    queryFn: () => maintenanceRequestApi.getAll(params),
    staleTime: 1000 * 60 * 5,
  });

  const updateMaintenanceRequest = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMaintenanceRequestPayload;
    }) => maintenanceRequestApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
    },
  });

  const createSchedules = useMutation({
    mutationFn: (id: string) => maintenanceRequestApi.createSchedules(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] }); // invalida schedules também
    },
  });

  const deleteMaintenanceRequest = useMutation({
    mutationFn: maintenanceRequestApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
    },
  });

  return {
    ...maintenanceRequests,
    updateMaintenanceRequest,
    createSchedules,
    deleteMaintenanceRequest,
  };
}