import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-canvas px-6 pt-16 text-center">
      <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Sign in</span>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Welcome back</h1>
      <p className="max-w-sm font-medium text-muted">The caregiver sign-in flow is coming next</p>
      <Link to="/" className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark">
        ← Back to home
      </Link>
    </div>
  );
}
