import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resourcesApi } from '../api/resources.api';

/**
 * Query danh sách file trong thùng rác
 */
export function useTrashList() {
  return useQuery({
    queryKey: ['resources', 'trash'],
    queryFn: () => resourcesApi.listTrash(),
    staleTime: 30 * 1000, // 30 giây
  });
}

/**
 * Mutation khôi phục file từ thùng rác
 */
export function useRestoreResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) => resourcesApi.restore(resourceId),
    onSuccess: () => {
      toast.success('Đã khôi phục tài nguyên');
      queryClient.invalidateQueries({ queryKey: ['resources', 'trash'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể khôi phục');
    },
  });
}

/**
 * Mutation xóa vĩnh viễn 1 file
 */
export function usePermanentDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) => resourcesApi.permanentDelete(resourceId),
    onSuccess: () => {
      toast.success('Đã xóa vĩnh viễn');
      queryClient.invalidateQueries({ queryKey: ['resources', 'trash'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể xóa');
    },
  });
}

/**
 * Mutation xóa vĩnh viễn nhiều file
 */
export function usePermanentDeleteMany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceIds: string[]) => resourcesApi.permanentDeleteMany(resourceIds),
    onSuccess: (_, resourceIds) => {
      toast.success(`Đã xóa vĩnh viễn ${resourceIds.length} tài nguyên`);
      queryClient.invalidateQueries({ queryKey: ['resources', 'trash'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể xóa');
    },
  });
}

/**
 * Mutation khôi phục nhiều file
 */
export function useRestoreMany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceIds: string[]) => {
      await Promise.all(resourceIds.map((id) => resourcesApi.restore(id)));
    },
    onSuccess: (_, resourceIds) => {
      toast.success(`Đã khôi phục ${resourceIds.length} tài nguyên`);
      queryClient.invalidateQueries({ queryKey: ['resources', 'trash'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể khôi phục');
    },
  });
}