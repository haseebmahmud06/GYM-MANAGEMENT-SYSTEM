/**
 * Hook for fetching and managing gym equipment with TanStack Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '@/lib/api';
import type { Equipment } from '@/types';
import toast from 'react-hot-toast';

export function useEquipment(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: () => equipmentApi.getAll(params),
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Equipment>) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment added successfully');
    },
    onError: () => {
      toast.error('Failed to add equipment');
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Equipment> }) =>
      equipmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment updated successfully');
    },
    onError: () => {
      toast.error('Failed to update equipment');
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete equipment');
    },
  });
}