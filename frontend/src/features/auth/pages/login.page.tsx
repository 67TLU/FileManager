import { Link } from 'react-router-dom';
import { LoginForm } from '../components/login-form';
import { Building2 } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CRMS</h1>
                <p className="text-xs text-muted-foreground">
                  Company Resource Management
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Chào mừng trở lại
            </h2>
            <p className="text-muted-foreground">
              Đăng nhập để truy cập hệ thống quản lý tài nguyên
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link
              to="/contact-admin"
              className="font-medium text-primary hover:underline"
            >
              Liên hệ quản trị viên
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="relative hidden w-1/2 bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground/10" />
        <div className="relative flex h-full flex-col justify-center px-20 text-primary-foreground">
          <h2 className="text-4xl font-bold leading-tight">
            Quản lý tài nguyên
            <br />
            tập trung & bảo mật
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Lưu trữ, chia sẻ và kiểm soát quyền truy cập tài nguyên nội bộ
            của công ty một cách an toàn.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm opacity-90">Bảo mật</div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-90">Truy cập</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}