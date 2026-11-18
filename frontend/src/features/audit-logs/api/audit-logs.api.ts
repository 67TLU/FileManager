import { apiClient } from '@/lib/api-client';

// ============================================================
// TYPES
// ============================================================
export interface AuditLog {
  id: number;
  action: string;
  occurred_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  ip: string | null;
  metadata: Record<string, any>;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// ACTION CATEGORIES (để group trong filter)
// ============================================================
export const ACTION_CATEGORIES = {
  auth: {
    label: 'Xác thực',
    actions: [
      { value: 'auth.login', label: 'Đăng nhập' },
      { value: 'auth.login_failed', label: 'Đăng nhập thất bại' },
      { value: 'auth.logout', label: 'Đăng xuất' },
      { value: 'auth.forgot_password', label: 'Quên mật khẩu' },
      { value: 'auth.reset_password', label: 'Đặt lại mật khẩu' },
      { value: 'auth.change_password', label: 'Đổi mật khẩu' },
      { value: 'auth.logout_all_devices', label: 'Đăng xuất tất cả' },
      { value: 'auth.revoke_session', label: 'Thu hồi session' },
    ],
  },
  user: {
    label: 'Người dùng',
    actions: [
      { value: 'user.create', label: 'Tạo user' },
      { value: 'user.update', label: 'Cập nhật user' },
      { value: 'user.delete', label: 'Xóa user' },
      { value: 'user.assign_role', label: 'Gán quyền' },
    ],
  },
  department: {
    label: 'Phòng ban',
    actions: [
      { value: 'department.create', label: 'Tạo phòng ban' },
      { value: 'department.update', label: 'Cập nhật phòng ban' },
      { value: 'department.delete', label: 'Xóa phòng ban' },
      { value: 'department.add_member', label: 'Thêm thành viên' },
      { value: 'department.remove_member', label: 'Xóa thành viên' },
      { value: 'department.update_member_role', label: 'Cập nhật vai trò' },
    ],
  },
  resource: {
    label: 'Tài nguyên',
    actions: [
      { value: 'resource.upload', label: 'Upload file' },
      { value: 'resource.download', label: 'Download file' },
      { value: 'resource.view', label: 'Xem file' },
      { value: 'resource.trash', label: 'Xóa vào thùng rác' },
      { value: 'resource.restore', label: 'Khôi phục' },
      { value: 'resource.permanent_delete', label: 'Xóa vĩnh viễn' },
      { value: 'resource.share', label: 'Chia sẻ' },
    ],
  },
  folder: {
    label: 'Thư mục',
    actions: [
      { value: 'folder.create', label: 'Tạo thư mục' },
    ],
  },
  invitation: {
    label: 'Lời mời',
    actions: [
      { value: 'invitation.create', label: 'Tạo lời mời' },
      { value: 'invitation.accept', label: 'Chấp nhận lời mời' },
      { value: 'invitation.revoke', label: 'Thu hồi lời mời' },
    ],
  },
  system: {
    label: 'Hệ thống',
    actions: [
      { value: 'system.settings.update', label: 'Cập nhật cấu hình' },
    ],
  },
};

// ============================================================
// API FUNCTIONS
// ============================================================
export const auditLogsApi = {
  list: async (params: AuditLogsParams = {}): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get('/audit-logs', { params });
    return data;
  },

  export: async (params: AuditLogsParams = {}): Promise<Blob> => {
    const { data } = await apiClient.get('/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};