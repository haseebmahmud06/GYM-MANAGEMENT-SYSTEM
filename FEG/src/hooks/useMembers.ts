/**
 * Hook for fetching and managing gym members with TanStack Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import type { User } from '@/types';
import toast from 'react-hot-toast';

export function useMembers(params?: { search?: string; membership_status?: string; page?: number }) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => authApi.getMembers(params),
  });
}

export function useMember(id: number) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => authApi.getMember(id),
    enabled: !!id,
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      authApi.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member updated successfully');
    },
    onError: () => {
      toast.error('Failed to update member');
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => authApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete member');
    },
  });
}