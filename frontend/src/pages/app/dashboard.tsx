import { useState, type FormEvent } from 'react';
import { Button, TextField } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import {
  useDeleteMemory,
  useEnrichGraph,
  useQueryMemories,
  useUploadMemory,
} from '../../hooks/useMemories';
import { MEDIA_TYPES } from '../../services/memories';
import type { MediaType } from '../../types';

/** Card shell — sharp corners, mobile-first padding. */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-canvas p-5 sm:p-6">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-soft">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const inputCls =
  'h-12 w-full border border-line-strong bg-canvas px-4 text-[15px] font-medium text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

export function Dashboard() {
  const { user, role, canUpload, canManage, logout } = useAuth();

  // No patient-list endpoint exists yet, so the active patient is entered by id.
  // Replace with a real patient picker once GET /api/patients ships.
  const [patientId, setPatientId] = useState('');
  const pid = Number(patientId) || 0;

  return (
    <div className="min-h-svh bg-surface">
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink">Recall</p>
            <p className="text-[13px] font-medium text-muted">
              {user?.fullName ?? user?.email}
              {role && <span className="ml-2 text-primary">· {role.replace('_', ' ')}</span>}
            </p>
          </div>
          <Button variant="secondary" size="md" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        <Card title="Active patient">
          <TextField
            label="Patient ID"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <p className="mt-2 text-[13px] font-medium text-muted">
            Interim field — a patient picker replaces this once the backend exposes a patients list.
          </p>
        </Card>

        <ReminisceCard patientId={pid} />
        {canUpload && <UploadCard patientId={pid} />}
        {canManage && <CaregiverToolsCard />}
      </main>
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
    <Card title="Reminisce">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          className={inputCls}
          placeholder="Ask about a memory…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" size="lg" disabled={patientId <= 0 || !draft.trim()}>
          Search
        </Button>
      </form>

      {patientId <= 0 && (
        <p className="mt-3 text-[13px] font-medium text-muted">Enter a patient ID above to search.</p>
      )}
      {isFetching && <p className="mt-3 text-[13px] font-medium text-muted">Searching the memory graph…</p>}
      {isError && (
        <p className="mt-3 text-[13px] font-medium text-error">
          {error instanceof Error ? error.message : 'Search failed'}
        </p>
      )}
      {data && (
        <pre className="mt-3 max-h-72 overflow-auto border border-line bg-surface p-3 text-[12px] leading-relaxed text-ink-soft">
          {JSON.stringify(data.results, null, 2)}
        </pre>
      )}
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
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Type</label>
          <select
            className={inputCls}
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
          >
            {MEDIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Caption</label>
          <textarea
            className={`${inputCls} h-auto py-3`}
            rows={3}
            placeholder={needsFile ? 'Describe this memory…' : 'Write the memory…'}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {needsFile && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">File</label>
            <input
              type="file"
              className="text-[13px] font-medium text-body file:mr-3 file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-ink hover:file:bg-ink hover:file:text-white"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        <Button type="submit" size="lg" disabled={disabled}>
          {isPending ? 'Uploading…' : 'Save memory'}
        </Button>

        {patientId <= 0 && (
          <p className="text-[13px] font-medium text-muted">Enter a patient ID above to upload.</p>
        )}
        {isSuccess && data && (
          <p className="text-[13px] font-medium text-primary">
            Memory #{data.media_id} saved — processing in the background.
          </p>
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
function CaregiverToolsCard() {
  const enrich = useEnrichGraph();
  const del = useDeleteMemory();
  const [mediaId, setMediaId] = useState('');

  return (
    <Card title="Caregiver tools">
      <div className="flex flex-col gap-5">
        <div>
          <Button variant="secondary" size="lg" disabled={enrich.isPending} onClick={() => enrich.mutate()}>
            {enrich.isPending ? 'Enriching…' : 'Enrich memory graph'}
          </Button>
          {enrich.isSuccess && (
            <p className="mt-2 text-[13px] font-medium text-primary">{enrich.data.message}</p>
          )}
          {enrich.isError && <p className="mt-2 text-[13px] font-medium text-error">Enrichment failed</p>}
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const id = Number(mediaId);
            if (id > 0) del.mutate(id, { onSuccess: () => setMediaId('') });
          }}
        >
          <div className="flex-1">
            <TextField
              label="Delete memory by ID"
              type="number"
              inputMode="numeric"
              placeholder="Media ID"
              value={mediaId}
              onChange={(e) => setMediaId(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" disabled={del.isPending || !mediaId}>
            {del.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </form>
        {del.isSuccess && <p className="text-[13px] font-medium text-primary">{del.data.message}</p>}
        {del.isError && <p className="text-[13px] font-medium text-error">Delete failed</p>}
      </div>
    </Card>
  );
}
