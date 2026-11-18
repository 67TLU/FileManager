import { apiClient } from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },
};