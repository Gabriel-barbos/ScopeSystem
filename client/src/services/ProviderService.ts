import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Contact {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Provider {
  _id: string;
  name: string;
  image: string | null;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderPayload {
  name: string;
  image?: File;
  contacts?: Omit<Contact, "_id">[];
}

export interface ProvidersResponse {
  data: Provider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProviderListParams {
  search?: string;
  page?: number;
  limit?: number;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export const providerApi = {
  getAll: async (params?: ProviderListParams): Promise<ProvidersResponse> => {
    const { data } = await API.get("/providers", { params });
    return data;
  },

  getById: async (id: string): Promise<Provider> => {
    const { data } = await API.get(`/providers/${id}`);
    return data;
  },

  create: async (payload: ProviderPayload): Promise<Provider> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.image) formData.append("image", payload.image);
    if (payload.contacts) {
      formData.append("contacts", JSON.stringify(payload.contacts));
    }
    const { data } = await API.post("/providers", formData);
    return data;
  },

  update: async (id: string, payload: Partial<ProviderPayload>): Promise<Provider> => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.image) formData.append("image", payload.image);
    if (payload.contacts) {
      formData.append("contacts", JSON.stringify(payload.contacts));
    }
    const { data } = await API.put(`/providers/${id}`, formData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/providers/${id}`);
  },
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useProviderService(params?: ProviderListParams) {
  const queryClient = useQueryClient();

  const providers = useQuery({
    queryKey: ["providers", params],
    queryFn: () => providerApi.getAll(params),
    staleTime: 1000 * 60 * 5,
  });

  const createProvider = useMutation({
    mutationFn: providerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });

  const updateProvider = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProviderPayload> }) =>
      providerApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });

  const deleteProvider = useMutation({
    mutationFn: providerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });

  return {
    ...providers,
    createProvider,
    updateProvider,
    deleteProvider,
  };
}
