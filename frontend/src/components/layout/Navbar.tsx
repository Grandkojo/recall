import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container } from './Container';
import { RecallMark } from './recall-mark';
import { btnCls } from '../ui';

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For families', href: '#for-families' },
  { label: 'About', href: '#about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 h-16 bg-canvas transition-shadow duration-200',
        scrolled ? 'border-b border-line shadow-[0_1px_0_rgba(10,22,38,0.04)]' : 'border-b border-transparent',
      ].join(' ')}
    >
      <Container className="flex h-full items-center justify-between">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <RecallMark />
          <span className="text-[19px] font-semibold tracking-tight text-ink">Recall</span>
        </Link>

        {/* Desktop nav */}
        {isLanding && (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {/* CTA cluster */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-ink-soft transition-colors hover:text-primary">
            Sign in
          </Link>
          <Link to="/signup" className={btnCls('primary', 'md')}>
            Get started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="-mr-1 p-2 text-ink md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
            {menuOpen ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 7h16M3 11h16M3 15h16" />}
          </svg>
        </button>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-b border-line bg-canvas md:hidden">
          <Container>
            <div className="flex flex-col py-2">
              {isLanding &&
                NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-line py-3.5 text-sm font-medium text-ink-soft"
                  >
                    {label}
                  </a>
                ))}
              <div className="flex flex-col gap-3 py-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-ink-soft"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className={btnCls('primary', 'md', 'w-full')}
                >
                  Get started
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
