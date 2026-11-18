import { User, Shield, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileHeader } from '../components/profile-header';
import { ChangePasswordForm } from '../components/change-password-form';
import { ActiveSessions } from '../components/active-sessions';
import { SecurityOverview } from '../components/security-overview';
import { useProfile } from '../hooks/use-profile';

export function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Không thể tải thông tin cá nhân. Vui lòng thử lại.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-6 w-6" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin tài khoản và cài đặt bảo mật
        </p>
      </div>

      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Mật khẩu
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            Thiết bị
            {profile.activeSessions.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
                {profile.activeSessions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <SecurityOverview profile={profile} />
        </TabsContent>

        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="sessions">
          <ActiveSessions sessions={profile.activeSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}