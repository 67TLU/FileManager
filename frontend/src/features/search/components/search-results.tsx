import { useState } from 'react';
import { FileSearch, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ResourceTable } from '@/features/resources/components/resource-table';
import { ResourceCard } from '@/features/resources/components/resource-card';
import { ResourceDetailDialog } from '@/features/resources/components/resource-detail-dialog';
import { useDownloadResource, useMoveToTrash } from '@/features/resources/hooks/use-resources';
import type { Resource } from '@/features/resources/api/resources.api';
import { toast } from 'sonner';

interface SearchResultsProps {
  resources: Resource[];
  isLoading: boolean;
  total: number;
  query?: string;
}

export function SearchResults({ resources, isLoading, total, query }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailResourceId, setDetailResourceId] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-1">Không tìm thấy kết quả</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {query ? (
            <>
              Không có tài nguyên nào phù hợp với "<strong>{query}</strong>".
              <br />
              Hãy thử từ khóa khác hoặc điều chỉnh bộ lọc.
            </>
          ) : (
            'Nhập từ khóa để bắt đầu tìm kiếm'
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Tìm thấy <strong>{total}</strong> kết quả
        </p>
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