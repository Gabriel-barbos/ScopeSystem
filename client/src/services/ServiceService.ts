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
  vehicleGroup?: string;
  product?: string;
  plate?: string;
  
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
  status: string;
  validatedBy: string;
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
  vehicleGroup?: string;
  schedule?: string;
  source: "validation" | "import" | "legacy";
  createdAt?: string;
  updatedAt?: string;
  // Campos herdados do Schedule
  orderNumber?: string;
  orderDate?: string;
  responsible?: string;
  responsiblePhone?: string;
  condutor?: string;
  situation?: string;
  serviceLocation?: string;
  reason?: string;
  maintenanceRequest?: string;
  ticketNumber?: string;
  subject?: string;
  description?: string;
  category?: string;
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
  // filtros server-side por coluna
  client?: string;
  vin?: string;
  deviceId?: string;
  serviceType?: string;
  validatedAtStart?: string;
  validatedAtEnd?: string;
  // busca global (placa / chassi / device — param legado)
  search?: string;
}

//Bulk Validation

export interface ResolvedVinSchedule {
  id: string;
  model: string;
  plate?: string;
  client: string;
  product?: string;
  serviceType: string;
  status: string;
}

export interface ResolvedVinItem {
  line: number;
  vin: string;
  found: boolean;
  schedule: ResolvedVinSchedule | null;
}

export interface BulkValidationItem {
  vin: string;
  validationData: {
    deviceId: string | null;
    technician: string | null;
    installationLocation: string | null;
    plate?: string | null;
    product?: string | null;
    odometer?: number | null;
    blockingEnabled?: boolean | string | null;
    protocolNumber?: string | null;
    validationNotes?: string | null;
    secondaryDevice?: string | null;
    validatedBy?: string | null;
    validatedAt?: string | Date | null;
  };
}

export interface BulkValidationPayload {
  items: BulkValidationItem[];
}

export interface BulkValidationResultItem {
  line: number;
  vin: string;
  serviceId?: string;
  reason?: string;
  error?: string;
}

export interface BulkValidationResponse {
  success: boolean;
  summary: { total: number; created: number; skipped: number; errors: number };
  created: BulkValidationResultItem[];
  skipped: BulkValidationResultItem[];
  errors: BulkValidationResultItem[];
}

//Bulk Import (legacy)

export interface BulkImportServicePayload {
  plate?: string;
  vin: string;
  model?: string;
  serviceType: string;
  client: string;
  product?: string;
  deviceId?: string;
  technician?: string;
  provider?: string;
  installationLocation?: string;
  serviceAddress?: string;
  odometer?: number;
  blockingEnabled?: boolean;
  protocolNumber?: string;
  validationNotes?: string;
  secondaryDevice?: string;
  validatedBy?: string;
  validatedAt?: string | Date;
  status?: string;
  // Campos herdados do Schedule
  orderNumber?: string;
  orderDate?: string | Date;
  scheduledDate?: string | Date;
  responsible?: string;
  responsiblePhone?: string;
  condutor?: string;
  vehicleGroup?: string;
  situation?: string;
  serviceLocation?: string;
  reason?: string;
  notes?: string;
}

export const serviceApi = {
  getAll: async (filters: ServiceFilters = {}): Promise<ServiceListResponse> => {
    const params = new URLSearchParams();
    if (filters.page)             params.set("page",             String(filters.page));
    if (filters.limit)            params.set("limit",            String(filters.limit));
    if (filters.client)           params.set("client",           filters.client);
    if (filters.vin)              params.set("vin",              filters.vin);
    if (filters.deviceId)         params.set("deviceId",         filters.deviceId);
    if (filters.serviceType)      params.set("serviceType",      filters.serviceType);
    if (filters.validatedAtStart) params.set("validatedAtStart", filters.validatedAtStart);
    if (filters.validatedAtEnd)   params.set("validatedAtEnd",   filters.validatedAtEnd);
    if (filters.search)           params.set("search",           filters.search);

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

  resolveVins: async (vins: string[]): Promise<ResolvedVinItem[]> => {
    const { data } = await API.post("/services/resolve-vins", { vins });
    return data;
  },

  bulkValidation: async (payload: BulkValidationPayload): Promise<BulkValidationResponse> => {
    const { data } = await API.post("/services/bulk-validation", payload, {
      validateStatus: (s) => s < 500,
    });
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