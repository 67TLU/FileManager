import { Shield, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProfileData } from '../api/profile.api';

interface SecurityOverviewProps {
  profile: ProfileData;
}

export function SecurityOverview({ profile }: SecurityOverviewProps) {
  const checks = [
    {
      label: 'Email đã xác thực',
      passed: !!profile.email_verified_at,
      description: profile.email_verified_at
        ? `Đã xác thực vào ${new Date(profile.email_verified_at).toLocaleDateString('vi-VN')}`
        : 'Vui lòng xác thực email để bảo mật tài khoản',
    },
    {
      label: 'Tài khoản hoạt động',
      passed: profile.status === 'active',
      description: profile.status === 'active' ? 'Tài khoản đang hoạt động bình thường' : `Trạng thái: ${profile.status}`,
    },
    {
      label: 'Phiên đăng nhập an toàn',
      passed: profile.activeSessions.length <= 3,
      description:
        profile.activeSessions.length <= 3
          ? `${profile.activeSessions.length} thiết bị đang đăng nhập`
          : `${profile.activeSessions.length} thiết bị - nên xem xét đăng xuất các thiết bị không dùng`,
    },
    {
      label: 'Đăng nhập gần đây',
      passed: !!profile.last_login_at,
      description: profile.last_login_at
        ? `Lần cuối: ${new Date(profile.last_login_at).toLocaleString('vi-VN')}`
        : 'Chưa có lịch sử đăng nhập',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tổng quan bảo mật
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">{score}%</div>
            <div className="text-xs text-muted-foreground">Điểm bảo mật</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {check.passed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{check.label}</div>
                <div className="text-xs text-muted-foreground">{check.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}