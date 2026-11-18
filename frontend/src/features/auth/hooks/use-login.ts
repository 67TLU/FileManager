import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi, type LoginRequest } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Đăng nhập thành công');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Đăng nhập thất bại';
      toast.error(message);
    },
  });
}