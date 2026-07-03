import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Full-screen loading state while Firebase resolves the persisted session. */
function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

/** Auth gate: waits out loading, then redirects unauthenticated users to /login with the attempted path. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AuthLoading />;
  if (status === 'needs_role') {
    return <Navigate to="/choose-role" replace />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
