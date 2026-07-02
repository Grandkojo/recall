import { useState, type FormEvent, useEffect } from 'react';
import { Button, TextField } from '../../components/ui';
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

/** Card shell — soft shadows, clean borders. */
function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line-strong bg-white/70 shadow-sm backdrop-blur-md p-6 ${className}`}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary-dark">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const inputCls =
  'h-12 w-full rounded-xl border border-line-strong bg-canvas px-4 text-[15px] font-medium text-ink outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10';

export function Dashboard() {
  const { user, role, canUpload, canManage, logout } = useAuth();
  
  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();
  const [patientId, setPatientId] = useState<number>(0);

  // Automatically select the first patient if available
  useEffect(() => {
    if (patients && patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }
  }, [patients, patientId]);

  return (
    <div className="min-h-svh bg-surface bg-gradient-to-br from-surface to-canvas pb-20">
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xl font-bold tracking-tight text-ink">Recall</p>
            <p className="text-sm font-medium text-muted">
              {user?.fullName ?? user?.email}
              {role && <span className="ml-2 text-primary">· {role.replace('_', ' ')}</span>}
            </p>
          </div>
          <Button variant="secondary" size="md" onClick={logout} className="rounded-full shadow-sm">
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {isLoadingPatients ? (
          <div className="flex justify-center py-20">
            <p className="text-muted font-medium animate-pulse">Loading dashboard...</p>
          </div>
        ) : patients && patients.length === 0 ? (
          <PatientOnboarding />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar / Configuration */}
            <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col gap-6">
              <Card title="Active Patient" className="bg-gradient-to-b from-white to-primary-soft/30 border-primary/20">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Select Patient</label>
                  <select
                    className={inputCls}
                    value={patientId}
                    onChange={(e) => setPatientId(Number(e.target.value))}
                  >
                    {patients?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>

              {canUpload && <UploadCard patientId={patientId} />}
              {canManage && <CaregiverToolsCard patientId={patientId} />}
            </div>

            {/* Main Content Area */}
            <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col gap-6">
              <ReminisceCard patientId={patientId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Patient Onboarding ──────────────────────────────────────────────────── */
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
    <div className="mx-auto max-w-lg mt-10">
      <Card title="Register your patient" className="shadow-lg border-primary/20">
        <p className="text-body mb-6">Welcome to Recall! To get started, please register the patient you are caring for.</p>
        
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label="First Name"
            placeholder="e.g. Grace"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            placeholder="e.g. Osei"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Date of Birth (Optional)</label>
            <input
              type="date"
              className={inputCls}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Diagnosis Stage (Optional)</label>
            <select
              className={inputCls}
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="">Select a stage</option>
              <option value="Early">Early Stage</option>
              <option value="Moderate">Moderate Stage</option>
              <option value="Advanced">Advanced Stage</option>
            </select>
          </div>

          {error && <p className="text-sm text-error">{error instanceof Error ? error.message : 'Registration failed'}</p>}
          
          <Button type="submit" size="lg" className="mt-4 w-full rounded-xl" disabled={isPending || !firstName.trim() || !lastName.trim()}>
            {isPending ? 'Registering...' : 'Complete Setup'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

/* ── Reminisce (query) ───────────────────────────────────────────────────── */
function ReminisceCard({ patientId }: { patientId: number }) {
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const { data, isFetching, isError, error } = useQueryMemories(patientId, q);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setQ(draft);
  };

  return (
    <Card title="Reminisce & Discover" className="min-h-[500px] flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          className={`${inputCls} shadow-sm border-primary/20`}
          placeholder="Ask about a memory... e.g., 'Who is Abena?'"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" size="lg" disabled={patientId <= 0 || !draft.trim()} className="rounded-xl px-8 shadow-md hover:shadow-lg transition-all">
          Recall
        </Button>
      </form>

      <div className="mt-6 flex-1 bg-surface/50 rounded-2xl border border-line-strong p-6 overflow-auto">
        {patientId <= 0 && !q && (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm font-medium text-muted max-w-sm">Select a patient and enter a memory prompt to explore their life graph.</p>
          </div>
        )}
        {isFetching && (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm font-medium text-primary animate-pulse">Searching the memory graph...</p>
          </div>
        )}
        {isError && (
          <p className="text-[13px] font-medium text-error">
            {error instanceof Error ? error.message : 'Search failed'}
          </p>
        )}
        {data && (
          <div className="animate-rise space-y-4">
            <pre className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft font-sans">
              {typeof data.results === 'string' ? data.results : JSON.stringify(data.results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ── Upload ──────────────────────────────────────────────────────────────── */
function UploadCard({ patientId }: { patientId: number }) {
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
      {
        onSuccess: () => {
          setCaption('');
          setFile(null);
        },
      }
    );
  };

  const disabled = isPending || patientId <= 0 || (needsFile && !file) || (!needsFile && !caption.trim());

  return (
    <Card title="Add a memory">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Media Type</label>
          <select
            className={inputCls}
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
          >
            {MEDIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Caption or Story</label>
          <textarea
            className={`${inputCls} h-auto py-3`}
            rows={4}
            placeholder={needsFile ? 'Describe this memory, who is in it, where it happened...' : 'Write the memory...'}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {needsFile && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {mediaType === 'photo' ? 'Upload Photo' : mediaType === 'voice' ? 'Upload Audio File' : mediaType === 'video' ? 'Upload Video' : 'Upload File'}
            </label>
            <div className="relative">
              <input
                type="file"
                accept={acceptAttr}
                className="w-full text-sm text-body file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2.5 file:font-semibold file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        )}

        <Button type="submit" size="lg" disabled={disabled} className="rounded-xl mt-2">
          {isPending ? 'Uploading & Processing...' : 'Save memory to graph'}
        </Button>

        {patientId <= 0 && (
          <p className="text-[13px] font-medium text-muted">Select a patient above to upload.</p>
        )}
        {isSuccess && data && (
          <div className="mt-2 rounded-lg bg-green-50 p-3 text-[13px] font-medium text-green-700 animate-rise">
            Memory #{data.media_id} saved! It is currently being processed by Cognee in the background.
          </div>
        )}
        {isError && (
          <p className="text-[13px] font-medium text-error">
            {error instanceof Error ? error.message : 'Upload failed'}
          </p>
        )}
      </form>
    </Card>
  );
}

/* ── Caregiver-only tools (enrich + delete) ──────────────────────────────── */
function CaregiverToolsCard({ patientId }: { patientId: number }) {
  const enrich = useEnrichGraph();
  const del = useDeleteMemory();
  const [mediaId, setMediaId] = useState('');
  const { data: memories } = useGetPatientMemories(patientId);

  return (
    <Card title="Graph Settings">
      <div className="flex flex-col gap-6">
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft block mb-2">Memory Graph</label>
          <Button variant="secondary" size="md" className="w-full rounded-xl" disabled={enrich.isPending} onClick={() => enrich.mutate()}>
            {enrich.isPending ? 'Enriching Graph Nodes...' : 'Enrich Memory Graph'}
          </Button>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Forces the cognitive engine to map new relationships and infer insights from recent uploads.
          </p>
          {enrich.isSuccess && (
            <p className="mt-2 text-[13px] font-medium text-green-600">{enrich.data.message}</p>
          )}
          {enrich.isError && <p className="mt-2 text-[13px] font-medium text-error">Enrichment failed</p>}
        </div>

        <div className="border-t border-line pt-5">
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft block mb-2">Data Management</label>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const id = Number(mediaId);
              if (id > 0) del.mutate(id, { onSuccess: () => setMediaId('') });
            }}
          >
            <div className="flex-1">
              <select
                className={`${inputCls} h-10 text-sm rounded-lg`}
                value={mediaId}
                onChange={(e) => setMediaId(e.target.value)}
              >
                <option value="">Select a memory to remove...</option>
                {memories?.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.media_type.toUpperCase()}] {m.caption ? (m.caption.length > 30 ? m.caption.substring(0, 30) + '...' : m.caption) : `Memory ID: ${m.id}`}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="md" disabled={del.isPending || !mediaId} className="rounded-lg h-10 px-5">
              {del.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </form>
          {del.isSuccess && <p className="mt-2 text-[13px] font-medium text-green-600">{del.data.message}</p>}
          {del.isError && <p className="mt-2 text-[13px] font-medium text-error">Delete failed</p>}
        </div>
      </div>
    </Card>
  );
}
