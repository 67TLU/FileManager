import { Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemSettings } from '../hooks/use-system-settings';
import { SettingsSection } from '../components/settings-section';
const MB = 1024 * 1024, GB = 1024 * 1024 * 1024;
export function SystemSettingsPage() {
  const { data: settings, isLoading, error } = useSystemSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Không thể tải cài đặt hệ thống. Vui lòng thử lại.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground mt-1">
          Cấu hình các tham số hệ thống cho toàn bộ công ty
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Các thay đổi ở đây sẽ ảnh hưởng đến toàn bộ hệ thống. Chỉ admin mới có quyền chỉnh sửa.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="upload">Tải lên</TabsTrigger>
          <TabsTrigger value="quota">Lưu trữ</TabsTrigger>
          <TabsTrigger value="trash">Thùng rác</TabsTrigger>
          <TabsTrigger value="auth">Bảo mật</TabsTrigger>
          <TabsTrigger value="sharing">Chia sẻ</TabsTrigger>
        </TabsList>

<TabsContent value="upload">
  <SettingsSection settings={settings} title="Tải lên" description="Giới hạn và định dạng file"
    fields={[
      { key: 'upload.max_file_size_bytes', label: 'Kích thước tối đa (MB)', type: 'number', unit: MB, min: 1, max: 1024 },
      { key: 'upload.allowed_extensions', label: 'Định dạng cho phép', type: 'list', help: 'Cách nhau bởi dấu phẩy' },
      { key: 'upload.blocked_extensions', label: 'Định dạng bị chặn', type: 'list' },
    ]} />
</TabsContent>

<TabsContent value="quota">
  <SettingsSection settings={settings} title="Hạn mức lưu trữ" description="Dung lượng mặc định"
    fields={[
      { key: 'quota.default_user_bytes', label: 'Mỗi nhân viên (GB)', type: 'number', unit: GB, min: 1, step: 0.5 },
      { key: 'quota.default_department_bytes', label: 'Mỗi phòng ban (GB)', type: 'number', unit: GB, min: 1 },
    ]} />
</TabsContent>

<TabsContent value="trash">
  <SettingsSection settings={settings} title="Thùng rác" description="File sẽ bị xóa vĩnh viễn sau thời gian này"
    fields={[{ key: 'trash.retention_days', label: 'Số ngày giữ (1–365)', type: 'number', min: 1, max: 365 }]} />
</TabsContent>

<TabsContent value="auth">
  <SettingsSection settings={settings} title="Bảo mật" description="Chính sách đăng nhập & phiên"
    fields={[
      { key: 'auth.max_failed_logins', label: 'Số lần sai tối đa (3–20)', type: 'number', min: 3, max: 20 },
      { key: 'auth.lockout_minutes', label: 'Thời gian khóa (phút)', type: 'number', min: 5, max: 1440 },
      { key: 'auth.refresh_token_ttl_days', label: 'Thời hạn phiên (ngày)', type: 'number', min: 1, max: 365 },
    ]} />
</TabsContent>

<TabsContent value="sharing">
  <SettingsSection settings={settings} title="Chia sẻ" description="Chính sách liên kết chia sẻ"
    fields={[{ key: 'sharing.max_link_expiry_days', label: 'Thời hạn link tối đa (ngày)', type: 'number', min: 1, max: 365 }]} />
</TabsContent>
      </Tabs>
    </div>
  );
}