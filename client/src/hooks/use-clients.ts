import { useQuery, useMutation } from "@tanstack/react-query";
import { Client, InsertClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

/**
 * Hook to fetch all clients
 */
export function useClients() {
  return useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single client
 */
export function useClient(id: number | null) {
  return useQuery({
    queryKey: ['/api/clients', id],
    enabled: id !== null,
  });
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  return useMutation({
    mutationFn: async (client: InsertClient) => {
      const response = await apiRequest('POST', '/api/clients', client);
      const data = await response.json();
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    }
  });
}

/**
 * Hook to update a client
 */
export function useUpdateClient() {
  return useMutation({
    mutationFn: async ({ id, client }: { id: number, client: InsertClient }) => {
      const response = await apiRequest('PUT', `/api/clients/${id}`, client);
      const data = await response.json();
      return data as Client;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', variables.id] });
    }
  });
}

/**
 * Hook to delete a client
 */
export function useDeleteClient() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/clients/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    }
  });
}
