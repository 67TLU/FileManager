import { Clock, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RecentFilesList } from '../components/recent-files-list';

export function RecentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Truy cập gần đây
        </h1>
        <p className="text-muted-foreground mt-1">
          Các tài nguyên bạn đã xem hoặc tải xuống gần đây
        </p>
      </div>

      {/* Info alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Danh sách này được tổng hợp từ lịch sử hoạt động của bạn. Tài nguyên đã xóa sẽ không hiển thị ở đây.
        </AlertDescription>
      </Alert>

      {/* Recent files list */}
      <RecentFilesList limit={50} showHeader={true} />
    </div>
  );
}