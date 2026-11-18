import { Download, FileText, Calendar, User, HardDrive, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFileSize, formatDate } from '@/lib/utils';
import { useResourceDetail, useDownloadResource } from '../hooks/use-resources';

interface ResourceDetailDialogProps {
  resourceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResourceDetailDialog({
  resourceId,
  open,
  onOpenChange,
}: ResourceDetailDialogProps) {
  const { data: resource, isLoading } = useResourceDetail(resourceId);
  const downloadMutation = useDownloadResource();

  const handleDownload = () => {
    if (resource) {
      downloadMutation.mutate({
        resourceId: resource.id,
        fileName: resource.name,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="truncate">{resource?.name || 'Chi tiết tài nguyên'}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : resource ? (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-2">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Loại
                  </div>
                  <div className="text-sm font-medium">
                    {resource.type === 'file' ? 'File' : resource.type === 'link' ? 'Liên kết' : 'Ghi chú'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5" />
                    Kích thước
                  </div>
                  <div className="text-sm font-medium">
                    {formatFileSize(resource.size_bytes)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Người tạo
                  </div>
                  <div className="text-sm font-medium">
                    {resource.created_by_name || '—'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ngày tạo
                  </div>
                  <div className="text-sm font-medium">
                    {formatDate(resource.created_at)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Phiên bản */}
              {resource.versions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    Lịch sử phiên bản ({resource.versions.length})
                  </h4>
                  <div className="space-y-2">
                    {resource.versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            Phiên bản {version.version_number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {version.created_by_name || '—'} • {formatDate(version.created_at)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(version.size_bytes)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {resource && (
            <Button onClick={handleDownload} disabled={downloadMutation.isPending}>
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}