import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const m = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/invitations/accept', { token, password, fullName });
      return data.data;
    },
    onSuccess: () => { toast.success('Tạo tài khoản thành công, hãy đăng nhập'); navigate('/login'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message || 'Lời mời không hợp lệ'),
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md"><CardContent className="py-8 text-center">
          <p className="text-destructive">Liên kết lời mời thiếu token.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Hoàn tất đăng ký</CardTitle>
          <CardDescription>Bạn được mời tham gia hệ thống CRMS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự</p>
            </div>
            <Button type="submit" className="w-full" disabled={m.isPending}>
              {m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Tạo tài khoản
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản? <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}