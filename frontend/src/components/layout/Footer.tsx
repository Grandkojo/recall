import { Link } from 'react-router-dom';
import { Container } from './Container';
import { RecallMark } from './recall-mark';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'For families', href: '#for-families' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Cognee', href: 'https://www.cognee.ai' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <RecallMark />
              <span className="text-xl font-semibold tracking-tight text-ink">Recall</span>
            </Link>
            <p className="mt-4 max-w-[30ch] text-sm font-medium text-muted">
              A living memory for the people you love, built on Cognee
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
            © 2026 Recall, made for the WeMakeDevs × Cognee Hackathon
          </p>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
            Not a medical device
          </p>
        </div>
      </Container>
    </footer>
  );
}
