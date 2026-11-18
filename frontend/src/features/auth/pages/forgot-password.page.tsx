import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '../api/auth.api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const m = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => { setSent(true); toast.success('Đã gửi hướng dẫn nếu email tồn tại'); },
    onError: (e: any) => toast.error(e.response?.data?.error?.message || 'Có lỗi xảy ra'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>Nhập email công ty để nhận liên kết đặt lại</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Nếu <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn.
                Liên kết có hiệu lực 1 giờ.
              </p>
              <Link to="/login"><Button variant="outline" className="w-full">Về đăng nhập</Button></Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" required className="pl-10" placeholder="name@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={m.isPending}>
                {m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Gửi liên kết
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />Quay lại đăng nhập
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}