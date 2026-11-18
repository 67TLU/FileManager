import { apiClient } from '@/lib/api-client';

// ============================================================
// TYPES
// ============================================================
export interface Department {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  manager_user_id: string | null;
  manager_name: string | null;
  member_count: number;
  created_at: string;
}

export interface DepartmentDetail extends Department {
  members: DepartmentMember[];
}

export interface DepartmentMember {
  id: string;
  email: string;
  full_name: string;
  position_name: string | null;
  is_manager: boolean;
  joined_at: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  parentId?: string | null;
  managerUserId?: string | null;
}

export interface UpdateDepartmentRequest {
  name?: string;
  managerUserId?: string | null;
}

export interface AddMemberRequest {
  userId: string;
  isManager?: boolean;
}

// ============================================================
// API FUNCTIONS
// ============================================================
export const departmentsApi = {
  /**
   * Lấy danh sách phòng ban (flat list)
   */
  list: async (): Promise<Department[]> => {
    const { data } = await apiClient.get('/departments');
    return data.data;
  },

  /**
   * Lấy cây phòng ban (hierarchy)
   */
  tree: async (): Promise<DepartmentTreeNode[]> => {
    const { data } = await apiClient.get('/departments/tree');
    return data.data;
  },

  /**
   * Lấy chi tiết phòng ban + danh sách thành viên
   */
  getById: async (departmentId: string): Promise<DepartmentDetail> => {
    const { data } = await apiClient.get(`/departments/${departmentId}`);
    return data.data;
  },

  /**
   * Tạo phòng ban mới
   */
  create: async (payload: CreateDepartmentRequest): Promise<DepartmentDetail> => {
    const { data } = await apiClient.post('/departments', payload);
    return data.data;
  },

  /**
   * Cập nhật thông tin phòng ban
   */
  update: async (
    departmentId: string,
    payload: UpdateDepartmentRequest
  ): Promise<DepartmentDetail> => {
    const { data } = await apiClient.put(`/departments/${departmentId}`, payload);
    return data.data;
  },

  /**
   * Xóa phòng ban
   */
  delete: async (departmentId: string): Promise<void> => {
    await apiClient.delete(`/departments/${departmentId}`);
  },

  /**
   * Thêm thành viên vào phòng ban
   */
  addMember: async (
    departmentId: string,
    payload: AddMemberRequest
  ): Promise<void> => {
    await apiClient.post(`/departments/${departmentId}/members`, payload);
  },

  /**
   * Cập nhật vai trò thành viên (is_manager)
   */
  updateMemberRole: async (
    departmentId: string,
    userId: string,
    isManager: boolean
  ): Promise<void> => {
    await apiClient.put(`/departments/${departmentId}/members/${userId}`, {
      isManager,
    });
  },

  /**
   * Xóa thành viên khỏi phòng ban
   */
  removeMember: async (departmentId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/departments/${departmentId}/members/${userId}`);
  },
};