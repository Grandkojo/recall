import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteMemory, useEnrichGraph, useGetPatientMemories } from '../../hooks/useMemories';
import { useGetPatients, useGetInviteCode, useGenerateInviteCode } from '../../hooks/usePatients';
import { usePatientStore } from '../../store/patientStore';
import { Card, FieldLabel, inputCls, ArrowLeftIcon } from './shared';

export function SettingsPage() {
  const { canManage } = useAuth();
  const { data: patients } = useGetPatients();
  const patientId = usePatientStore((s) => s.patientId);
  const setPatientId = usePatientStore((s) => s.setPatientId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-6 pb-12 md:px-6 md:pt-10 md:pb-16">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark">
        <ArrowLeftIcon /> Back to Dashboard
      </Link>

      <Card title="Active Patient" className="border-primary/30 bg-primary-soft/40">
        <div className="flex flex-col gap-2">
          <FieldLabel>Select Patient</FieldLabel>
          <select className={inputCls} value={patientId} onChange={(e) => setPatientId(Number(e.target.value))}>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Changing the active patient will update the memory graph context across the application.
          </p>
        </div>
      </Card>

      {canManage && <CaregiverToolsCard patientId={patientId} />}
      {canManage && patientId > 0 && <CareCircleCard patientId={patientId} />}
    </main>
  );
}

function CareCircleCard({ patientId }: { patientId: number }) {
  const { data, isLoading } = useGetInviteCode(patientId);
  const generate = useGenerateInviteCode();
  const [copied, setCopied] = useState(false);

  return (
    <Card title="Care Circle">
      <FieldLabel>Invite to Care Circle</FieldLabel>
      <p className="mb-4 mt-2 text-sm font-normal leading-relaxed text-muted">
        Family members and the patient themselves can join this care circle by entering this invite code when they sign up.
      </p>

      <div className="flex flex-col gap-3 border border-line-strong bg-surface p-4">
        {isLoading ? (
          <p className="animate-pulse text-sm text-muted">Loading invite code...</p>
        ) : data?.invite_code ? (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Current Invite Code</span>
            <div className="flex items-center justify-between gap-3 border border-line bg-canvas p-3">
              <code className="font-mono text-xl font-semibold tracking-[0.3em] text-primary">{data.invite_code}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(data.invite_code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex cursor-pointer items-center justify-center px-2 py-1 text-primary transition-colors hover:bg-primary-soft"
                title="Copy to clipboard"
              >
                {copied ? (
                  <span className="text-xs font-semibold text-success">Copied!</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                    <rect x="9" y="9" width="13" height="13" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">No active invite code.</p>
        )}

        <div className="mt-2 border-t border-line pt-4">
          <Button variant="secondary" size="md" className="w-full" disabled={generate.isPending} onClick={() => generate.mutate(patientId)}>
            {generate.isPending ? 'Generating...' : data?.invite_code ? 'Generate New Code' : 'Generate Invite Code'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CaregiverToolsCard({ patientId }: { patientId: number }) {
  const enrich = useEnrichGraph();
  const del = useDeleteMemory();
  const [mediaId, setMediaId] = useState('');
  const { data: memories } = useGetPatientMemories(patientId);

  return (
    <Card title="Graph Settings">
      <div className="flex flex-col gap-6">
        <div>
          <FieldLabel>Memory Graph</FieldLabel>
          <Button variant="secondary" size="md" className="mt-2 w-full" disabled={enrich.isPending} onClick={() => enrich.mutate()}>
            {enrich.isPending ? 'Enriching Graph Nodes...' : 'Enrich Memory Graph'}
          </Button>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Forces the cognitive engine to map new relationships and infer insights from recent uploads.
          </p>
          {enrich.isSuccess && <p className="mt-2 text-[13px] font-medium text-success">{enrich.data.message}</p>}
          {enrich.isError && <p className="mt-2 text-[13px] font-medium text-error">Enrichment failed</p>}
        </div>

        <div className="border-t border-line pt-5">
          <FieldLabel>Data Management</FieldLabel>
          <form
            className="mt-2 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const id = Number(mediaId);
              if (id > 0) del.mutate(id, { onSuccess: () => setMediaId('') });
            }}
          >
            <select className={`${inputCls} sm:flex-1`} value={mediaId} onChange={(e) => setMediaId(e.target.value)}>
              <option value="">Select a memory to remove...</option>
              {memories?.map((m) => {
                const statusBadge = m.status === 'processing' ? '🔄 PROCESSING' : m.status === 'failed' ? '❌ FAILED' : '✅ READY';
                return (
                  <option key={m.id} value={m.id}>
                    {statusBadge} [{m.media_type.toUpperCase()}] {m.caption ? (m.caption.length > 30 ? m.caption.substring(0, 30) + '...' : m.caption) : `Memory ID: ${m.id}`}
                  </option>
                );
              })}
            </select>
            <Button type="submit" variant="danger" size="md" disabled={del.isPending || !mediaId} className="w-full sm:w-auto">
              {del.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </form>
          {del.isSuccess && <p className="mt-2 text-[13px] font-medium text-success">{del.data.message}</p>}
          {del.isError && <p className="mt-2 text-[13px] font-medium text-error">Delete failed</p>}
        </div>
      </div>
    </Card>
  );
}
