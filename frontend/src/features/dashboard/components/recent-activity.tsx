import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Share2,
  File,
  Image,
  Film,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/utils';
import { useRecentActivity } from '../hooks/use-dashboard';
import type { RecentActivity as RecentActivityType } from '../api/dashboard.api';

function getActionIcon(action: string) {
  switch (action) {
    case 'resource.upload':
      return <Upload className="h-4 w-4 text-green-500" />;
    case 'resource.download':
      return <Download className="h-4 w-4 text-blue-500" />;
    case 'resource.trash':
      return <Trash2 className="h-4 w-4 text-orange-500" />;
    case 'resource.restore':
      return <RotateCcw className="h-4 w-4 text-cyan-500" />;
    case 'resource.share':
      return <Share2 className="h-4 w-4 text-purple-500" />;
    case 'resource.view':
      return <FileText className="h-4 w-4 text-gray-500" />;
    default:
      return <File className="h-4 w-4 text-gray-400" />;
  }
}

function getActionText(action: string): string {
  switch (action) {
    case 'resource.upload':
      return 'đã tải lên';
    case 'resource.download':
      return 'đã tải xuống';
    case 'resource.trash':
      return 'đã xóa';
    case 'resource.restore':
      return 'đã khôi phục';
    case 'resource.share':
      return 'đã chia sẻ';
    case 'resource.view':
      return 'đã xem';
    default:
      return 'đã thực hiện';
  }
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="h-4 w-4 text-gray-400" />;
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-green-500" />;
  if (mimeType.startsWith('video/')) return <Film className="h-4 w-4 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  if (mimeType.includes('presentation')) return <Presentation className="h-4 w-4 text-orange-500" />;
  return <FileText className="h-4 w-4 text-blue-500" />;
}

export function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: RecentActivityType }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b last:border-0">
      <div className="flex-shrink-0 mt-0.5">
        {getActionIcon(activity.action)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {activity.resource && (
            <div className="flex-shrink-0">
              {getFileIcon(activity.resource.mimeType)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {activity.resource ? (
              <Link
                to={`/resources/${activity.resource.id}`}
                className="text-sm font-medium hover:text-primary hover:underline truncate block"
              >
                {activity.resource.name}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Tài nguyên đã bị xóa</span>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {getActionText(activity.action)}
              {activity.resource?.folderName && (
                <> trong <span className="font-medium">{activity.resource.folderName}</span></>
              )}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(activity.occurredAt)}
        </p>
      </div>
    </div>
  );
}