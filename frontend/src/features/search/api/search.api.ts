import { apiClient } from '@/lib/api-client';
import type { Resource } from '@/features/resources/api/resources.api';

// ============================================================
// TYPES
// ============================================================
export interface SearchParams {
  q?: string;
  type?: 'file' | 'link' | 'note';
  mimeType?: string;
  folderId?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'size_bytes' | 'updated_at';
  order?: 'asc' | 'desc';
}

export interface AdvancedSearchParams {
  query?: string;
  filters?: {
    types?: Array<'file' | 'link' | 'note'>;
    mimeTypes?: string[];
    folderIds?: string[];
    createdBy?: string[];
    dateRange?: {
      from?: string;
      to?: string;
    };
    sizeRange?: {
      min?: number;
      max?: number;
    };
  };
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  data: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchSuggestion {
  id: string;
  name: string;
  type: string;
  mime_type: string | null;
  folder_name: string | null;
}

// ============================================================
// API FUNCTIONS
// ============================================================
export const searchApi = {
  /**
   * Tìm kiếm cơ bản (query string)
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await apiClient.get('/search', { params });
    return data;
  },

  /**
   * Tìm kiếm nâng cao (nhiều filters)
   */
  advancedSearch: async (params: AdvancedSearchParams): Promise<SearchResponse> => {
    const { data } = await apiClient.post('/search/advanced', params);
    return data;
  },

  /**
   * Gợi ý từ khóa (autocomplete)
   */
  getSuggestions: async (q: string): Promise<string[]> => {
    const { data } = await apiClient.get('/search/suggestions', { params: { q } });
    return data.data;
  },

  /**
   * Tài nguyên truy cập gần đây
   */
  getRecent: async (limit: number = 10): Promise<SearchSuggestion[]> => {
    const { data } = await apiClient.get('/search/recent', { params: { limit } });
    return data.data;
  },
};