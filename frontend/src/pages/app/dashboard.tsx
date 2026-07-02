import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useQueryMemories } from '../../hooks/useMemories';
import { useGetPatients, useCreatePatient } from '../../hooks/usePatients';
import { usePatientStore } from '../../store/patientStore';
import { Card, inputCls } from './shared';
import reminisceImg from '../../assets/memories/reminisce-empty-state.png';
import waitingImg from '../../assets/memories/Soothing Minimalist Abstract Background (1).png';

export function Dashboard() {
  const { role, canUpload, canManage } = useAuth();
  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();
  const patientId = usePatientStore((s) => s.patientId);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-10 pb-20 flex flex-col">
      {isLoadingPatients ? (
        <div className="flex justify-center py-20">
          <p className="text-muted font-medium animate-pulse">Loading dashboard...</p>
        </div>
      ) : patients && patients.length === 0 ? (
        role === 'CAREGIVER' ? (
          <PatientOnboarding />
        ) : (
          <div className="flex-1 flex justify-center py-10 text-center flex-col items-center gap-4">
            <JoinCareCircle />
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area: Reminisce Search */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <ReminisceCard patientId={patientId} />
          </div>

          {/* Sidebar / Configuration CTAs */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {canUpload && (
              <Link to="/app/add-memory" className="group">
                <div className="rounded-2xl border border-line-strong bg-white/70 shadow-sm backdrop-blur-md p-5 flex items-center justify-between transition-all hover:bg-primary-soft/40 hover:border-primary/40">
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">Add a Memory</span>
                    <span className="text-sm text-muted">Upload photos, videos, or stories</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    &rarr;
                  </div>
                </div>
              </Link>
            )}

            <Link to="/app/settings" className="group">
              <div className="rounded-2xl border border-line-strong bg-white/70 shadow-sm backdrop-blur-md p-5 flex items-center justify-between transition-all hover:bg-primary-soft/40 hover:border-primary/40">
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">Dashboard Settings</span>
                  <span className="text-sm text-muted">Switch active patient{canManage ? ' or manage graph' : ''}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  &rarr;
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </main>
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
          <div className="flex h-full flex-col items-center justify-center text-center">
            <img src={reminisceImg} alt="Memories" className="mb-4 h-48 w-48 object-cover rounded-full opacity-90 shadow-sm" />
            <p className="text-sm font-medium text-muted max-w-sm">Select a patient in Settings, then enter a memory prompt to explore their life graph.</p>
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

import { useJoinCareCircle } from '../../hooks/usePatients';

function JoinCareCircle() {
  const [code, setCode] = useState('');
  const join = useJoinCareCircle();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      join.mutate(code.trim().toUpperCase());
    }
  };

  return (
    <div className="mx-auto max-w-lg mt-0">
      <img src={waitingImg} alt="Waiting for invitation" className="w-64 h-auto object-contain mx-auto mix-blend-multiply mb-4" />
      <h2 className="text-xl font-semibold text-ink mb-2">Join a Care Circle</h2>
      <p className="text-muted max-w-sm mx-auto mb-6">
        You are registered as a Family Contributor. Please ask your Primary Caregiver for an invite code.
      </p>

      <Card title="Enter Invite Code" className="shadow-md border-primary/20 text-center">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">6-Digit Code</label>
            <input
              className={`${inputCls} font-mono tracking-widest text-lg uppercase text-center`}
              placeholder="e.g. A7X9K2"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          
          {join.isError && (
            <p className="text-sm font-medium text-error p-2 bg-error-soft/30 rounded-lg">
              {(join.error as any).response?.data?.detail || 'The invite code you entered is invalid or has expired.'}
            </p>
          )}

          <Button type="submit" size="lg" disabled={join.isPending || code.length !== 6} className="w-full rounded-xl">
            {join.isPending ? 'Joining...' : 'Join Care Circle'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
