import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { ApiResponse, PaginationMeta } from '@/types';
import { toast } from 'sonner';

export function useFetch<T>(
  key: string[],
  url: string,
  options?: { enabled?: boolean; params?: Record<string, string> }
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get<ApiResponse<T>>(url, { params: options?.params });
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useFetchList<T>(
  key: string[],
  url: string,
  params?: Record<string, string>
) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<T[]>>(url, { params });
      return {
        data: response.data.data || [],
        meta: response.data.meta as PaginationMeta,
      };
    },
  });
}

export function useMutationAction<TData, TResponse>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: {
    onSuccess?: (data: TResponse) => void;
    onError?: (error: unknown) => void;
    invalidateKeys?: string[][];
    successMessage?: string;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: TData) => {
      const response = await api[method]<ApiResponse<TResponse>>(url, data as any);
      return response.data.data as TResponse;
    },
    onSuccess: (data) => {
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(message);
      options?.onError?.(error);
    },
  });
}
