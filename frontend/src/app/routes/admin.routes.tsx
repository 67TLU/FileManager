import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/protected-route';
import { MainLayout } from '@/components/layout/main-layout';
import { UsersPage } from '@/features/users/pages/users.page';
import { DepartmentsPage } from '@/features/departments/pages/departments.page';
import { AuditLogsPage } from '@/features/audit-logs/pages/audit-logs.page';
import { SystemSettingsPage } from '@/features/system-settings/pages/system-settings.page';

export const adminRoutes = (
  <Route element={<ProtectedRoute requiredRole="admin" />}>
    <Route element={<MainLayout />}>
      <Route path="/admin/users" element={<UsersPage />} />
      <Route path="/admin/departments" element={<DepartmentsPage />} />
      <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      <Route path="/admin/settings" element={<SystemSettingsPage />} />
    </Route>
  </Route>
);