import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { Landing } from '../pages/Landing';
import { LoginPage } from '../pages/auth/login';
import { SignupPage } from '../pages/auth/signup';
import { NotFound } from '../pages/not-found';
import { ProtectedRoute } from './protected-route';
import { Dashboard } from '../pages/app/dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
  {
    // Authenticated area — its own layout, gated on auth status.
    element: <ProtectedRoute />,
    children: [{ path: '/app', element: <Dashboard /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
