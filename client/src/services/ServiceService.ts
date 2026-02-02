import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

// Formato backend 
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

// Payload completo para o endpoint
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
  provider: string;
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
  source: "validation" | "import";
  createdAt?: string;
  updatedAt?: string;
}

export const serviceApi = {
  getAll: async (): Promise<Service[]> => {
    const { data } = await API.get("/services");
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

  update: async (id: string, payload: Partial<Service>): Promise<Service> => {
    const { data } = await API.put(`/services/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/services/${id}`);
  },
};

export function useServiceService() {
  const queryClient = useQueryClient();

  const services = useQuery({
    queryKey: ["services"],
    queryFn: serviceApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  // Após validação bem-sucedida, invalida tanto services quanto schedules
  // porque o agendamento mudou para "concluido" no backend
  const createFromValidation = useMutation({
    mutationFn: serviceApi.createFromValidation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
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
    deleteService,
    updateService
  };
}