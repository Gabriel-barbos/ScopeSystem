import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

export interface ValidationPayload {
  deviceId: string;
  technician: string;
  installationLocation: string;
  serviceAddress: string;
  odometer?: number;
  blockingEnabled: boolean;
  protocolNumber?: string;
  validationNotes?: string;
  secondaryDevice?: string;
}

export interface CreateFromValidationPayload {
  scheduleId: string;
  validationData: ValidationPayload;
}

export interface Service {
  _id: string;
  plate?: string;
  vin: string;
  model: string;
  scheduledDate?: string;
  serviceType: string;
  notes?: string;
  createdBy?: string;
  product?: { _id: string; name: string };
  client: { _id: string; name: string; image?: string[] };
  deviceId: string;
  provider?: string;
  technician: string;
  installationLocation: string;
  serviceAddress: string;
  odometer?: number;
  blockingEnabled: boolean;
  protocolNumber?: string;
  validationNotes?: string;
  secondaryDevice?: string;
  validatedAt: string;
  schedule?: string;
  source: "validation" | "import" | "legacy";
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ServiceListResponse {
  data: Service[];
  pagination: ServicePagination;
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  client?: string;
}

export interface BulkImportServicePayload {
  plate?: string;
  vin: string;
  model: string;
  serviceType: string;
  client: string;
  product?: string;
  deviceId: string;
  technician: string;
  provider?: string;
  installationLocation: string;
  serviceAddress: string;
  odometer?: number;
  blockingEnabled: boolean;
  protocolNumber?: string;
  validationNotes?: string;
  secondaryDevice?: string;
  validatedBy?: string;
  validatedAt?: string | Date;
  status?: string;
}

export const serviceApi = {
  getAll: async (filters: ServiceFilters = {}): Promise<ServiceListResponse> => {
    const params = new URLSearchParams();
    if (filters.page)        params.set("page",        String(filters.page));
    if (filters.limit)       params.set("limit",       String(filters.limit));
    if (filters.search)      params.set("search",      filters.search);
    if (filters.status)      params.set("status",      filters.status);
    if (filters.serviceType) params.set("serviceType", filters.serviceType);
    if (filters.client)      params.set("client",      filters.client);

    const { data } = await API.get(`/services?${params.toString()}`);
    return data;
  },

  getById: async (id: string): Promise<Service> => {
    const { data } = await API.get(`/services/${id}`);
    return data;
  },

  createFromValidation: async (payload: CreateFromValidationPayload): Promise<Service> => {
    const { data } = await API.post("/services/from-validation", payload);
    return data;
  },

  bulkImport: async (
    services: BulkImportServicePayload[]
  ): Promise<{ success: boolean; count: number; message: string }> => {
    const { data } = await API.post("/services/bulk-import", { services });
    return data;
  },

  update: async (id: string, payload: Partial<Service>): Promise<Service> => {
    const { data } = await API.put(`/services/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/services/${id}`);
  },
};

export function useServiceService(filters: ServiceFilters = {}) {
  const queryClient = useQueryClient();

  const services = useQuery({
    queryKey: ["services", filters],
    queryFn: () => serviceApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const createFromValidation = useMutation({
    mutationFn: serviceApi.createFromValidation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const bulkImport = useMutation({
    mutationFn: serviceApi.bulkImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const deleteService = useMutation({
    mutationFn: serviceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const updateService = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Service> }) =>
      serviceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    ...services,
    createFromValidation,
    bulkImport,
    deleteService,
    updateService,
  };
}