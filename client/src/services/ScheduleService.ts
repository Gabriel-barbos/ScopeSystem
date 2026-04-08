import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

export interface ServiceSummary {
  _id: string;
  vin: string;
  plate?: string;
  model?: string;
  client: { _id: string; name: string; image?: string[] };
  serviceType: string;
  deviceId?: string;
  technician?: string;
  validatedAt?: string;
  protocolNumber?: string;
  provider?: string;
  responsible?: string;
  product?: { _id: string; name: string };
  orderDate?: string;
  orderNumber?: string;
  source?: string;
  installationLocation?: string;
  validationNotes?: string;
}

interface ClientRef {
  _id: string;
  name: string;
  image?: string[];
}

interface ProductRef {
  _id: string;
  name: string;
}

export interface Schedule {
  _id: string;
  title: string;
  plate?: string;
  vin: string;
  model?: string;
  scheduledDate?: string;
  serviceType: string;
  orderNumber?: string;
  notes?: string;
  client: ClientRef;
  product?: ProductRef;
  status: "criado" | "agendado" | "concluido" | "frustrado" | "cancelado" | "atrasado";
  provider?: string;
  vehicleGroup?: string;
  responsible?: string;
  responsiblePhone?: string;
  serviceAddress?: string;
  condutor?: string;
  orderDate?: string;
  serviceLocation?: string;
  situation?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  removalDate?: string;
  reason?: string;
}

export interface SchedulePayload {
  plate?: string;
  vin: string;
  model?: string;
  scheduledDate?: any;
  serviceType: string;
  notes?: string;
  client: string;
  product?: string;
  status?: "criado" | "agendado" | "concluido" | "atrasado" | "cancelado" | "frustrado";
  createdBy?: string;
  orderNumber?: string;
  provider?: string;
  responsible?: string;
  responsiblePhone?: string;
  condutor?: string;
  serviceAddress?: string;
  serviceLocation?: string;
  vehicleGroup?: string;
  orderDate?: string;
  situation?: string;
  removalDate?: string;
  reason?: string;
}

export interface BulkUpdatePayload {
  vin: string;
  status?: string;
  client?: string;
  scheduledDate?: any;
  model?: string;
  plate?: string;
  serviceType?: string;
  product?: string;
  notes?: string;
  provider?: string;
  createdBy?: string;
  orderDate?: string;
  vehicleGroup?: string;
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

export interface ScheduleVinSearchResponse {
  schedules: Schedule[];
  services: ServiceSummary[];
  pagination: Pagination;
}

export type ScheduleListResponse = PaginatedResponse<Schedule> | ScheduleVinSearchResponse;

export function isVinSearchResponse(data: ScheduleListResponse): data is ScheduleVinSearchResponse {
  return 'schedules' in data;
}

export interface ScheduleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  client?: string;
  responsible?: string;
}

export const scheduleApi = {
  getAll: async (params?: ScheduleQueryParams): Promise<ScheduleListResponse> => {
    const { data } = await API.get("/schedules", {
      params: {
        page:  params?.page  ?? 1,
        limit: params?.limit ?? 50,
        ...(params?.search      && { search:      params.search }),
        ...(params?.status      && { status:      params.status }),
        ...(params?.serviceType && { serviceType: params.serviceType }),
        ...(params?.responsible && { responsible: params.responsible }),
        ...(params?.client && { client: params.client })
      },
    });
    return data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const { data } = await API.get(`/schedules/${id}`);
    return data;
  },

  create: async (payload: SchedulePayload): Promise<Schedule> => {
    const { data } = await API.post("/schedules", payload);
    return data;
  },

  bulkCreate: async (
    schedules: SchedulePayload[]
  ): Promise<{ success: boolean; count: number; message: string }> => {
    const { data } = await API.post("/schedules/bulk", { schedules });
    return data;
  },

  bulkUpdate: async (
    schedules: BulkUpdatePayload[]
  ): Promise<{ errors: any; success: boolean; count: number; message: string }> => {
    const { data } = await API.put("/schedules/bulk", { schedules });
    return data;
  },

  update: async (id: string, payload: SchedulePayload): Promise<Schedule> => {
    const { data } = await API.put(`/schedules/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/schedules/${id}`);
  },
};

export function useScheduleService(params?: ScheduleQueryParams) {
  const queryClient = useQueryClient();

  const schedules = useQuery({
    queryKey: ["schedules", params],
    queryFn:  () => scheduleApi.getAll(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    enabled: params !== undefined || true,
  });

  const rawData = schedules.data;
  let isVinSearch = false;
  let scheduleList: Schedule[] = [];
  let vinServices: ServiceSummary[] = [];
  let pagination: Pagination | undefined;

  if (rawData) {
    if (isVinSearchResponse(rawData)) {
      isVinSearch    = true;
      scheduleList   = rawData.schedules;
      vinServices    = rawData.services;
      pagination     = rawData.pagination;
    } else {
      scheduleList   = rawData.data;
      pagination     = rawData.pagination;
    }
  }

  const createSchedule = useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const bulkCreateSchedules = useMutation({
    mutationFn: scheduleApi.bulkCreate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const bulkUpdateSchedules = useMutation({
    mutationFn: scheduleApi.bulkUpdate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulePayload }) =>
      scheduleApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const deleteSchedule = useMutation({
    mutationFn: scheduleApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  return {
    ...schedules,
    scheduleList,
    pagination,
    isVinSearch,
    vinServices,
    createSchedule,
    bulkCreateSchedules,
    bulkUpdateSchedules,
    updateSchedule,
    deleteSchedule,
  };
}