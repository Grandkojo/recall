import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthShell } from '../../features/auth/auth-shell';
import { TextField, Button } from '../../components/ui';
import { loginWithEmail, loginWithGoogle, authErrorMessage } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The AuthProvider syncs after Firebase sign-in; redirect once authenticated.
  useEffect(() => {
    if (status === 'authenticated') {
      navigate(from, { replace: true });
    } else if (status === 'needs_role') {
      import('../../services/auth').then((m) => m.logout());
      setError('Account not found. Please create an account first.');
      setSubmitting(false);
    } else if (status === 'unauthenticated') {
      setSubmitting(false);
    }
  }, [status, from, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep their story close">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-[13px] font-medium text-error">{error}</p>}
        <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-line-strong"></div>
        </div>
        <div className="relative flex justify-center text-[13px] font-semibold text-muted uppercase tracking-wider bg-transparent">
          <span className="bg-surface px-4">OR</span>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        variant="secondary"
        className="mt-6 w-full flex items-center justify-center gap-3"
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true);
          setError(null);
          try {
            await loginWithGoogle();
          } catch (err) {
            setError(authErrorMessage(err));
            setSubmitting(false);
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </Button>

      <p className="mt-6 text-sm font-medium text-muted">
        New to Recall?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
