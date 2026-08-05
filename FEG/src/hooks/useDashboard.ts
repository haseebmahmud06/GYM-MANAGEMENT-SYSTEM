/**
 * Hook for fetching dashboard and analytics data with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });
}

export function useRevenueData(period?: string) {
  return useQuery({
    queryKey: ['revenue-data', period],
    queryFn: () => dashboardApi.getRevenueData(period),
  });
}

export function useAttendanceData(period?: string) {
  return useQuery({
    queryKey: ['attendance-data', period],
    queryFn: () => dashboardApi.getAttendanceData(period),
  });
}

export function useGrowthData(period?: string) {
  return useQuery({
    queryKey: ['growth-data', period],
    queryFn: () => dashboardApi.getGrowthData(period),
  });
}

export function usePopularPackages(period?: string) {
  return useQuery({
    queryKey: ['popular-packages', period],
    queryFn: () => dashboardApi.getPopularPackages(period),
  });
}

export function useRecentRegistrations() {
  return useQuery({
    queryKey: ['recent-registrations'],
    queryFn: () => dashboardApi.getRecentRegistrations(),
  });
}