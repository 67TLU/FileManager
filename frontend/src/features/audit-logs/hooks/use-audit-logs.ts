import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auditLogsApi,type AuditLogsParams } from '../api/audit-logs.api';

export function useAuditLogs(params: AuditLogsParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsApi.list(params),
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 giây
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params: AuditLogsParams) => auditLogsApi.export(params),
    onSuccess: (blob) => {
      // Tạo blob URL và trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã xuất file audit logs');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Không thể xuất file');
    },
  });
}