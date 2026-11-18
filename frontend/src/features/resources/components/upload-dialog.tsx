import { Upload as UploadIcon, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatFileSize } from '@/lib/utils';
import { useUpload } from '../hooks/use-upload';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
}

export function UploadDialog({ open, onOpenChange, folderId }: UploadDialogProps) {
  const { files, addFiles, clearCompleted, reset, isUploading } = useUpload(folderId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      e.currentTarget.classList.add('bg-primary/10', 'border-primary');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      e.currentTarget.classList.remove('bg-primary/10', 'border-primary');
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('bg-primary/10', 'border-primary');
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Không cho đóng khi đang upload
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tải lên tài nguyên</DialogTitle>
          <DialogDescription>
            Kéo thả file vào đây hoặc chọn file từ máy tính
          </DialogDescription>
        </DialogHeader>

        {/* Drop zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-muted/50"
        >
          <UploadIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Kéo thả file vào đây
          </p>
          <p className="text-xs text-muted-foreground">
            hoặc click để chọn file (tối đa 100MB/file)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                File đang tải ({files.filter(f => f.status === 'success').length}/{files.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                disabled={isUploading}
              >
                Xóa đã xong
              </Button>
            </div>

            <ScrollArea className="h-64 border rounded-md">
              <div className="divide-y">
                {files.map((item, index) => (
                  <div key={index} className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {item.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        {item.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        {item.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                        )}
                        <span className="text-sm truncate">{item.file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatFileSize(item.file.size)}
                      </span>
                    </div>

                    {item.status === 'uploading' && (
                      <Progress value={item.progress} className="h-1" />
                    )}

                    {item.status === 'error' && item.error && (
                      <p className="text-xs text-destructive">{item.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {isUploading ? 'Đang tải lên...' : 'Đóng'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}