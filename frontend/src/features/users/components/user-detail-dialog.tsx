import {
  Mail,
  Calendar,
  Building2,
  Briefcase,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useUserDetail } from '../hooks/use-users';
import { UserStatusBadge } from './user-status-badge';
import type { User } from '../api/users.api';

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserDetailDialog({ user, open, onOpenChange }: UserDetailDialogProps) {
  const { data: detail, isLoading } = useUserDetail(user?.id || null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết tài khoản</DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-2">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(detail.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{detail.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{detail.email}</p>
                  <div className="mt-2">
                    <UserStatusBadge status={detail.status} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>
                  <div className="text-sm font-medium">{detail.email}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ngày tạo
                  </div>
                  <div className="text-sm font-medium">{formatDate(detail.created_at)}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Đăng nhập gần nhất
                  </div>
                  <div className="text-sm font-medium">
                    {detail.last_login_at ? formatDate(detail.last_login_at) : 'Chưa đăng nhập'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    {detail.email_verified_at ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    Xác thực email
                  </div>
                  <div className="text-sm font-medium">
                    {detail.email_verified_at ? 'Đã xác thực' : 'Chưa xác thực'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tổ chức */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Thông tin tổ chức</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      Chức vụ
                    </div>
                    <div className="text-sm font-medium">
                      {detail.position_name || '—'}
                      {detail.position_level && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {detail.position_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Phòng ban */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  Phòng ban ({detail.departments.length})
                </h4>
                {detail.departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa thuộc phòng ban nào</p>
                ) : (
                  <div className="space-y-2">
                    {detail.departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <div className="text-sm font-medium">{dept.name}</div>
                          <div className="text-xs text-muted-foreground">{dept.code}</div>
                        </div>
                        {dept.is_manager && (
                          <Badge variant="secondary">Quản lý</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Roles */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  Vai trò ({detail.roles.length})
                </h4>
                {detail.roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa được gán vai trò</p>
                ) : (
                  <div className="space-y-2">
                    {detail.roles.map((role, idx) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <div className="text-sm font-medium">{role.name}</div>
                          <div className="text-xs text-muted-foreground">{role.key}</div>
                        </div>
                        <Badge variant="outline">
                          {role.scope_type === 'global' ? 'Toàn cục' : role.scope_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}