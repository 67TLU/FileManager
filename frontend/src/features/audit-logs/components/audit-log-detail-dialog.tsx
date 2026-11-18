import {
  Calendar,
  User,
  Target,
  Globe,
  Code,
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
import { formatDate } from '@/lib/utils';
import { ActionIcon, getActionLabel } from './action-icon';
import type { AuditLog } from '../api/audit-logs.api';

interface AuditLogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailDialog({ log, open, onOpenChange }: AuditLogDetailDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActionIcon action={log.action} className="h-5 w-5" />
            Chi tiết nhật ký
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-2">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Thời gian
                </div>
                <div className="text-sm font-medium">{formatDate(log.occurred_at)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Địa chỉ IP
                </div>
                <div className="text-sm font-medium font-mono">{log.ip || '—'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Người thực hiện
                </div>
                <div className="text-sm font-medium">
                  {log.actor_name || 'Hệ thống'}
                  {log.actor_email && (
                    <div className="text-xs text-muted-foreground">{log.actor_email}</div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  Hành động
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{getActionLabel(log.action)}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{log.action}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Đối tượng */}
            {log.target_type && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Đối tượng</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="text-xs text-muted-foreground">Loại</div>
                        <div className="text-sm font-medium">{log.target_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">ID</div>
                        <div className="text-sm font-mono">{log.target_id}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Code className="h-4 w-4" />
                  Metadata
                </h4>
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}