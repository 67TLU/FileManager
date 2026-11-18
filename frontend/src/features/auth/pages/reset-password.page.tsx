import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '../api/auth.api';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const m = useMutation({
    mutationFn: () => authApi.resetPassword(token, pw),
    onSuccess: () => { toast.success('Đặt lại mật khẩu thành công'); navigate('/login'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message || 'Token không hợp lệ'),
  });

  const valid = pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && pw === pw2;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md"><CardContent className="py-8 text-center space-y-4">
          <p className="text-destructive">Liên kết không hợp lệ hoặc thiếu token.</p>
          <Link to="/forgot-password"><Button variant="outline">Yêu cầu liên kết mới</Button></Link>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Đặt lại mật khẩu</CardTitle>
          <CardDescription>Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Xác nhận mật khẩu</Label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
              {pw2 && pw !== pw2 && <p className="text-sm text-destructive">Mật khẩu không khớp</p>}
            </div>
            <Button type="submit" className="w-full" disabled={!valid || m.isPending}>
              {m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Đặt lại mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}