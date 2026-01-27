import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

//type que vem do backend
export interface Client {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  image?: string[];
  createdAt?: string;
  updatedAt?: string;
}

//type que enviamos para o backend
export interface ClientPayload {
  name: string;
  description?: string;
  type?: string;
  image?: File | File[];
}

//API METHODS
 export const clientApi = {
  getAll: async (): Promise<Client[]> => {
    const { data } = await API.get("/clients");
    return data;
  },

  getById: async (id: string): Promise<Client> => {
    const { data } = await API.get(`/clients/${id}`);
    return data;
  },

  create: async (payload: ClientPayload): Promise<Client> => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (!value) return;

      if (key === "image") {
        const files = Array.isArray(value) ? value : [value];
        files.forEach((file) => formData.append("image", file));
      } else {
        formData.append(key, value as string);
      }
    });

    const { data } = await API.post("/clients", formData);
    return data;
  },

  update: async (
    id: string,
    payload: ClientPayload
  ): Promise<Client> => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (!value) return;

      if (key === "image") {
        const files = Array.isArray(value) ? value : [value];
        files.forEach((file) => formData.append("image", file));
      } else {
        formData.append(key, value as string);
      }
    });

    const { data } = await API.put(`/clients/${id}`, formData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/clients/${id}`);
  },
};

//hooks
export function useClientService() {
  const queryClient = useQueryClient();

  // salvar no cache 5 minutos
  const clients = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  // CREATE
  const createClient = useMutation({
    mutationFn: clientApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // UPDATE
  const updateClient = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ClientPayload;
    }) => clientApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // DELETE
  const deleteClient = useMutation({
    mutationFn: clientApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    // queries
    ...clients,

    // mutations
    createClient,
    updateClient,
    deleteClient,
  };
}
