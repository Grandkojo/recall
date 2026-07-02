interface SectionHeadingProps {
  eyebrow: string;
  heading: string;
  subheading?: string;
}

/** Shared section header: technical eyebrow + bold heading. */
export function SectionHeading({ eyebrow, heading, subheading }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
        <span className="h-2 w-2 bg-primary" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-[clamp(1.9rem,4vw,3rem)] font-bold leading-[1.06] tracking-[-0.02em] text-ink">
        {heading}
      </h2>
      {subheading && <p className="mt-4 text-sm font-normal text-body">{subheading}</p>}
    </div>
  );
}
