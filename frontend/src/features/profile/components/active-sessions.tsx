import { useState } from 'react';
import { Monitor, Smartphone, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';
import { useProfile, useRevokeSession, useLogoutAllDevices } from '../hooks/use-profile';
import type { ProfileData } from '../api/profile.api';

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) return <Monitor className="h-5 w-5" />;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return <Smartphone className="h-5 w-5" />;
  }
  return <Monitor className="h-5 w-5" />;
}

function getDeviceName(userAgent: string | null): string {
  if (!userAgent) return 'Thiết bị không xác định';
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome') && ua.includes('mobile')) return 'Chrome Mobile';
  if (ua.includes('chrome')) return 'Chrome Desktop';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Microsoft Edge';
  return 'Trình duyệt khác';
}

interface ActiveSessionsProps {
  sessions: ProfileData['activeSessions'];
}

export function ActiveSessions({ sessions }: ActiveSessionsProps) {
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);

  const { refetch } = useProfile();
  const revokeMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAllDevices();

  const handleRevoke = async () => {
    if (!sessionToRevoke) return;
    await revokeMutation.mutateAsync(sessionToRevoke);
    setSessionToRevoke(null);
    refetch();
  };

  const handleLogoutAll = async () => {
    await logoutAllMutation.mutateAsync();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phiên đăng nhập</CardTitle>
              <CardDescription>
                Các thiết bị đang đăng nhập vào tài khoản của bạn
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutAllDialog(true)}
                className="text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất tất cả
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Không có phiên đăng nhập nào
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.userAgent)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {getDeviceName(session.userAgent)}
                        </span>
                        {idx === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Hiện tại
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {session.ip || 'IP không xác định'} • Đăng nhập:{' '}
                        {formatDate(session.createdAt)}
                      </div>
                    </div>
                  </div>

                  {idx !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSessionToRevoke(session.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Đăng xuất
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke single session dialog */}
      <AlertDialog
        open={!!sessionToRevoke}
        onOpenChange={(open) => !open && setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng xuất thiết bị này?</AlertDialogTitle>
            <AlertDialogDescription>
              Thiết bị này sẽ phải đăng nhập lại. Các thiết bị khác không bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revokeMutation.isPending}>
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng xuất'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout all dialog */}
      <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Đăng xuất khỏi tất cả thiết bị?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ phải đăng nhập lại trên TẤT CẢ thiết bị. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutAll}
              disabled={logoutAllMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {logoutAllMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng xuất tất cả'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}