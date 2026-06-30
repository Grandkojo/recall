import { Link } from 'react-router-dom';

export function SignupPage(): JSX.Element {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-canvas px-6 pt-16 text-center">
      <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">Get started</span>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Create your free account</h1>
      <p className="max-w-sm font-medium text-muted">The sign-up flow is coming next</p>
      <Link to="/" className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark">
        ← Back to home
      </Link>
    </div>
  );
}
