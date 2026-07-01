import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { Landing } from '../pages/Landing';
import { LoginPage } from '../pages/auth/login';
import { SignupPage } from '../pages/auth/signup';
import { NotFound } from '../pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true,   element: <Landing /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: '*',     element: <Navigate to="/" replace /> },
    ],
  },
]);
