import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui';
import { useQueryMemories } from '../../hooks/useMemories';
import { usePatientPhotos } from '../../features/showcase/use-patient-photos';
import { MemorySlideshow } from '../../features/showcase/memory-slideshow';
import type { Patient } from '../../types';

/** PatientHome: calm large-type screen with a greeting, memory reel, and one ask box. */
export function PatientHome({ patient, patientId }: { patient: Patient; patientId: number }) {
  const { slides } = usePatientPhotos(patientId);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-7 px-4 pt-8 pb-16 md:px-6 md:pt-12">
      <header className="text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">Your memories</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Hello{patient.first_name ? `, ${patient.first_name}` : ''}
        </h1>
        <p className="mt-2 text-base font-normal text-body md:text-lg">
          Let’s look back on some happy moments together.
        </p>
      </header>

      <MemorySlideshow slides={slides} autoPlayMs={7000} className="aspect-[16/10] w-full md:aspect-[16/9]" />

      <PatientReminisce patientId={patientId} />
    </main>
  );
}

/* ── A gentle, large-type way to ask about a memory ──────────────────────── */
function PatientReminisce({ patientId }: { patientId: number }) {
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const { data, isFetching, isError } = useQueryMemories(patientId, q);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setQ(draft);
  };

  return (
    <section className="border border-line bg-canvas p-6 md:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">Ask about a memory</h2>
      <p className="mt-1.5 text-base font-normal text-body">
        Type a name or a place, and we’ll help you remember.
      </p>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="h-14 w-full border border-line-strong bg-canvas px-5 text-lg font-medium text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 sm:flex-1"
          placeholder="Who is Abena?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" size="lg" disabled={!draft.trim()} className="h-14 text-base sm:px-10">
          Remember
        </Button>
      </form>

      {(isFetching || isError || data) && (
        <div className="mt-6 min-h-[140px] border border-line-strong bg-surface p-6">
          {isFetching && <p className="animate-pulse text-lg font-medium text-primary">Looking through your memories…</p>}
          {isError && (
            <p className="text-base font-medium text-error">
              Something went wrong. Please try again in a moment.
            </p>
          )}
          {data && !isFetching && (
            <p className="animate-rise whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">
              {typeof data.results === 'string' ? data.results : JSON.stringify(data.results, null, 2)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
