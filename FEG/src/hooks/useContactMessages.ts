/**
 * Hook for fetching and managing contact messages with TanStack Query (admin).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/lib/api';
import toast from 'react-hot-toast';

export function useContactMessages(params?: { search?: string; is_read?: boolean; page?: number }) {
  return useQuery({
    queryKey: ['contact-messages', params],
    queryFn: () => contactApi.getMessages(params),
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
    onError: () => {
      toast.error('Failed to update message');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast.success('Message deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete message');
    },
  });
}