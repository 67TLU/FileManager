import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  usersApi,
  departmentsApi,
  positionsApi,
  rolesApi,
  type ListUsersParams,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '../api/users.api';

// ============================================================
// USERS
// ============================================================
export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
    keepPreviousData: true,
  });
}

export function useUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId!),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      toast.success('Đã tạo tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể tạo tài khoản';
      toast.error(message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      usersApi.update(userId, data),
    onSuccess: () => {
      toast.success('Đã cập nhật thông tin');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể cập nhật';
      toast.error(message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.delete(userId),
    onSuccess: () => {
      toast.success('Đã xóa tài khoản');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể xóa';
      toast.error(message);
    },
  });
}

// ============================================================
// DEPARTMENTS
// ============================================================
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// POSITIONS
// ============================================================
export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// ROLES
// ============================================================
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}