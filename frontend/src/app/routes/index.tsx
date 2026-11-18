import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes } from './auth.routes';
import { employeeRoutes } from './employee.routes';
import { adminRoutes } from './admin.routes';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {authRoutes}
        {employeeRoutes}
        {adminRoutes}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}