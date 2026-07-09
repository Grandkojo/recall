import { landingContent } from '../../../lib/landing-content';

interface MemoryStackAccordionProps {
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function MemoryStackAccordion({ activeIndex, onSelect }: MemoryStackAccordionProps) {
  const layers = landingContent.stack.layers;
  return (
    <ul className="border-t border-line">
      {layers.map((layer, i) => {
        const active = i === activeIndex;
        return (
          <li key={layer.index} className="border-b border-line">
            <button
              type="button"
              onClick={() => onSelect(i)}
              onMouseEnter={() => onSelect(i)}
              aria-expanded={active}
              className={`group flex w-full items-center gap-4 py-5 text-left transition-colors ${active ? '' : 'hover:bg-surface'}`}
            >
              <span className={`text-[12px] font-semibold tabular-nums tracking-[0.1em] ${active ? 'text-primary' : 'text-muted'}`}>
                {layer.index}
              </span>
              <span className={`h-2 w-2 shrink-0 transition-colors ${active ? 'bg-primary' : 'bg-line-strong'}`} />
              <span className={`flex-1 text-lg font-semibold tracking-tight transition-colors ${active ? 'text-ink' : 'text-ink-soft'}`}>
                {layer.name}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className={`shrink-0 transition-transform duration-300 ${active ? 'rotate-180 text-primary' : 'text-muted'}`}
                aria-hidden="true"
              >
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
              </svg>
            </button>
            <div className={`grid transition-all duration-300 ease-out ${active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="max-w-prose pb-5 pl-[2.25rem] text-sm font-normal text-body">{layer.blurb}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
