import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resourcesApi, foldersApi } from '../api/resources.api';
export function useResources(params: {
  folderId: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'size_bytes';
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => resourcesApi.list(params),
    enabled: !!params.folderId,
  });
}

export function useResourceDetail(resourceId: string | null) {
  return useQuery({
    queryKey: ['resource', resourceId],
    queryFn: () => resourcesApi.getDetail(resourceId!),
    enabled: !!resourceId,
  });
}

export function useDownloadResource() {
  return useMutation({
    mutationFn: ({ resourceId, fileName }: { resourceId: string; fileName: string }) =>
      resourcesApi.download(resourceId, fileName),
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể tải file');
    },
  });
}

export function useMoveToTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) => resourcesApi.moveToTrash(resourceId),
    onSuccess: () => {
      toast.success('Đã chuyển vào thùng rác');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể xóa');
    },
  });
}

export function useRestoreResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) => resourcesApi.restore(resourceId),
    onSuccess: () => {
      toast.success('Đã khôi phục tài nguyên');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể khôi phục');
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { workspaceId: string; parentId: string | null; name: string }) =>
      foldersApi.create(params),
    onSuccess: () => {
      toast.success('Đã tạo thư mục');
      queryClient.invalidateQueries({ queryKey: ['folder-tree'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể tạo thư mục');
    },
  });
}