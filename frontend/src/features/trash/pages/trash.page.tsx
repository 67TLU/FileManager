import { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

import { TrashTable } from '../../resources/components/trash-table';
import {
  useTrashList,
  useRestoreResource,
  usePermanentDelete,
  usePermanentDeleteMany,
  useRestoreMany,
} from '../../resources/hooks/use-trash';
import type { Resource } from '../../resources/api/resources.api';

type ConfirmAction =
  | { type: 'restore'; resource: Resource }
  | { type: 'delete'; resource: Resource }
  | { type: 'bulk-restore'; count: number }
  | { type: 'bulk-delete'; count: number }
  | null;

export function TrashPage() {
  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Queries
  const { data: resources, isLoading, refetch } = useTrashList();

  // Mutations
  const restoreMutation = useRestoreResource();
  const deleteMutation = usePermanentDelete();
  const bulkDeleteMutation = usePermanentDeleteMany();
  const bulkRestoreMutation = useRestoreMany();

  // Handlers
  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && resources) {
      setSelectedIds(new Set(resources.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleRestore = (resource: Resource) => {
    setConfirmAction({ type: 'restore', resource });
  };

  const handlePermanentDelete = (resource: Resource) => {
    setConfirmAction({ type: 'delete', resource });
  };

  const handleBulkRestore = () => {
    if (selectedIds.size === 0) return;
    setConfirmAction({ type: 'bulk-restore', count: selectedIds.size });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmAction({ type: 'bulk-delete', count: selectedIds.size });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'restore':
          await restoreMutation.mutateAsync(confirmAction.resource.id);
          break;
        case 'delete':
          await deleteMutation.mutateAsync(confirmAction.resource.id);
          break;
        case 'bulk-restore':
          await bulkRestoreMutation.mutateAsync(Array.from(selectedIds));
          setSelectedIds(new Set());
          break;
        case 'bulk-delete':
          await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
          setSelectedIds(new Set());
          break;
      }
      setConfirmAction(null);
    } catch {
      // Error handled in mutation
    }
  };

  const isPending =
    restoreMutation.isPending ||
    deleteMutation.isPending ||
    bulkDeleteMutation.isPending ||
    bulkRestoreMutation.isPending;

  // Dialog content based on action
  const getDialogConfig = () => {
    if (!confirmAction) return { title: '', description: '' };

    switch (confirmAction.type) {
      case 'restore':
        return {
          title: 'Khôi phục tài nguyên',
          description: `Bạn có muốn khôi phục "${confirmAction.resource.name}" về thư mục gốc?`,
        };
      case 'delete':
        return {
          title: 'Xóa vĩnh viễn',
          description: `Bạn có chắc muốn xóa vĩnh viễn "${confirmAction.resource.name}"? Hành động này KHÔNG THỂ hoàn tác.`,
        };
      case 'bulk-restore':
        return {
          title: 'Khôi phục nhiều tài nguyên',
          description: `Bạn có muốn khôi phục ${confirmAction.count} tài nguyên đã chọn?`,
        };
      case 'bulk-delete':
        return {
          title: 'Xóa vĩnh viễn nhiều tài nguyên',
          description: `Bạn có chắc muốn xóa vĩnh viễn ${confirmAction.count} tài nguyên đã chọn? Hành động này KHÔNG THỂ hoàn tác.`,
        };
    }
  };

  const dialogConfig = getDialogConfig();
  const isDangerous =
    confirmAction?.type === 'delete' || confirmAction?.type === 'bulk-delete';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Thùng rác
          </h1>
          <p className="text-muted-foreground mt-1">
            File đã xóa sẽ tự động bị xóa vĩnh viễn sau 30 ngày
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      {/* Actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            Đã chọn {selectedIds.size} tài nguyên
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRestore}
              disabled={isPending}
            >
              {bulkRestoreMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang khôi phục...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Khôi phục
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa vĩnh viễn
                </>
              )}
            </Button>
          </div>
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
        ) : (
          <TrashTable
            resources={resources || []}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDangerous && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {dialogConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{dialogConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={isDangerous ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : isDangerous ? (
                'Xóa vĩnh viễn'
              ) : (
                'Khôi phục'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}