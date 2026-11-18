import { apiClient } from '@/lib/api-client';

// ============================================================
// TYPES
// ============================================================
export interface User {
  id: string;
  email: string;
  full_name: string;
  status: 'invited' | 'active' | 'suspended' | 'disabled';
  last_login_at: string | null;
  created_at: string;
  position_name: string | null;
  department_name: string | null;
}

export interface UserDetail extends User {
  email_verified_at: string | null;
  position_id: string | null;
  position_level: string | null;
  departments: UserDepartment[];
  roles: UserRole[];
}

export interface UserDepartment {
  id: string;
  name: string;
  code: string;
  is_manager: boolean;
}

export interface UserRole {
  id: string;
  key: string;
  name: string;
  scope_type: 'global' | 'department' | 'workspace' | 'project';
  scope_id: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  positionId?: string;
  departmentIds?: string[];
  roleIds?: string[];
}

export interface UpdateUserRequest {
  fullName?: string;
  positionId?: string | null;
  status?: 'active' | 'suspended' | 'disabled';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  manager_user_id: string | null;
  manager_name: string | null;
  member_count: number;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  level: string;
  description: string | null;
  is_system: boolean;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  is_system: boolean;
}

// ============================================================
// API FUNCTIONS
// ============================================================
export const usersApi = {
  list: async (params: ListUsersParams = {}): Promise<ListUsersResponse> => {
    const { data } = await apiClient.get('/users', { params });
    return data;
  },

  getById: async (userId: string): Promise<UserDetail> => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data.data;
  },

  create: async (payload: CreateUserRequest): Promise<UserDetail> => {
    const { data } = await apiClient.post('/users', payload);
    return data.data;
  },

  update: async (userId: string, payload: UpdateUserRequest): Promise<UserDetail> => {
    const { data } = await apiClient.put(`/users/${userId}`, payload);
    return data.data;
  },

  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
};

export const departmentsApi = {
  list: async (): Promise<Department[]> => {
    const { data } = await apiClient.get('/departments');
    return data.data;
  },

  tree: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/departments/tree');
    return data.data;
  },
};

export const positionsApi = {
  list: async (): Promise<Position[]> => {
    const { data } = await apiClient.get('/positions');
    return data.data;
  },
};

export const rolesApi = {
  list: async (): Promise<Role[]> => {
    // Backend chưa có endpoint riêng, dùng tạm từ system_settings hoặc thêm sau
    // Tạm thời dùng hardcode cho Phase 1
    return [
      { id: 'a0000000-0000-4000-8000-000000000001', key: 'system_admin', name: 'Quản trị hệ thống', is_system: true },
      { id: 'a0000000-0000-4000-8000-000000000002', key: 'company_manager', name: 'Quản lý công ty', is_system: true },
      { id: 'a0000000-0000-4000-8000-000000000003', key: 'department_manager', name: 'Quản lý phòng ban', is_system: true },
      { id: 'a0000000-0000-4000-8000-000000000004', key: 'employee', name: 'Nhân viên', is_system: true },
    ];
  },
};