import {
  Building2,
  Calendar,
  User,
  Users,
  Crown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { useDepartmentDetail } from '../hooks/use-departments';
import type { Department } from '../api/departments.api';

interface DepartmentDetailDialogProps {
  department: Department | null;
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

export function DepartmentDetailDialog({
  department,
  open,
  onOpenChange,
}: DepartmentDetailDialogProps) {
  const { data: detail, isLoading } = useDepartmentDetail(department?.id || null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Chi tiết phòng ban
          </DialogTitle>
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
              <div>
                <h3 className="text-xl font-bold">{detail.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{detail.code}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {detail.members.length} thành viên
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ngày tạo
                  </div>
                  <div className="text-sm font-medium">
                    {formatDate(detail.created_at)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    Quản lý
                  </div>
                  <div className="text-sm font-medium">
                    {detail.manager_name || 'Chưa có'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danh sách thành viên */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Thành viên ({detail.members.length})
                </h4>
                {detail.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có thành viên nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {detail.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">
                              {member.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.email}
                            </div>
                            {member.position_name && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {member.position_name}
                              </div>
                            )}
                          </div>
                        </div>
                        {member.is_manager && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Quản lý
                          </Badge>
                        )}
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