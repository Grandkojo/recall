import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { Landing } from '../pages/Landing';
import { LoginPage } from '../pages/auth/login';
import { SignupPage } from '../pages/auth/signup';
import { ChooseRolePage } from '../pages/auth/choose-role';
import { NotFound } from '../pages/not-found';
import { ProtectedRoute } from './protected-route';
import { AppLayout } from '../pages/app/app-layout';
import { Dashboard } from '../pages/app/dashboard';
import { AddMemoryPage } from '../pages/app/add-memory';
import { SettingsPage } from '../pages/app/settings';
import { MemoryShowcasePage } from '../pages/app/showcase';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'choose-role', element: <ChooseRolePage /> },
    ],
  },
  {
    // Authenticated area — its own layout, gated on auth status.
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'add-memory', element: <AddMemoryPage /> },
          { path: 'showcase', element: <MemoryShowcasePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ]
      }
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
