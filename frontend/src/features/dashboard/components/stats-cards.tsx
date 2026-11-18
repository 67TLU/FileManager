import { FileText, HardDrive, Trash2, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFileSize } from '@/lib/utils';
import { useDashboardStats } from '../hooks/use-dashboard';

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Tổng tài nguyên',
      value: stats.totalFiles.toLocaleString('vi-VN'),
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Dung lượng đã dùng',
      value: formatFileSize(stats.totalSizeBytes),
      icon: HardDrive,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Trong thùng rác',
      value: stats.trashCount.toLocaleString('vi-VN'),
      icon: Trash2,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Lượt tải xuống',
      value: stats.downloadCount.toLocaleString('vi-VN'),
      icon: Download,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}