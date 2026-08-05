/**
 * Hook for fetching and managing trainers with TanStack Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainersApi } from '@/lib/api';
import type { Trainer } from '@/types';
import toast from 'react-hot-toast';

export function useTrainers(params?: { search?: string }) {
  return useQuery({
    queryKey: ['trainers', params],
    queryFn: () => trainersApi.getAll(params),
  });
}

export function useCreateTrainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Trainer>) => trainersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer added successfully');
    },
    onError: () => {
      toast.error('Failed to add trainer');
    },
  });
}

export function useUpdateTrainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Trainer> }) =>
      trainersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer updated successfully');
    },
    onError: () => {
      toast.error('Failed to update trainer');
    },
  });
}

export function useDeleteTrainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => trainersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete trainer');
    },
  });
}