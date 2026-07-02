import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { Button, TextField } from '../../components/ui';
import { RecallMark } from '../../components/layout/recall-mark';
import { useAuth } from '../../hooks/useAuth';
import {
  useDeleteMemory,
  useEnrichGraph,
  useQueryMemories,
  useUploadMemory,
  useGetPatientMemories,
} from '../../hooks/useMemories';
import { useGetPatients, useCreatePatient } from '../../hooks/usePatients';
import { MEDIA_TYPES } from '../../services/memories';
import type { MediaType } from '../../types';

/* ────────────────────────────────────────────────────────────────────────────
   Recall app shell — mobile-first. One focused view at a time, driven by a
   bottom tab bar on phones that becomes a left rail on desktop. The active
   patient is persistent context in the header. Sharp, flat, engineered — same
   design language as the landing.
   ──────────────────────────────────────────────────────────────────────────── */

/** Sharp-cornered field style — mirrors the TextField primitive (no rounding). */
const fieldCls =
  'h-12 w-full border border-line-strong bg-canvas px-4 text-[15px] font-medium text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

type ViewKey = 'reminisce' | 'add' | 'manage';

interface NavItem {
  key: ViewKey;
  label: string;
  icon: ReactNode;
}

/* ── Inline stroke icons (house style: 1.7 stroke, square caps) ───────────── */
const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
};

const SearchIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </svg>
);
const PlusIcon = () => (
  <svg {...iconProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SlidersIcon = () => (
  <svg {...iconProps}>
    <path d="M4 8h8M16 8h4M4 16h4M12 16h8" />
    <circle cx="14" cy="8" r="2" />
    <circle cx="10" cy="16" r="2" />
  </svg>
);
const LogoutIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="square" aria-hidden="true">
    <path d="M15 4h4v16h-4" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </svg>
);
const ChevronIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="square" aria-hidden="true">
    <path d="M3 6l5 5 5-5" />
  </svg>
);

/* ── Shared primitives ───────────────────────────────────────────────────── */

/** Engineered card — flat, sharp, bordered. */
function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`border border-line bg-canvas p-5 md:p-6 ${className}`}>{children}</section>;
}

/** Sharp uppercase label above native selects / inputs. */
function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{children}</label>
  );
}

/** Per-view header: technical eyebrow + bold title. */
function ViewHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">
        <span className="h-2 w-2 bg-primary" aria-hidden="true" />
        {eyebrow}
      </span>
      <h1 className="mt-3 text-[clamp(1.55rem,5vw,2.05rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm font-normal text-body">{subtitle}</p>}
    </div>
  );
}

/* ── Dashboard shell ─────────────────────────────────────────────────────── */
export function Dashboard() {
  const { user, role, canUpload, canManage, logout } = useAuth();
  const { data: patients, isLoading } = useGetPatients();
  const [patientId, setPatientId] = useState<number>(0);
  const [view, setView] = useState<ViewKey>('reminisce');

  useEffect(() => {
    if (patients && patients.length > 0 && !patientId) setPatientId(patients[0].id);
  }, [patients, patientId]);

  const navItems: NavItem[] = [
    { key: 'reminisce', label: 'Reminisce', icon: <SearchIcon /> },
    ...(canUpload ? [{ key: 'add' as const, label: 'Add', icon: <PlusIcon /> }] : []),
    ...(canManage ? [{ key: 'manage' as const, label: 'Manage', icon: <SlidersIcon /> }] : []),
  ];
  const allowed = new Set(navItems.map((n) => n.key));
  const activeView: ViewKey = allowed.has(view) ? view : 'reminisce';

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  const noPatients = !!patients && patients.length === 0;

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      {/* Top bar: brand · patient context · account */}
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-2.5 px-4 py-2.5 md:gap-3 md:px-8 md:py-3">
          <RecallMark />
          <span className="hidden text-[17px] font-bold tracking-tight text-ink sm:block">Recall</span>

          {!noPatients && patients && (
            <>
              <span className="mx-1 hidden h-5 w-px bg-line-strong sm:block" aria-hidden="true" />
              <PatientSwitcher patients={patients} patientId={patientId} onChange={setPatientId} />
            </>
          )}

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden max-w-[180px] text-right leading-tight md:block">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.fullName ?? user?.email}</p>
              {role && (
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                  {role.replace('_', ' ')}
                </p>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogoutIcon />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {noPatients ? (
        <main className="flex-1 px-4 py-8 md:px-8">
          <PatientOnboarding />
        </main>
      ) : (
        <div className="mx-auto flex w-full max-w-[1200px] flex-1">
          {/* Desktop rail */}
          <aside className="hidden shrink-0 flex-col gap-1 border-r border-line p-4 lg:flex lg:w-56">
            {navItems.map((item) => {
              const on = item.key === activeView;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  aria-current={on ? 'page' : undefined}
                  className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                    on
                      ? 'border-primary bg-primary-soft/60 text-primary-dark'
                      : 'border-transparent text-body hover:bg-surface hover:text-ink'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* Active view */}
          <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-8 md:pt-10 lg:pb-12">
            {activeView === 'reminisce' && <ReminisceView patientId={patientId} />}
            {activeView === 'add' && canUpload && <AddView patientId={patientId} />}
            {activeView === 'manage' && canManage && <ManageView patientId={patientId} />}
          </main>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      {!noPatients && (
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Primary"
        >
          <div className="mx-auto flex max-w-[1200px]">
            {navItems.map((item) => {
              const on = item.key === activeView;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  aria-current={on ? 'page' : undefined}
                  className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                    on ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {on && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden="true" />}
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

/* ── Patient switcher (header context) ───────────────────────────────────── */
function PatientSwitcher({
  patients,
  patientId,
  onChange,
}: {
  patients: { id: number; first_name: string; last_name: string }[];
  patientId: number;
  onChange: (id: number) => void;
}) {
  return (
    <div className="relative min-w-0 max-w-[240px] flex-1 sm:flex-none">
      <select
        aria-label="Active patient"
        value={patientId}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-full appearance-none border border-line-strong bg-canvas pl-3 pr-8 text-sm font-semibold text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.first_name} {p.last_name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted">
        <ChevronIcon />
      </span>
    </div>
  );
}

/* ── Onboarding ──────────────────────────────────────────────────────────── */
function PatientOnboarding() {
  const { mutate, isPending, error } = useCreatePatient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [stage, setStage] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dob || undefined,
      diagnosis_stage: stage || undefined,
    });
  };

  return (
    <div className="mx-auto mt-4 max-w-lg md:mt-12">
      <ViewHeader
        eyebrow="Get started"
        title="Register your patient"
        subtitle="Welcome to Recall — set up the person you are caring for to begin"
      />
      <Card className="border-primary/30">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField label="First Name" placeholder="e.g. Grace" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last Name" placeholder="e.g. Osei" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Date of Birth (Optional)</FieldLabel>
            <input type="date" className={fieldCls} value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Diagnosis Stage (Optional)</FieldLabel>
            <select className={fieldCls} value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">Select a stage</option>
              <option value="Early">Early Stage</option>
              <option value="Moderate">Moderate Stage</option>
              <option value="Advanced">Advanced Stage</option>
            </select>
          </div>

          {error && (
            <p className="text-[13px] font-medium text-error">
              {error instanceof Error ? error.message : 'Registration failed'}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending || !firstName.trim() || !lastName.trim()}>
            {isPending ? 'Registering...' : 'Complete Setup'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

/* ── Reminisce view (primary) ────────────────────────────────────────────── */
const EXAMPLE_PROMPTS = ['Tell me about their family', 'A happy memory from long ago', 'What did they do for a living?'];

function ReminisceView({ patientId }: { patientId: number }) {
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const { data, isFetching, isError, error } = useQueryMemories(patientId, q);

  const run = (text: string) => {
    setDraft(text);
    setQ(text);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ViewHeader
        eyebrow="Reminisce"
        title="Explore their memory graph"
        subtitle="Ask a question and Recall surfaces the moment, in their own story"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          className={`${fieldCls} sm:flex-1`}
          placeholder="Ask about a memory..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" size="lg" disabled={patientId <= 0 || !draft.trim()} className="w-full sm:w-auto sm:px-8">
          Recall
        </Button>
      </form>

      <div className="mt-6 min-h-[320px] border border-line-strong bg-canvas p-5 md:p-6">
        {patientId <= 0 && !q && (
          <p className="text-sm font-normal text-muted">Select a patient to explore their life graph.</p>
        )}
        {patientId > 0 && !q && !isFetching && (
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Try asking</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => run(ex)}
                  className="border border-line-strong bg-canvas px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {isFetching && (
          <div className="flex min-h-[260px] items-center justify-center text-center">
            <p className="animate-pulse text-sm font-medium text-primary">Searching the memory graph...</p>
          </div>
        )}
        {isError && (
          <p className="text-[13px] font-medium text-error">{error instanceof Error ? error.message : 'Search failed'}</p>
        )}
        {data && !isFetching && (
          <pre className="animate-rise whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-ink-soft">
            {typeof data.results === 'string' ? data.results : JSON.stringify(data.results, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ── Add view (upload) ───────────────────────────────────────────────────── */
function AddView({ patientId }: { patientId: number }) {
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { mutate, isPending, isSuccess, isError, error, data } = useUploadMemory();

  const needsFile = mediaType !== 'text';
  let acceptAttr = '*/*';
  if (mediaType === 'photo') acceptAttr = 'image/*';
  else if (mediaType === 'voice') acceptAttr = 'audio/*';
  else if (mediaType === 'video') acceptAttr = 'video/*';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate(
      { patientId, mediaType, caption: caption || undefined, file },
      { onSuccess: () => { setCaption(''); setFile(null); } }
    );
  };

  const disabled = isPending || patientId <= 0 || (needsFile && !file) || (!needsFile && !caption.trim());

  return (
    <div className="mx-auto w-full max-w-xl">
      <ViewHeader eyebrow="Add" title="Add a memory" subtitle="Contribute a photo, voice note or story to the graph" />
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Media Type</FieldLabel>
            <select className={fieldCls} value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)}>
              {MEDIA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Caption or Story</FieldLabel>
            <textarea
              className={`${fieldCls} h-auto py-3`}
              rows={4}
              placeholder={needsFile ? 'Describe this memory, who is in it, where it happened...' : 'Write the memory...'}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {needsFile && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>
                {mediaType === 'photo' ? 'Upload Photo' : mediaType === 'voice' ? 'Upload Audio File' : mediaType === 'video' ? 'Upload Video' : 'Upload File'}
              </FieldLabel>
              <input
                type="file"
                accept={acceptAttr}
                className="w-full cursor-pointer text-sm text-body transition-colors file:mr-4 file:border-0 file:bg-primary-soft file:px-4 file:py-2.5 file:font-semibold file:text-primary hover:file:bg-primary/20"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <Button type="submit" size="lg" disabled={disabled} className="mt-2 w-full">
            {isPending ? 'Uploading & Processing...' : 'Save memory to graph'}
          </Button>

          {patientId <= 0 && <p className="text-[13px] font-medium text-muted">Select a patient above to upload.</p>}
          {isSuccess && data && (
            <p className="animate-rise mt-1 border border-success/40 bg-success-soft px-3 py-2.5 text-[13px] font-medium text-success">
              Memory #{data.media_id} saved! It is currently being processed by Cognee in the background.
            </p>
          )}
          {isError && (
            <p className="text-[13px] font-medium text-error">{error instanceof Error ? error.message : 'Upload failed'}</p>
          )}
        </form>
      </Card>
    </div>
  );
}

/* ── Manage view (caregiver: enrich + delete) ────────────────────────────── */
function ManageView({ patientId }: { patientId: number }) {
  const enrich = useEnrichGraph();
  const del = useDeleteMemory();
  const [mediaId, setMediaId] = useState('');
  const { data: memories } = useGetPatientMemories(patientId);

  return (
    <div className="mx-auto w-full max-w-xl">
      <ViewHeader eyebrow="Manage" title="Memory graph settings" subtitle="Tune the graph and manage stored memories" />
      <div className="flex flex-col gap-6">
        <Card>
          <FieldLabel>Memory Graph</FieldLabel>
          <Button
            variant="secondary"
            size="md"
            className="mt-2 w-full"
            disabled={enrich.isPending}
            onClick={() => enrich.mutate()}
          >
            {enrich.isPending ? 'Enriching Graph Nodes...' : 'Enrich Memory Graph'}
          </Button>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Forces the cognitive engine to map new relationships and infer insights from recent uploads.
          </p>
          {enrich.isSuccess && <p className="mt-2 text-[13px] font-medium text-success">{enrich.data.message}</p>}
          {enrich.isError && <p className="mt-2 text-[13px] font-medium text-error">Enrichment failed</p>}
        </Card>

        <Card>
          <FieldLabel>Data Management</FieldLabel>
          <form
            className="mt-2 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const id = Number(mediaId);
              if (id > 0) del.mutate(id, { onSuccess: () => setMediaId('') });
            }}
          >
            <select className={`${fieldCls} sm:flex-1`} value={mediaId} onChange={(e) => setMediaId(e.target.value)}>
              <option value="">Select a memory to remove...</option>
              {memories?.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.media_type.toUpperCase()}] {m.caption ? (m.caption.length > 30 ? m.caption.substring(0, 30) + '...' : m.caption) : `Memory ID: ${m.id}`}
                </option>
              ))}
            </select>
            <Button type="submit" variant="danger" size="md" disabled={del.isPending || !mediaId} className="w-full sm:w-auto">
              {del.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </form>
          {del.isSuccess && <p className="mt-2 text-[13px] font-medium text-success">{del.data.message}</p>}
          {del.isError && <p className="mt-2 text-[13px] font-medium text-error">Delete failed</p>}
        </Card>
      </div>
    </div>
  );
}
