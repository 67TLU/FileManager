import { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Users as UsersIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { UserTable } from '../components/user-table';
import { CreateUserDialog, EditUserDialog } from '../components/user-form-dialog';
import { UserDetailDialog } from '../components/user-detail-dialog';
import { AssignRolesDialog } from '../components/assign-roles-dialog';
import { useUsers, useDepartments, useDeleteUser, useUpdateUser } from '../hooks/use-users';
import type { User } from '../api/users.api';

type ConfirmAction =
  | { type: 'delete'; user: User }
  | { type: 'suspend'; user: User }
  | { type: 'activate'; user: User }
  | null;

export function UsersPage() {
  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [assignRolesUser, setAssignRolesUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Queries
  const { data, isLoading, refetch } = useUsers({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
  });

  const { data: departments = [] } = useDepartments();
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();

  // Handlers
  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'delete':
          await deleteUserMutation.mutateAsync(confirmAction.user.id);
          break;
        case 'suspend':
          await updateUserMutation.mutateAsync({
            userId: confirmAction.user.id,
            data: { status: 'suspended' },
          });
          toast.success('Đã tạm khóa tài khoản');
          break;
        case 'activate':
          await updateUserMutation.mutateAsync({
            userId: confirmAction.user.id,
            data: { status: 'active' },
          });
          toast.success('Đã kích hoạt tài khoản');
          break;
      }
      setConfirmAction(null);
    } catch {
      // Error handled in mutation
    }
  };

  const handleToggleStatus = (user: User) => {
    if (user.status === 'active') {
      setConfirmAction({ type: 'suspend', user });
    } else if (user.status === 'suspended') {
      setConfirmAction({ type: 'activate', user });
    }
  };

  // Pagination
  const totalPages = data?.pagination?.totalPages || 1;
  const paginationItems = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      paginationItems.push(i);
    }
  } else {
    if (page <= 3) {
      paginationItems.push(1, 2, 3, 4, 'ellipsis', totalPages);
    } else if (page >= totalPages - 2) {
      paginationItems.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      paginationItems.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UsersIcon className="h-6 w-6" />
            Quản lý nhân viên
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản, phòng ban và quyền truy cập của nhân viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="invited">Đã mời</SelectItem>
            <SelectItem value="suspended">Tạm khóa</SelectItem>
            <SelectItem value="disabled">Vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={departmentFilter}
          onValueChange={(value) => {
            setDepartmentFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng ban</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(limit)}
          onValueChange={(value) => {
            setLimit(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
            <SelectItem value="100">100 / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      {data && (
        <div className="text-sm text-muted-foreground">
          Hiển thị {data.data.length} / {data.pagination.total} nhân viên
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <UserTable
            users={data?.data || []}
            onView={setViewUser}
            onEdit={setEditUser}
            onDelete={(user) => setConfirmAction({ type: 'delete', user })}
            onToggleStatus={handleToggleStatus}
            onAssignRoles={setAssignRolesUser}
          />
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {paginationItems.map((item, idx) =>
              item === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    onClick={() => setPage(item as number)}
                    isActive={page === item}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogs */}
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditUserDialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
      />

      <UserDetailDialog
        user={viewUser}
        open={!!viewUser}
        onOpenChange={(open) => !open && setViewUser(null)}
      />

      <AssignRolesDialog
        user={assignRolesUser}
        open={!!assignRolesUser}
        onOpenChange={(open) => !open && setAssignRolesUser(null)}
      />

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete' && 'Xác nhận xóa'}
              {confirmAction?.type === 'suspend' && 'Xác nhận tạm khóa'}
              {confirmAction?.type === 'activate' && 'Xác nhận kích hoạt'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete' && (
                <>
                  Bạn có chắc muốn xóa tài khoản <strong>{confirmAction.user.full_name}</strong>?
                  Hành động này không thể hoàn tác.
                </>
              )}
              {confirmAction?.type === 'suspend' && (
                <>
                  Bạn có chắc muốn tạm khóa tài khoản <strong>{confirmAction.user.full_name}</strong>?
                  Nhân viên sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
                </>
              )}
              {confirmAction?.type === 'activate' && (
                <>
                  Bạn có chắc muốn kích hoạt lại tài khoản <strong>{confirmAction.user.full_name}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={deleteUserMutation.isPending || updateUserMutation.isPending}
              className={confirmAction?.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}