import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteMemory, useEnrichGraph, useGetPatientMemories } from '../../hooks/useMemories';
import { useGetPatients } from '../../hooks/usePatients';
import { usePatientStore } from '../../store/patientStore';
import { Card, inputCls } from './shared';

export function SettingsPage() {
  const { canManage } = useAuth();
  const { data: patients } = useGetPatients();
  const patientId = usePatientStore((s) => s.patientId);
  const setPatientId = usePatientStore((s) => s.setPatientId);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 pt-10 pb-20 flex flex-col gap-6">
      <Link to="/app" className="text-sm font-semibold text-primary hover:underline">
        &larr; Back to Dashboard
      </Link>
      
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
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Changing the active patient will update the memory graph context across the application.
          </p>
        </div>
      </Card>

      {canManage && <CaregiverToolsCard patientId={patientId} />}
      {canManage && patientId > 0 && <CareCircleCard patientId={patientId} />}
    </main>
  );
}

import { useGetInviteCode, useGenerateInviteCode } from '../../hooks/usePatients';

function CareCircleCard({ patientId }: { patientId: number }) {
  const { data, isLoading } = useGetInviteCode(patientId);
  const generate = useGenerateInviteCode();

  return (
    <Card title="Care Circle" className="border-primary/20">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft block mb-2">Invite Contributors</label>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            Family members can join this patient's care circle by entering an invite code when they sign up.
          </p>
          
          <div className="flex flex-col gap-3 p-4 bg-canvas rounded-xl border border-line-strong">
            {isLoading ? (
              <p className="text-sm text-muted animate-pulse">Loading invite code...</p>
            ) : data?.invite_code ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Current Invite Code</span>
                <div className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-line justify-between">
                  <code className="text-xl font-mono font-bold text-primary tracking-widest">{data.invite_code}</code>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(data.invite_code);
                      const btn = document.getElementById('copy-btn');
                      if (btn) {
                        const original = btn.innerHTML;
                        btn.innerHTML = '<span class="text-green-600 font-medium text-xs">Copied!</span>';
                        setTimeout(() => btn.innerHTML = original, 2000);
                      }
                    }}
                    id="copy-btn"
                    className="flex items-center justify-center p-2 rounded-md hover:bg-primary-soft text-primary transition-colors cursor-pointer"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">No active invite code.</p>
            )}
            
            <div className="mt-4 border-t border-line pt-4">
              <Button 
                variant="secondary" 
                size="md" 
                className="w-full py-2.5 text-sm" 
                disabled={generate.isPending}
                onClick={() => generate.mutate(patientId)}
              >
                {generate.isPending ? 'Generating...' : (data?.invite_code ? 'Generate New Code' : 'Generate Invite Code')}
              </Button>
            </div>
          </div>
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
