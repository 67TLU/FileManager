import { Route } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/login.page';
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password.page';
import { ResetPasswordPage } from '@/features/auth/pages/reset-password.page';
import { AcceptInvitationPage } from '@/features/auth/pages/accept-invitation.page';

export const authRoutes = (
  <Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
  </Route>
);