import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '../api/profile.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Logout sau 2 giây để user đọc thông báo
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Không thể đổi mật khẩu';
      toast.error(message);
    },
  });
}

export function useLogoutAllDevices() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => profileApi.logoutAllDevices(),
    onSuccess: () => {
      toast.success('Đã đăng xuất khỏi tất cả thiết bị');
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể thực hiện');
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => profileApi.revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Đã đăng xuất thiết bị');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể thực hiện');
    },
  });
}