import { useState } from 'react';
import {
  UserPlus,
  UserMinus,
  Crown,
  Search,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDepartmentDetail,
  useAddMember,
  useRemoveMember,
  useUpdateMemberRole,
} from '../hooks/use-departments';
import { useUsers } from '@/features/users/hooks/use-users';
import type { Department, DepartmentMember } from '../api/departments.api';

interface DepartmentMembersDialogProps {
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

export function DepartmentMembersDialog({
  department,
  open,
  onOpenChange,
}: DepartmentMembersDialogProps) {
  const { data: detail } = useDepartmentDetail(department?.id || null);
  const { data: usersData } = useUsers({ limit: 100 });

  const addMemberMutation = useAddMember();
  const removeMemberMutation = useRemoveMember();
  const updateRoleMutation = useUpdateMemberRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<DepartmentMember | null>(null);

  // Filter users chưa là thành viên
  const availableUsers = (usersData?.data || []).filter(
    (user) => !detail?.members.some((m) => m.id === user.id)
  );

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async (userId: string) => {
    if (!department) return;
    await addMemberMutation.mutateAsync({
      departmentId: department.id,
      data: { userId, isManager: false },
    });
  };

  const handleRemoveMember = async () => {
    if (!department || !memberToRemove) return;
    await removeMemberMutation.mutateAsync({
      departmentId: department.id,
      userId: memberToRemove.id,
    });
    setMemberToRemove(null);
  };

  const handleToggleManager = async (member: DepartmentMember) => {
    if (!department) return;
    await updateRoleMutation.mutateAsync({
      departmentId: department.id,
      userId: member.id,
      isManager: !member.is_manager,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Quản lý thành viên</DialogTitle>
            <DialogDescription>
              Thêm, xóa hoặc thay đổi vai trò thành viên trong {department?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
            {/* Left: Current members */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold mb-2">
                Thành viên hiện tại ({detail?.members.length || 0})
              </h3>
              <ScrollArea className="flex-1 border rounded-md p-3">
                {!detail ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </div>
                ) : detail.members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có thành viên
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {member.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleToggleManager(member)}
                            disabled={updateRoleMutation.isPending}
                          >
                            {member.is_manager ? (
                              <Crown className="h-3.5 w-3.5 text-yellow-500" />
                            ) : (
                              <Crown className="h-3.5 w-3.5 text-muted-foreground/30" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Right: Available users */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold mb-2">Thêm thành viên</h3>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhân viên..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="flex-1 border rounded-md p-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? 'Không tìm thấy nhân viên'
                      : 'Tất cả nhân viên đã là thành viên'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {user.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 shrink-0"
                          onClick={() => handleAddMember(user.id)}
                          disabled={addMemberMutation.isPending}
                        >
                          {addMemberMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Thêm
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm remove member */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa <strong>{memberToRemove?.full_name}</strong> khỏi
              phòng ban này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removeMemberMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}