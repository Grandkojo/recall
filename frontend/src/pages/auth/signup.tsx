import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../../features/auth/auth-shell';
import { TextField, Button } from '../../components/ui';
import { signupWithEmail, signupWithGoogle, authErrorMessage } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import type { SignupRole } from '../../types';

const ROLES: { value: SignupRole; label: string; hint: string }[] = [
  { value: 'CAREGIVER', label: 'Caregiver', hint: 'I manage memories for a loved one' },
  { value: 'FAMILY_CONTRIBUTOR', label: 'Family member', hint: 'I add photos and stories' },
  { value: 'PATIENT', label: 'I am the patient', hint: 'I want to look back on my memories' },
];

export function SignupPage() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);

  const [role, setRole] = useState<SignupRole>('CAREGIVER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The AuthProvider syncs after Firebase sign-up; redirect once authenticated.
  useEffect(() => {
    if (status === 'authenticated') navigate('/app', { replace: true });
    else if (status === 'unauthenticated') setSubmitting(false);
  }, [status, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in every field');
      return;
    }
    if (password.length < 8) {
      setError('Use a password of at least 8 characters');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signupWithEmail(email.trim(), password, name.trim(), role);
    } catch (err) {
      setError(authErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start preserving the memories that matter">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {/* Role selector — the two account types */}
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">I am a</span>
          <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROLES.map((r) => {
              const on = role === r.value;
              return (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  aria-pressed={on}
                  className={`flex flex-col gap-1 border p-4 text-left transition-colors ${
                    on ? 'border-primary bg-primary-soft' : 'border-line-strong hover:border-primary'
                  }`}
                >
                  <span className="text-sm font-bold text-ink">{r.label}</span>
                  <span className="text-[12px] font-medium text-muted">{r.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <TextField label="Full name" autoComplete="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-[13px] font-medium text-error">{error}</p>}
        <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
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
            await signupWithGoogle(role);
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
        Sign up with Google
      </Button>

      <p className="mt-6 text-sm font-medium text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
