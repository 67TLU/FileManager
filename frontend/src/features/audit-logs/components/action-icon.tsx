import {
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Upload,
  Download,
  Eye,
  Trash2,
  RotateCcw,
  Share2,
  FolderPlus,
  Settings,
  Mail,
  KeyRound,
  Shield,
  Building2,
} from 'lucide-react';

interface ActionIconProps {
  action: string;
  className?: string;
}

const ACTION_ICON_MAP: Record<string, { icon: any; color: string }> = {
  // Auth
  'auth.login': { icon: LogIn, color: 'text-green-500' },
  'auth.login_failed': { icon: LogIn, color: 'text-red-500' },
  'auth.logout': { icon: LogOut, color: 'text-gray-500' },
  'auth.forgot_password': { icon: Mail, color: 'text-orange-500' },
  'auth.reset_password': { icon: KeyRound, color: 'text-blue-500' },
  'auth.change_password': { icon: KeyRound, color: 'text-purple-500' },
  'auth.logout_all_devices': { icon: LogOut, color: 'text-red-500' },
  'auth.revoke_session': { icon: Shield, color: 'text-orange-500' },

  // User
  'user.create': { icon: UserPlus, color: 'text-green-500' },
  'user.update': { icon: UserPlus, color: 'text-blue-500' },
  'user.delete': { icon: UserMinus, color: 'text-red-500' },
  'user.assign_role': { icon: Shield, color: 'text-purple-500' },

  // Department
  'department.create': { icon: Building2, color: 'text-green-500' },
  'department.update': { icon: Building2, color: 'text-blue-500' },
  'department.delete': { icon: Building2, color: 'text-red-500' },
  'department.add_member': { icon: UserPlus, color: 'text-green-500' },
  'department.remove_member': { icon: UserMinus, color: 'text-red-500' },
  'department.update_member_role': { icon: Shield, color: 'text-purple-500' },

  // Resource
  'resource.upload': { icon: Upload, color: 'text-green-500' },
  'resource.download': { icon: Download, color: 'text-blue-500' },
  'resource.view': { icon: Eye, color: 'text-gray-500' },
  'resource.trash': { icon: Trash2, color: 'text-orange-500' },
  'resource.restore': { icon: RotateCcw, color: 'text-cyan-500' },
  'resource.permanent_delete': { icon: Trash2, color: 'text-red-500' },
  'resource.share': { icon: Share2, color: 'text-purple-500' },

  // Folder
  'folder.create': { icon: FolderPlus, color: 'text-green-500' },

  // System
  'system.settings.update': { icon: Settings, color: 'text-blue-500' },
};

export function ActionIcon({ action, className }: ActionIconProps) {
  const config = ACTION_ICON_MAP[action] || { icon: Eye, color: 'text-gray-400' };
  const Icon = config.icon;

  return <Icon className={`h-4 w-4 ${config.color} ${className || ''}`} />;
}

export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'auth.login': 'Đăng nhập',
    'auth.login_failed': 'Đăng nhập thất bại',
    'auth.logout': 'Đăng xuất',
    'auth.forgot_password': 'Quên mật khẩu',
    'auth.reset_password': 'Đặt lại mật khẩu',
    'auth.change_password': 'Đổi mật khẩu',
    'auth.logout_all_devices': 'Đăng xuất tất cả thiết bị',
    'auth.revoke_session': 'Thu hồi session',
    'user.create': 'Tạo user',
    'user.update': 'Cập nhật user',
    'user.delete': 'Xóa user',
    'user.assign_role': 'Gán quyền',
    'department.create': 'Tạo phòng ban',
    'department.update': 'Cập nhật phòng ban',
    'department.delete': 'Xóa phòng ban',
    'department.add_member': 'Thêm thành viên',
    'department.remove_member': 'Xóa thành viên',
    'department.update_member_role': 'Cập nhật vai trò thành viên',
    'resource.upload': 'Upload file',
    'resource.download': 'Download file',
    'resource.view': 'Xem file',
    'resource.trash': 'Xóa vào thùng rác',
    'resource.restore': 'Khôi phục',
    'resource.permanent_delete': 'Xóa vĩnh viễn',
    'resource.share': 'Chia sẻ',
    'folder.create': 'Tạo thư mục',
    'system.settings.update': 'Cập nhật cấu hình',
  };

  return labels[action] || action;
}