import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 60 * 1000, // 1 phút
  });
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 30 * 1000, // 30 giây
  });
}

export function useStorageTrend(months: number = 6) {
  return useQuery({
    queryKey: ['dashboard', 'storage-trend', months],
    queryFn: () => dashboardApi.getStorageTrend(months),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}