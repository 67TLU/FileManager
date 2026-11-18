import { Badge } from '@/components/ui/badge';

interface UserStatusBadgeProps {
  status: 'invited' | 'active' | 'suspended' | 'disabled';
}

const statusConfig = {
  invited: {
    label: 'Đã mời',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  active: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  suspended: {
    label: 'Tạm khóa',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  disabled: {
    label: 'Vô hiệu hóa',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}