import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../../features/auth/auth-shell';
import { Button } from '../../components/ui';
import { syncUser } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import type { SignupRole } from '../../types';

const ROLES: { value: SignupRole; label: string; hint: string }[] = [
  { value: 'CAREGIVER', label: 'Caregiver', hint: 'I manage memories for a loved one' },
  { value: 'FAMILY_CONTRIBUTOR', label: 'Family member', hint: 'I add photos and stories' },
  { value: 'PATIENT', label: 'I am the patient', hint: 'I want to look back on my memories' },
];

export function ChooseRolePage() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  const [role, setRole] = useState<SignupRole>('CAREGIVER');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If not in needs_role state, redirect appropriately
    if (status === 'authenticated') navigate('/app', { replace: true });
    else if (status === 'unauthenticated') navigate('/login', { replace: true });
  }, [status, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await syncUser({ role });
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    import('../../services/auth').then((m) => m.logout().then(() => clear()));
  };

  return (
    <AuthShell title="Welcome to Recall" subtitle="How will you be using the app?">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
                  <span className="text-sm font-semibold text-ink">{r.label}</span>
                  <span className="text-[12px] font-medium text-muted">{r.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-[13px] font-medium text-error">{error}</p>}
        
        <div className="flex flex-col gap-3 mt-4">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Completing setup…' : 'Continue'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={onCancel} disabled={submitting}>
            Cancel Sign In
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
