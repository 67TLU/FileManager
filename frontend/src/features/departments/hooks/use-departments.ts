import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  departmentsApi,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
  type AddMemberRequest,
} from '../api/departments.api';

// ============================================================
// QUERIES
// ============================================================
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.list(),
    staleTime: 60 * 1000, // 1 phút
  });
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: () => departmentsApi.tree(),
    staleTime: 60 * 1000,
  });
}

export function useDepartmentDetail(departmentId: string | null) {
  return useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => departmentsApi.getById(departmentId!),
    enabled: !!departmentId,
  });
}

// ============================================================
// MUTATIONS
// ============================================================
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => departmentsApi.create(data),
    onSuccess: () => {
      toast.success('Đã tạo phòng ban');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể tạo phòng ban';
      toast.error(message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      data,
    }: {
      departmentId: string;
      data: UpdateDepartmentRequest;
    }) => departmentsApi.update(departmentId, data),
    onSuccess: () => {
      toast.success('Đã cập nhật phòng ban');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể cập nhật';
      toast.error(message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string) => departmentsApi.delete(departmentId),
    onSuccess: () => {
      toast.success('Đã xóa phòng ban');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể xóa phòng ban';
      toast.error(message);
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      data,
    }: {
      departmentId: string;
      data: AddMemberRequest;
    }) => departmentsApi.addMember(departmentId, data),
    onSuccess: () => {
      toast.success('Đã thêm thành viên');
      queryClient.invalidateQueries({ queryKey: ['department'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể thêm thành viên';
      toast.error(message);
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      userId,
      isManager,
    }: {
      departmentId: string;
      userId: string;
      isManager: boolean;
    }) => departmentsApi.updateMemberRole(departmentId, userId, isManager),
    onSuccess: () => {
      toast.success('Đã cập nhật vai trò');
      queryClient.invalidateQueries({ queryKey: ['department'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể cập nhật vai trò';
      toast.error(message);
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      userId,
    }: {
      departmentId: string;
      userId: string;
    }) => departmentsApi.removeMember(departmentId, userId),
    onSuccess: () => {
      toast.success('Đã xóa thành viên');
      queryClient.invalidateQueries({ queryKey: ['department'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể xóa thành viên';
      toast.error(message);
    },
  });
}