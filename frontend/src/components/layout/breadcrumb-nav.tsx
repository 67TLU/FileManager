import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard', resources: 'Tài liệu', recent: 'Gần đây',
  favorites: 'Yêu thích', trash: 'Thùng rác', search: 'Tìm kiếm',
  profile: 'Hồ sơ', company: 'Công ty', departments: 'Phòng ban',
  admin: 'Quản trị', users: 'Nhân viên', 'audit-logs': 'Nhật ký',
  settings: 'Cài đặt',
};

export function BreadcrumbNav() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        {parts.map((part, i) => {
          const href = '/' + parts.slice(0, i + 1).join('/');
          const isLast = i === parts.length - 1;
          const label = LABELS[part] ?? part;
          return (
            <BreadcrumbItem key={href}>
              {i > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={href} />}>{label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}