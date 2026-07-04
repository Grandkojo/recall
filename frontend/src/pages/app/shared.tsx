import type { ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
   Shared /app primitives — the design-system foundation every app page builds
   on. Sharp corners, flat bordered surfaces, engineered eyebrow titles.
   ──────────────────────────────────────────────────────────────────────────── */

/** Engineered card — flat, sharp, bordered, with an eyebrow-style title. */
export function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-canvas p-5 md:p-6 ${className}`}>
      {title && (
        <h2 className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          <span className="h-2 w-2 shrink-0 bg-primary" aria-hidden="true" />
          {title}
        </h2>
      )}
      <div className={title ? 'mt-5' : ''}>{children}</div>
    </section>
  );
}

/** Sharp uppercase label above native inputs / selects. */
export function FieldLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <label className={`text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft ${className}`}>
      {children}
    </label>
  );
}

/** Sharp-cornered field style — mirrors the TextField primitive (no rounding). */
export const inputCls =
  'h-12 w-full border border-line-strong bg-canvas px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

/* ── Icons (house stroke style: square caps, ~1.8 weight) ─────────────────── */
const svgBase = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
};

export function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" className={className} {...svgBase}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" className={className} {...svgBase}>
      <path d="M20 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" className={className} {...svgBase}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" className={className} {...svgBase}>
      <path d="M4 8h8M16 8h4M4 16h4M12 16h8" />
      <circle cx="14" cy="8" r="2" />
      <circle cx="10" cy="16" r="2" />
    </svg>
  );
}

export function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" className={className} {...svgBase}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}

export function UsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" className={className} {...svgBase}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.4a3 3 0 0 1 0 5.7M21.5 20c0-2.6-1.6-4.8-3.8-5.6" />
    </svg>
  );
}

export function SlideshowIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" className={className} {...svgBase}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M10 9.5l4.5 2.5L10 14.5z" />
    </svg>
  );
}

/** Parses [MEDIA_URL: ... MEDIA_TYPE: ...] tags out of AI responses and renders media inline. */
export function RichTextResponse({ text }: { text: string }) {
  if (!text) return null;
  
  const regex = /\[MEDIA_URL:\s*(.+?)\s*MEDIA_TYPE:\s*(photo|video)\]/g;
  const matches = [...text.matchAll(regex)];
  const cleanText = text.replace(regex, '').trim();

  return (
    <div className="flex flex-col gap-4">
      <p>{cleanText}</p>
      {matches.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-4">
          {matches.map((match, i) => {
            const url = match[1];
            const type = match[2];
            if (type === 'photo') {
              return <img key={i} src={url} alt="Memory" className="max-h-80 max-w-full rounded border border-line-strong object-contain shadow-sm" />;
            }
            if (type === 'video') {
              return <video key={i} src={url} controls className="max-h-80 max-w-full rounded border border-line-strong object-contain shadow-sm" />;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
