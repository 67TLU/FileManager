import { useState } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import { DepartmentTree } from '../components/department-tree';
import { DepartmentTable } from '../components/department-table';
import {
  CreateDepartmentDialog,
  EditDepartmentDialog,
} from '../components/department-form-dialog';
import { DepartmentDetailDialog } from '../components/department-detail-dialog';
import { DepartmentMembersDialog } from '../components/department-members-dialog';
import { DepartmentViewToggle } from '../components/department-view-toggle';

import {
  useDepartments,
  useDepartmentTree,
  useDeleteDepartment,
} from '../hooks/use-departments';
import type { Department, DepartmentTreeNode } from '../api/departments.api';

type ConfirmAction = { type: 'delete'; department: Department } | null;

export function DepartmentsPage() {
  // State
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [viewDepartment, setViewDepartment] = useState<Department | null>(null);
  const [membersDepartment, setMembersDepartment] = useState<Department | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Queries
  const { data: departments, isLoading: isLoadingList, refetch: refetchList } = useDepartments();
  const { data: tree, isLoading: isLoadingTree, refetch: refetchTree } = useDepartmentTree();
  const deleteMutation = useDeleteDepartment();

  const isLoading = isLoadingList || isLoadingTree;

  // Handlers
  const handleDelete = async () => {
    if (!confirmAction) return;
    try {
      await deleteMutation.mutateAsync(confirmAction.department.id);
      setConfirmAction(null);
    } catch {
      // Error handled in mutation
    }
  };

  const handleRefetch = () => {
    refetchList();
    refetchTree();
  };

  // Filter departments by search
  const filteredDepartments = departments?.filter(
    (dept) =>
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Quản lý phòng ban
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý cấu trúc tổ chức và thành viên của các phòng ban
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DepartmentViewToggle view={view} onViewChange={setView} />
          <Button variant="outline" size="sm" onClick={handleRefetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo phòng ban
          </Button>
        </div>
      </div>

      {/* Search (chỉ hiển thị ở list view) */}
      {view === 'list' && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm phòng ban..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : view === 'tree' ? (
          <div className="p-4">
            <DepartmentTree
              tree={tree || []}
              selectedId={selectedId}
              onSelect={(dept) => {
                setSelectedId(dept.id);
                setViewDepartment(dept);
              }}
              onEdit={(dept) => setEditDepartment(dept)}
              onDelete={(dept) => setConfirmAction({ type: 'delete', department: dept })}
              onManageMembers={(dept) => setMembersDepartment(dept)}
            />
          </div>
        ) : (
          <DepartmentTable
            departments={filteredDepartments || []}
            onView={setViewDepartment}
            onEdit={setEditDepartment}
            onDelete={(dept) => setConfirmAction({ type: 'delete', department: dept })}
            onManageMembers={setMembersDepartment}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateDepartmentDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditDepartmentDialog
        open={!!editDepartment}
        onOpenChange={(open) => !open && setEditDepartment(null)}
        department={editDepartment}
      />

      <DepartmentDetailDialog
        department={viewDepartment}
        open={!!viewDepartment}
        onOpenChange={(open) => !open && setViewDepartment(null)}
      />

      <DepartmentMembersDialog
        department={membersDepartment}
        open={!!membersDepartment}
        onOpenChange={(open) => !open && setMembersDepartment(null)}
      />

      {/* Confirm delete */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng ban</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng ban <strong>{confirmAction?.department.name}</strong>?
              <br />
              <br />
              <span className="text-destructive font-medium">
                Lưu ý: Không thể xóa nếu phòng ban còn có phòng ban con hoặc thành viên.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}