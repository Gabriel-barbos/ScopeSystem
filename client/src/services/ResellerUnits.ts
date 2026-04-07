import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

export interface ResellerUnit {
  _id: string;
  unit_number: string;
  old_reseller: string;
  new_reseller: string;
  status: "pending" | "done";
  askedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkCreatePayload {
  units: Array<{
    unit_number: string;
    old_reseller?: string;
    new_reseller?: string;
    askedBy?: string;
  }>;
}

export interface BulkUpdateStatusPayload {
  ids: string[];
  status: "pending" | "done";
}

export interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  old_reseller?: string;
  new_reseller?: string;
  askedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

//API

export const resellerUnitsApi = {
  getSummary: async (): Promise<{ pending: number; done: number; total: number }> => {
    const { data } = await API.get("/reseller-units/summary");
    return data;
  },

  getAll: async (params?: ListParams): Promise<PaginatedResponse<ResellerUnit>> => {
    const { data } = await API.get("/reseller-units", { params });
    return data;
  },

  getById: async (id: string): Promise<ResellerUnit> => {
    const { data } = await API.get(`/reseller-units/${id}`);
    return data;
  },

  createOne: async (payload: {
  unit_number: string
  old_reseller: string
  new_reseller: string
  askedBy?: string
}): Promise<{ success: boolean; created: number }> => {
  const { data } = await API.post("/reseller-units/bulk", {
    units: [payload],
  })
  return data
},


  bulkCreate: async (payload: BulkCreatePayload): Promise<{ success: boolean; created: number }> => {
    const { data } = await API.post("/reseller-units/bulk", payload);
    return data;
  },

  bulkUpdateStatus: async (payload: BulkUpdateStatusPayload): Promise<{ success: boolean; updated: number }> => {
    const { data } = await API.put("/reseller-units/bulk/status", payload);
    return data;
  },

  bulkDelete: async (ids: string[]): Promise<{ success: boolean; deleted: number }> => {
    const { data } = await API.delete("/reseller-units/bulk", { data: { ids } });
    return data;
  },

  updateOne: async (id: string, payload: Partial<ResellerUnit>): Promise<ResellerUnit> => {
    const { data } = await API.put(`/reseller-units/${id}`, payload);
    return data;
  },

  deleteOne: async (id: string): Promise<void> => {
    await API.delete(`/reseller-units/${id}`);
  },

  exportUnitNumbers: async (params?: Pick<ListParams, "status" | "old_reseller" | "new_reseller" | "askedBy" | "dateFrom" | "dateTo">): Promise<Array<{ unit_number: string; old_reseller: string | null; askedBy: string }>> => {
  const { data } = await API.get("/reseller-units/export", { params });
  return data.data as Array<{ unit_number: string; old_reseller: string | null; askedBy: string }>;
},
};

//Hooks

const KEYS = {
  all:     ["reseller-units"] as const,
  list:    (p?: ListParams) => ["reseller-units", "list", p] as const,
  summary: ["reseller-units-summary"] as const,
  detail:  (id: string) => ["reseller-units", "detail", id] as const,
};

export function useResellerUnitsSummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  resellerUnitsApi.getSummary,
    staleTime: 1000 * 30,
  });
}

export function useResellerUnits(params?: ListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn:  () => resellerUnitsApi.getAll(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev, 
  });
}

export function useResellerUnitById(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => resellerUnitsApi.getById(id),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  });
}


export function useResellerUnitsMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: KEYS.all });
    queryClient.invalidateQueries({ queryKey: KEYS.summary });
  };

  const bulkCreate = useMutation({
    mutationFn: resellerUnitsApi.bulkCreate,
    onSuccess:  invalidateAll,
    onError:    (e: Error) => console.error("[bulkCreate]", e.message),
  });

  const createOne = useMutation({
  mutationFn: resellerUnitsApi.createOne,
  onSuccess: invalidateAll,
  onError: (e: Error) => console.error("[createOne]", e.message),
})

  const bulkUpdateStatus = useMutation({
    mutationFn: resellerUnitsApi.bulkUpdateStatus,
    onSuccess:  invalidateAll,
    onError:    (e: Error) => console.error("[bulkUpdateStatus]", e.message),
  });

  const bulkDelete = useMutation({
    mutationFn: resellerUnitsApi.bulkDelete,
    onSuccess:  invalidateAll,
    onError:    (e: Error) => console.error("[bulkDelete]", e.message),
  });

  const updateOne = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ResellerUnit> }) =>
      resellerUnitsApi.updateOne(id, payload),
    onSuccess:  invalidateAll,
    onError:    (e: Error) => console.error("[updateOne]", e.message),
  });

  const deleteOne = useMutation({
    mutationFn: resellerUnitsApi.deleteOne,
    onSuccess:  invalidateAll,
    onError:    (e: Error) => console.error("[deleteOne]", e.message),
  });

return { bulkCreate, bulkUpdateStatus, bulkDelete, updateOne, deleteOne, createOne }
}