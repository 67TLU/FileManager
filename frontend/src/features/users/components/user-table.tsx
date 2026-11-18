import {
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Eye,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { UserStatusBadge } from './user-status-badge';
import type { User } from '../api/users.api';

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onAssignRoles: (user: User) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserTable({
  users,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssignRoles,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[280px]">Người dùng</TableHead>
          <TableHead>Phòng ban</TableHead>
          <TableHead>Chức vụ</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Đăng nhập gần nhất</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.department_name || '—'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.position_name || '—'}
            </TableCell>
            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {user.last_login_at ? formatDate(user.last_login_at) : 'Chưa đăng nhập'}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(user.created_at).split(',')[0]}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onView(user)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAssignRoles(user)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Phân quyền
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.status === 'active' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                      <UserX className="mr-2 h-4 w-4" />
                      Tạm khóa
                    </DropdownMenuItem>
                  ) : user.status === 'suspended' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Kích hoạt lại
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa tài khoản
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}