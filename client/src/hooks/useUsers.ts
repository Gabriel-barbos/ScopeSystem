import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, User, CreateUserDTO } from "@/services/UserService";

const USERS_KEY = ["users"];

export function useUsers(options?: { staleTime?: number }) {
  return useQuery<User[]>({
    queryKey: USERS_KEY,
    queryFn: userService.getAll,
    staleTime: options?.staleTime ?? 1000 * 60 * 10, // default 10min
  });
}

export function useUser(id?: string) {
  return useQuery<User | undefined>({
    queryKey: [...USERS_KEY, id],
    queryFn: async () => {
      if (!id) return undefined;
      return userService.getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserDTO) => userService.create(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries(USERS_KEY);
 
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateUserDTO> }) =>
      userService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries(USERS_KEY);
      queryClient.invalidateQueries([...USERS_KEY, updated.id]);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(USERS_KEY);

    },
  });
}
