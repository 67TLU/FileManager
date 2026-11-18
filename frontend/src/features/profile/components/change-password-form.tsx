import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useChangePassword } from '../hooks/use-profile';

const schema = z.object({
  currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Cần ít nhất 1 số'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp', path: ['confirmPassword'],
});
type Values = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const [show, setShow] = useState(false);
  const mutation = useChangePassword();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (v: Values) =>
    mutation.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword });

  const fields: Array<{ name: keyof Values; label: string }> = [
    { name: 'currentPassword', label: 'Mật khẩu hiện tại' },
    { name: 'newPassword', label: 'Mật khẩu mới' },
    { name: 'confirmPassword', label: 'Xác nhận mật khẩu mới' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Đổi mật khẩu</CardTitle>
        <CardDescription>Sau khi đổi, bạn sẽ phải đăng nhập lại trên mọi thiết bị</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>Mật khẩu cần ≥ 8 ký tự, gồm chữ hoa, chữ thường và số.</AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            {fields.map((f) => (
              <FormField key={f.name} control={form.control} name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={show ? 'text' : 'password'} className="pr-10"
                          autoComplete={f.name === 'currentPassword' ? 'current-password' : 'new-password'}
                          {...field} />
                        <button type="button" onClick={() => setShow(!show)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            ))}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đổi mật khẩu
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}