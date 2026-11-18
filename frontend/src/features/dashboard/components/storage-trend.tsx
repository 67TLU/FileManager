import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFileSize } from '@/lib/utils';
import { useStorageTrend } from '../hooks/use-dashboard';

export function StorageTrend() {
  const { data: trend, isLoading } = useStorageTrend(6);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trend || trend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng lưu trữ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Chưa có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data cho chart
  const chartData = trend.map((item) => ({
    month: new Date(item.month).toLocaleDateString('vi-VN', {
      month: 'short',
      year: '2-digit',
    }),
    bytes: item.totalBytes,
    displayBytes: formatFileSize(item.totalBytes),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xu hướng lưu trữ (6 tháng)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBytes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis
              className="text-xs"
              tickFormatter={(value) => formatFileSize(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [formatFileSize(value), 'Dung lượng']}
            />
            <Area
              type="monotone"
              dataKey="bytes"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorBytes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}