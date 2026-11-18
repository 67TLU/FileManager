import { useState } from 'react';
import {
  Upload,
  FolderPlus,
  LayoutGrid,
  List,
  Trash2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import { FolderTree } from '../components/folder-tree';
import { ResourceTable } from '../components/resource-table';
import { ResourceCard } from '../components/resource-card';
import { ResourcesBreadcrumb } from '../components/resources-breadcrumb';
import { UploadDialog } from '../components/upload-dialog';
import { ResourceDetailDialog } from '../components/resource-detail-dialog';
import { CreateFolderDialog } from '../components/create-folder-dialog';

import {
  useResources,
  useDownloadResource,
  useMoveToTrash,
} from '../hooks/use-resources';
import {
  useFolderTree,
  findFolderInTree,
  getFolderPath,
} from '../hooks/use-folder-tree';

import type { Resource } from '../api/resources.api';

// Company workspace ID
const COMPANY_WORKSPACE_ID = 'd0000000-0000-4000-8000-000000000001';
// Root folder ID (Tài liệu công ty trong seed data)
const ROOT_FOLDER_ID = 'f0000000-0000-4000-8000-000000000001';

export function ResourcesPage() {
  // State
  const [selectedFolderId, setSelectedFolderId] = useState<string>(ROOT_FOLDER_ID);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'size_bytes'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Dialogs
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [detailResourceId, setDetailResourceId] = useState<string | null>(null);
  const [trashConfirmResource, setTrashConfirmResource] = useState<Resource | null>(null);

  // Queries
  const { data: folderTreeData } = useFolderTree();
  const {
    data: resourcesData,
    isLoading,
    refetch,
  } = useResources({
    folderId: selectedFolderId,
    sortBy,
    order,
  });

  // Mutations
  const downloadMutation = useDownloadResource();
  const trashMutation = useMoveToTrash();

  // Derived data
  const folderPath = folderTreeData?.tree
    ? getFolderPath(folderTreeData.tree, selectedFolderId)
    : [];

  // Handlers
  const handleSelectResource = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && resourcesData?.data) {
      setSelectedIds(new Set(resourcesData.data.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleOpenResource = (resource: Resource) => {
    setDetailResourceId(resource.id);
  };

  const handleDownload = (resource: Resource) => {
    downloadMutation.mutate(
      { resourceId: resource.id, fileName: resource.name },
      {
        onSuccess: () => toast.success('Đang tải xuống...'),
      }
    );
  };

  const handleTrash = (resource: Resource) => {
    setTrashConfirmResource(resource);
  };

  const confirmTrash = async () => {
    if (!trashConfirmResource) return;
    await trashMutation.mutateAsync(trashConfirmResource.id);
    setTrashConfirmResource(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(trashConfirmResource.id);
      return next;
    });
  };

  const handleBulkTrash = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => trashMutation.mutateAsync(id))
      );
      toast.success(`Đã xóa ${selectedIds.size} tài nguyên`);
      setSelectedIds(new Set());
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Folder Tree */}
      <div className="w-64 border-r bg-background">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Thư mục</h3>
        </div>
        <FolderTree
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 space-y-3">
          {/* Breadcrumb */}
          <ResourcesBreadcrumb
            path={folderPath}
            onNavigate={(folderId) => {
              if (folderId === null) {
                setSelectedFolderId(ROOT_FOLDER_ID);
              } else {
                setSelectedFolderId(folderId);
              }
              setSelectedIds(new Set());
            }}
          />

          {/* Actions bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Tải lên
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateFolderOpen(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Thư mục mới
              </Button>

              {selectedIds.size > 0 && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkTrash}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa ({selectedIds.size})
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select
                value={`${sortBy}-${order}`}
                onValueChange={(value) => {
                  const [by, ord] = value.split('-') as [typeof sortBy, typeof order];
                  setSortBy(by);
                  setOrder(ord);
                }}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Mới nhất</SelectItem>
                  <SelectItem value="created_at-asc">Cũ nhất</SelectItem>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                  <SelectItem value="size_bytes-desc">Kích thước giảm</SelectItem>
                  <SelectItem value="size_bytes-asc">Kích thước tăng</SelectItem>
                </SelectContent>
              </Select>

              {/* View mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <ResourceTable
              resources={resourcesData?.data || []}
              selectedIds={selectedIds}
              onSelect={handleSelectResource}
              onSelectAll={handleSelectAll}
              onOpen={handleOpenResource}
              onDownload={handleDownload}
              onTrash={handleTrash}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {(resourcesData?.data || []).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  selected={selectedIds.has(resource.id)}
                  onSelect={(selected) => handleSelectResource(resource.id, selected)}
                  onOpen={() => handleOpenResource(resource)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleOpenResource(resource);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderId={selectedFolderId}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={selectedFolderId}
      />

      <ResourceDetailDialog
        resourceId={detailResourceId}
        open={!!detailResourceId}
        onOpenChange={(open) => !open && setDetailResourceId(null)}
      />

      <AlertDialog
        open={!!trashConfirmResource}
        onOpenChange={(open) => !open && setTrashConfirmResource(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn chuyển <strong>{trashConfirmResource?.name}</strong> vào
              thùng rác? Bạn có thể khôi phục sau này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTrash}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}