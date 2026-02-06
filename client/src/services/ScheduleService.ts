import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

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
  status: "criado" | "agendado" | "concluido" | "atrasado" | "cancelado";
  provider?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
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
  status?: "criado" | "agendado" | "concluido" | "atrasado" | "cancelado";
  createdBy?: string;
  orderNumber?: string;
  provider?: string;
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
}

export const scheduleApi = {
  getAll: async (): Promise<Schedule[]> => {
    const { data } = await API.get("/schedules");
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

  bulkCreate: async (schedules: SchedulePayload[]): Promise<{ success: boolean; count: number; message: string }> => {
    const { data } = await API.post("/schedules/bulk", { schedules });
    return data;
  },

  bulkUpdate: async (schedules: BulkUpdatePayload[]): Promise<{
    errors: any; success: boolean; count: number; message: string 
}> => {
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

export function useScheduleService() {
  const queryClient = useQueryClient();

  const schedules = useQuery({
    queryKey: ["schedules"],
    queryFn: scheduleApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const createSchedule = useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const bulkCreateSchedules = useMutation({
    mutationFn: scheduleApi.bulkCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const bulkUpdateSchedules = useMutation({
    mutationFn: scheduleApi.bulkUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulePayload }) => 
      scheduleApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: scheduleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  return {
    ...schedules,
    createSchedule,
    bulkCreateSchedules,
    bulkUpdateSchedules, 
    updateSchedule,
    deleteSchedule,
  };
}