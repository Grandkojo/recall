import { Link } from 'react-router-dom';
import { btnCls } from '../components/ui';

export function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <p className="text-7xl font-bold tracking-tight text-ink md:text-8xl">404</p>
      <h1 className="text-xl font-bold text-ink-soft">This page wandered off</h1>
      <Link to="/" className={btnCls('primary', 'lg')}>
        Back to home
      </Link>
    </div>
  );
}
