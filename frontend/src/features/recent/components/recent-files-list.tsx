import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Trash2,
  LayoutGrid,
  List,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ResourceTable } from '@/features/resources/components/resource-table';
import { ResourceCard } from '@/features/resources/components/resource-card';
import { ResourceDetailDialog } from '@/features/resources/components/resource-detail-dialog';
import {
  useDownloadResource,
  useMoveToTrash,
} from '@/features/resources/hooks/use-resources';
import { useRecentResources } from '@/features/search/hooks/use-search';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { Resource } from '@/features/resources/api/resources.api';

interface RecentFilesListProps {
  limit?: number;
  showHeader?: boolean;
}

export function RecentFilesList({ limit = 50, showHeader = true }: RecentFilesListProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailResourceId, setDetailResourceId] = useState<string | null>(null);

  const { data: resources = [], isLoading } = useRecentResources(limit);
  const downloadMutation = useDownloadResource();
  const trashMutation = useMoveToTrash();

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(resources.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDownload = (resource: Resource) => {
    downloadMutation.mutate(
      { resourceId: resource.id, fileName: resource.name },
      { onSuccess: () => toast.success('Đang tải xuống...') }
    );
  };

  const handleTrash = (resource: Resource) => {
    trashMutation.mutate(resource.id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Chưa có hoạt động nào</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Các tài nguyên bạn truy cập sẽ hiển thị ở đây. Hãy bắt đầu khám phá tài liệu của công ty!
          </p>
          <Button
            className="mt-6"
            onClick={() => navigate('/resources')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Khám phá tài nguyên
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header với view toggle */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {resources.length} tài nguyên gần đây
            </h3>
          </div>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {viewMode === 'list' ? (
        <ResourceTable
          resources={resources}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onOpen={(resource) => setDetailResourceId(resource.id)}
          onDownload={handleDownload}
          onTrash={handleTrash}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              selected={selectedIds.has(resource.id)}
              onSelect={(selected) => handleSelect(resource.id, selected)}
              onOpen={() => setDetailResourceId(resource.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setDetailResourceId(resource.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <ResourceDetailDialog
        resourceId={detailResourceId}
        open={!!detailResourceId}
        onOpenChange={(open) => !open && setDetailResourceId(null)}
      />
    </div>
  );
}