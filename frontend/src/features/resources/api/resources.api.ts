import { apiClient } from '@/lib/api-client';

export interface Resource {
  id: string;
  name: string;
  type: 'file' | 'link' | 'note';
  mime_type: string | null;
  size_bytes: number;
  status: 'active' | 'trashed' | 'deleted';
  created_at: string;
  updated_at?: string;
  trashed_at: string | null;      // ← thiếu trước đây
  folder_id?: string;
  folder_name?: string;
  created_by_name: string | null;
  last_accessed?: string;
}

export interface ResourceVersion {
  id: string; version_number: number; original_name: string;
  size_bytes: number; mime_type: string; created_at: string;
  created_by_name: string | null;
}

export interface ResourceDetail extends Resource {
  folder_name: string; workspace_id: string; versions: ResourceVersion[];
}

export interface FolderNode {
  id: string; name: string; parent_id: string | null;
  path: string; depth: number; children: FolderNode[];
}

export interface FolderTreeResponse {
  workspace: { id: string; name: string; type: string };
  tree: FolderNode[]; total: number;
}

export interface ListResourcesResponse {
  success: boolean;
  data: Resource[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const resourcesApi = {
  list: async (params: {
    folderId: string; page?: number; limit?: number;
    sortBy?: 'name' | 'created_at' | 'size_bytes'; order?: 'asc' | 'desc';
  }): Promise<ListResourcesResponse> => {
    const { data } = await apiClient.get('/resources', { params });
    return data;
  },

  getDetail: async (id: string): Promise<ResourceDetail> => {
    const { data } = await apiClient.get(`/resources/${id}`);
    return data.data;
  },

  upload: async (file: File, folderId: string, onProgress?: (p: number) => void) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folderId', folderId);
    const { data } = await apiClient.post('/resources/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data;
  },

  download: async (id: string, fileName: string) => {
    const res = await apiClient.get(`/resources/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove();
    window.URL.revokeObjectURL(url);
  },

  moveToTrash: async (id: string) => { await apiClient.post(`/resources/${id}/trash`); },
  restore: async (id: string) => { await apiClient.post(`/resources/${id}/restore`); },
  permanentDelete: async (id: string) => { await apiClient.delete(`/resources/${id}/permanent`); },
  permanentDeleteMany: async (ids: string[]) => {
    for (const id of ids) await apiClient.delete(`/resources/${id}/permanent`);
  },
  listTrash: async (): Promise<Resource[]> => {
    const { data } = await apiClient.get('/resources/trash');
    return data.data;
  },
};

export const foldersApi = {
  getTree: async (workspaceId: string): Promise<FolderTreeResponse> => {
    const { data } = await apiClient.get(`/workspaces/${workspaceId}/folders`);
    return data.data;
  },
  create: async (p: { workspaceId: string; parentId: string | null; name: string }): Promise<FolderNode> => {
    const { data } = await apiClient.post('/folders', p);
    return data.data;
  },
};