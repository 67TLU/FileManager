import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { systemSettingsApi } from '../api/system-settings.api';

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => systemSettingsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ['system-settings', 'public'],
    queryFn: () => systemSettingsApi.getPublic(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Record<string, any>) => systemSettingsApi.update(settings),
    onSuccess: (data) => {
      toast.success(`Đã cập nhật ${data.updated} cài đặt`);
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể cập nhật cài đặt';
      toast.error(message);
    },
  });
}