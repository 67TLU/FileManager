import { apiClient } from '@/lib/api-client';

export interface SettingValue {
  value: any;
  description: string | null;
  updatedAt: string;
}

export type SystemSettings = Record<string, SettingValue>;

export const systemSettingsApi = {
  getAll: async (): Promise<SystemSettings> => {
    const { data } = await apiClient.get('/settings');
    return data.data;
  },

  getPublic: async (): Promise<Record<string, any>> => {
    const { data } = await apiClient.get('/settings/public');
    return data.data;
  },

  update: async (settings: Record<string, any>): Promise<{ updated: number; keys: string[] }> => {
    const { data } = await apiClient.put('/settings', { settings });
    return data.data;
  },

  getByKey: async (key: string): Promise<SettingValue> => {
    const { data } = await apiClient.get(`/settings/${key}`);
    return data.data;
  },
};