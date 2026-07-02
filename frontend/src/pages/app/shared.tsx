export function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line-strong bg-white/70 shadow-sm backdrop-blur-md p-6 ${className}`}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary-dark">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export const inputCls =
  'h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[15px] font-medium text-ink outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10';
