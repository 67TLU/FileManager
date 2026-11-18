import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  totalFiles: number;
  totalSizeBytes: number;
  trashCount: number;
  downloadCount: number;
  uploadCount: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  occurredAt: string;
  resource: {
    id: string;
    name: string;
    mimeType: string | null;
    folderName: string | null;
  } | null;
  metadata: any;
}

export interface StorageTrend {
  month: string;
  totalBytes: number;
  uploadCount: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/dashboard/stats');
    return data.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const { data } = await apiClient.get('/dashboard/activity', { params: { limit } });
    return data.data;
  },

  getStorageTrend: async (months: number = 6): Promise<StorageTrend[]> => {
    const { data } = await apiClient.get('/dashboard/storage-trend', { params: { months } });
    return data.data;
  },
};