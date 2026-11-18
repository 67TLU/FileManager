import { Eye, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ActionIcon, getActionLabel } from './action-icon';
import type { AuditLog } from '../api/audit-logs.api';

interface AuditLogsTableProps {
  logs: AuditLog[];
  onViewDetail: (log: AuditLog) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getActionBadgeVariant(action: string) {
  if (action.includes('failed') || action.includes('delete')) return 'destructive';
  if (action.includes('create') || action.includes('upload') || action.includes('login'))
    return 'default';
  if (action.includes('update') || action.includes('restore')) return 'secondary';
  return 'outline';
}

export function AuditLogsTable({ logs, onViewDetail }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Không có nhật ký nào</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Thời gian</TableHead>
          <TableHead className="w-[200px]">Người thực hiện</TableHead>
          <TableHead className="w-[180px]">Hành động</TableHead>
          <TableHead>Đối tượng</TableHead>
          <TableHead className="w-[120px]">IP</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id} className="hover:bg-muted/50">
            <TableCell className="text-xs text-muted-foreground">
              {formatDate(log.occurred_at)}
            </TableCell>
            <TableCell>
              {log.actor_name ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(log.actor_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{log.actor_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {log.actor_email}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Hệ thống</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ActionIcon action={log.action} />
                <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                  {getActionLabel(log.action)}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              {log.target_type ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">{log.target_type}:</span>{' '}
                  <span className="font-mono text-xs">{log.target_id?.slice(0, 8)}...</span>
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-mono">
              {log.ip || '—'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewDetail(log)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}