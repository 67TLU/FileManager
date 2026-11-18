import { apiClient } from '@/lib/api-client';

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  status: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  position_id: string | null;
  position_name: string | null;
  position_level: string | null;
  departments: Array<{
    id: string;
    name: string;
    code: string;
    is_manager: boolean;
  }>;
  roles: Array<{
    id: string;
    key: string;
    name: string;
    scope_type: string;
  }>;
  activeSessions: Array<{
    id: string;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
  }>;
}

export const profileApi = {
  getProfile: async (): Promise<ProfileData> => {
    const { data } = await apiClient.get('/me');
    return data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data.data;
  },

  logoutAllDevices: async () => {
    const { data } = await apiClient.post('/auth/logout-all-devices');
    return data.data;
  },

  revokeSession: async (sessionId: string) => {
    await apiClient.delete(`/me/sessions/${sessionId}`);
  },
};