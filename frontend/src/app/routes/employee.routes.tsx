import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/protected-route';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardPage } from '@/features/dashboard/pages/dashboard.page';
import { ResourcesPage } from '@/features/resources/pages/resources.page';
import { TrashPage } from '@/features/trash/pages/trash.page';
import { SearchPage } from '@/features/search/pages/search.page';
import { ProfilePage } from '@/features/profile/pages/profile.page';
import { RecentPage } from '@/features/recent/pages/recent.page';
export const employeeRoutes = (
  <Route element={<ProtectedRoute />}>
    <Route element={<MainLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/favorites" element={<div>Favorites Page (sẽ làm sau)</div>} />
      <Route path="/trash" element={<TrashPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/company" element={<ResourcesPage />} />
      <Route path="/departments" element={<div>Departments Page (sẽ làm sau)</div>} />
      <Route path="/recent" element={<RecentPage />} />
    </Route>
  </Route>
);