import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useQueryMemories } from '../../hooks/useMemories';
import { useGetPatients, useCreatePatient, useJoinCareCircle } from '../../hooks/usePatients';
import { usePatientStore } from '../../store/patientStore';
import { Card, FieldLabel, inputCls, PlusIcon, SettingsIcon, SlideshowIcon, ArrowRightIcon } from './shared';
import { PatientHome } from './patient-home';
import reminisceImg from '../../assets/memories/reminisce-empty-state.png';
import waitingImg from '../../assets/memories/Soothing Minimalist Abstract Background (1).png';

export function Dashboard() {
  const { role, canUpload, canManage } = useAuth();
  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();
  const patientId = usePatientStore((s) => s.patientId);

  // The patient living with dementia gets their own calm, simplified screen.
  if (!isLoadingPatients && role === 'PATIENT' && patients && patients.length > 0) {
    return <PatientHome patient={patients[0]} patientId={patientId} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-12 md:px-6 md:pt-10 md:pb-16">
      {isLoadingPatients ? (
        <div className="flex justify-center py-20">
          <p className="animate-pulse font-medium text-muted">Loading dashboard...</p>
        </div>
      ) : patients && patients.length === 0 ? (
        role === 'CAREGIVER' ? (
          <PatientOnboarding />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <JoinCareCircle />
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main: Reminisce */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <ReminisceCard patientId={patientId} />
          </div>

          {/* Side: navigation CTAs */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            {canUpload && (
              <CtaCard to="/app/add-memory" icon={<PlusIcon />} title="Add a Memory" subtitle="Upload photos, videos, or stories" />
            )}
            <CtaCard
              to="/app/showcase"
              icon={<SlideshowIcon />}
              title="Memory Showcase"
              subtitle="Play a cinematic slideshow of their photos"
            />
            <CtaCard
              to="/app/settings"
              icon={<SettingsIcon />}
              title="Dashboard Settings"
              subtitle={`Switch active patient${canManage ? ' or manage graph' : ''}`}
            />
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Navigation CTA card ─────────────────────────────────────────────────── */
function CtaCard({ to, icon, title, subtitle }: { to: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 border border-line bg-canvas p-5 transition-colors hover:border-primary hover:bg-primary-soft/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line-strong text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-muted">{subtitle}</span>
      </span>
      <ArrowRightIcon className="ml-auto shrink-0 text-muted transition-colors group-hover:text-primary" />
    </Link>
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
    <div className="mx-auto mt-4 w-full max-w-lg md:mt-10">
      <Card title="Register your patient" className="border-primary/30">
        <p className="mb-6 text-sm font-normal text-body">
          Welcome to Recall! To get started, please register the patient you are caring for.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField label="First Name" placeholder="e.g. Grace" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last Name" placeholder="e.g. Osei" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Date of Birth (Optional)</FieldLabel>
            <input type="date" className={inputCls} value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Diagnosis Stage (Optional)</FieldLabel>
            <select className={inputCls} value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">Select a stage</option>
              <option value="Early">Early Stage</option>
              <option value="Moderate">Moderate Stage</option>
              <option value="Advanced">Advanced Stage</option>
            </select>
          </div>
          {error && (
            <p className="text-[13px] font-medium text-error">{error instanceof Error ? error.message : 'Registration failed'}</p>
          )}
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending || !firstName.trim() || !lastName.trim()}>
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
    <Card title="Reminisce & Discover">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          className={`${inputCls} sm:flex-1`}
          placeholder="Ask about a memory... e.g., 'Who is Abena?'"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" size="lg" disabled={!draft.trim()} className="w-full sm:w-auto sm:px-8">
          Recall
        </Button>
      </form>

      <div className="mt-6 min-h-[320px] overflow-auto border border-line-strong bg-surface p-5 md:p-6">
        {!q && !isFetching && (
          <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <img src={reminisceImg} alt="" className="h-40 w-40 rounded-full object-cover opacity-90" />
            <p className="max-w-sm text-sm font-normal text-muted">
              {patientId <= 0
                ? 'Select a patient in Settings, then enter a memory prompt to explore their life graph.'
                : 'Enter a memory prompt above to explore their life graph.'}
            </p>
          </div>
        )}
        {isFetching && (
          <div className="flex items-center justify-center py-16 text-center">
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
    </Card>
  );
}

/* ── Join a Care Circle (family contributor, no patient yet) ─────────────── */
function JoinCareCircle() {
  const { role } = useAuth();
  const [code, setCode] = useState('');
  const join = useJoinCareCircle();
  const isPatient = role === 'PATIENT';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      join.mutate(code.trim().toUpperCase());
    }
  };

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <img src={waitingImg} alt="" className="mx-auto mb-5 h-40 w-auto object-contain mix-blend-multiply" />
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-ink">
        {isPatient ? 'See your memories' : 'Join a Care Circle'}
      </h2>
      <p className="mx-auto mb-6 max-w-sm text-sm font-normal text-muted">
        {isPatient
          ? 'Enter the invite code from your caregiver to open your memories.'
          : 'You are registered as a Family member. Please ask the Primary Caregiver for an invite code.'}
      </p>

      <Card title="Enter Invite Code" className="border-primary/30 text-left">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>6-Digit Code</FieldLabel>
            <input
              className={`${inputCls} text-center font-mono text-lg uppercase tracking-[0.4em]`}
              placeholder="A7X9K2"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          {join.isError && (
            <p className="border border-error/40 bg-error/5 px-3 py-2.5 text-[13px] font-medium text-error">
              {(join.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
                'The invite code you entered is invalid or has expired.'}
            </p>
          )}
          <Button type="submit" size="lg" disabled={join.isPending || code.length !== 6} className="w-full">
            {join.isPending ? 'Joining...' : 'Join Care Circle'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
