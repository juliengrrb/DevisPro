import { useQuery, useMutation } from "@tanstack/react-query";
import { Quote, InsertQuote } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

/**
 * Hook to fetch all quotes
 */
export function useQuotes() {
  return useQuery({
    queryKey: ['/api/quotes'],
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single quote
 */
export function useQuote(id: number | null) {
  return useQuery({
    queryKey: ['/api/quotes', id],
    enabled: id !== null,
  });
}

/**
 * Hook to fetch quotes for a specific client
 */
export function useClientQuotes(clientId: number | null) {
  return useQuery({
    queryKey: ['/api/clients', clientId, 'quotes'],
    enabled: clientId !== null,
  });
}

/**
 * Hook to create a new quote
 */
export function useCreateQuote() {
  return useMutation({
    mutationFn: async (quote: InsertQuote) => {
      const response = await apiRequest('POST', '/api/quotes', quote);
      const data = await response.json();
      return data as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    }
  });
}

/**
 * Hook to update a quote
 */
export function useUpdateQuote() {
  return useMutation({
    mutationFn: async ({ id, quote }: { id: number, quote: Partial<InsertQuote> }) => {
      const response = await apiRequest('PUT', `/api/quotes/${id}`, quote);
      const data = await response.json();
      return data as Quote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', variables.id] });
    }
  });
}

/**
 * Hook to delete a quote
 */
export function useDeleteQuote() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/quotes/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    }
  });
}

/**
 * Hook to get a new quote number
 */
export function useGenerateQuoteNumber() {
  return useQuery({
    queryKey: ['/api/generate-quote-number'],
  });
}
