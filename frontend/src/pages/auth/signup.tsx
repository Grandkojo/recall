import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../../features/auth/auth-shell';
import { TextField, Button } from '../../components/ui';

type Role = 'caregiver' | 'family_contributor';

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: 'caregiver', label: 'Caregiver', hint: 'I manage memories for a loved one' },
  { value: 'family_contributor', label: 'Family member', hint: 'I add photos and stories' },
];

export function SignupPage() {
  const [role, setRole] = useState<Role>('caregiver');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
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
    // TODO: connect to the auth API
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
        <Button type="submit" size="lg" className="mt-1 w-full">
          Create account
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
