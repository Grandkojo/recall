import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../../features/auth/auth-shell';
import { TextField, Button } from '../../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password');
      return;
    }
    setError(null);
    // TODO: connect to the auth API
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
        <Button type="submit" size="lg" className="mt-1 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-sm font-medium text-muted">
        New to Recall?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
