import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/axios";

//type que vem do backend
export interface Product {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  image?: string[];

  createdAt?: string;
  updatedAt?: string;
}

//type que enviamos para o backend
export interface ProductPayload {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: File | File[];
}

//API METHODS
 export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await API.get("/products");
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await API.get(`/products/${id}`);
    return data;
  },

  create: async (payload: ProductPayload): Promise<Product> => {
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

    const { data } = await API.post("/products", formData);
    return data;
  },

  update: async (
    id: string,
    payload: ProductPayload
  ): Promise<Product> => {
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

    const { data } = await API.put(`/products/${id}`, formData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/products/${id}`);
  },
};

//hooks
export function useProductService() {
  const queryClient = useQueryClient();

  // salvar no cache 5 minutos
  const products = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  // CREATE
  const createProduct = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // UPDATE
  const updateProduct = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ProductPayload;
    }) => productApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // DELETE
  const deleteProduct = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    // queries
    ...products,

    // mutations
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
