import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../../features/auth/auth-shell';
import { TextField, Button } from '../../components/ui';
import { signupWithEmail, authErrorMessage } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import type { SignupRole } from '../../types';

const ROLES: { value: SignupRole; label: string; hint: string }[] = [
  { value: 'CAREGIVER', label: 'Caregiver', hint: 'I manage memories for a loved one' },
  { value: 'FAMILY_CONTRIBUTOR', label: 'Family member', hint: 'I add photos and stories' },
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
          <div className="mt-1.5 grid grid-cols-2 gap-3">
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

      <p className="mt-6 text-sm font-medium text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
