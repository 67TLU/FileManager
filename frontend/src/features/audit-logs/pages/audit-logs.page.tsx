import { useState } from 'react';
import {
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { AuditLogsTable } from '../components/audit-logs-table';
import { AuditLogsFilters, type AuditLogsFiltersState } from '../components/audit-logs-filters';
import { AuditLogDetailDialog } from '../components/audit-log-detail-dialog';
import { useAuditLogs, useExportAuditLogs } from '../hooks/use-audit-logs';
import type { AuditLog } from '../api/audit-logs.api';

const DEFAULT_FILTERS: AuditLogsFiltersState = {
  action: '',
  actorId: '',
  targetType: '',
  dateFrom: null,
  dateTo: null,
};

export function AuditLogsPage() {
  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState<AuditLogsFiltersState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Queries
  const { data, isLoading, refetch } = useAuditLogs({
    page,
    limit,
    action: filters.action || undefined,
    actorId: filters.actorId || undefined,
    targetType: filters.targetType || undefined,
    dateFrom: filters.dateFrom ? filters.dateFrom.toISOString() : undefined,
    dateTo: filters.dateTo ? filters.dateTo.toISOString() : undefined,
  });

  const exportMutation = useExportAuditLogs();

  // Handlers
  const handleFiltersChange = (newFilters: AuditLogsFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
    // TODO: Implement search by actor name/email in backend
    setPage(1);
  };

  const handleExport = () => {
    exportMutation.mutate({
      action: filters.action || undefined,
      actorId: filters.actorId || undefined,
      targetType: filters.targetType || undefined,
      dateFrom: filters.dateFrom ? filters.dateFrom.toISOString() : undefined,
      dateTo: filters.dateTo ? filters.dateTo.toISOString() : undefined,
    });
  };

  // Pagination
  const totalPages = data?.pagination?.totalPages || 1;
  const paginationItems = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) paginationItems.push(i);
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
            <FileText className="h-6 w-6" />
            Nhật ký kiểm toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi mọi hoạt động trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nhật ký kiểm toán ghi lại mọi hoạt động quan trọng trong hệ thống. Dữ liệu được lưu trữ
          vĩnh viễn và không thể chỉnh sửa.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <AuditLogsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Summary */}
      {data && (
        <div className="text-sm text-muted-foreground">
          Hiển thị {data.data.length} / {data.pagination.total} nhật ký
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <AuditLogsTable
            logs={data?.data || []}
            onViewDetail={setSelectedLog}
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

      {/* Detail Dialog */}
      <AuditLogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}