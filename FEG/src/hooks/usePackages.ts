/**
 * Hook for fetching and managing membership packages with TanStack Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi } from '@/lib/api';
import type { Package } from '@/types';
import toast from 'react-hot-toast';

export function usePackages(params?: { search?: string; page?: number }) {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => packagesApi.getAll(params),
  });
}

export function usePackage(id: number) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Package>) => packagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package created successfully');
    },
    onError: () => {
      toast.error('Failed to create package');
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Package> }) =>
      packagesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package updated successfully');
    },
    onError: () => {
      toast.error('Failed to update package');
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => packagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete package');
    },
  });
}