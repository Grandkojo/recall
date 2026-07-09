import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '../../components/ui';
import { RecallMark } from '../../components/layout/recall-mark';
import { useAuth } from '../../hooks/useAuth';
import { useGetPatients } from '../../hooks/usePatients';
import { usePatientStore } from '../../store/patientStore';

function LogoutIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square" aria-hidden="true">
      <path d="M15 4h4v16h-4" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </svg>
  );
}

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const { data: patients } = useGetPatients();
  const patientId = usePatientStore((s) => s.patientId);
  const setPatientId = usePatientStore((s) => s.setPatientId);

  // Automatically select the first patient if available and none is selected
  useEffect(() => {
    if (patients && patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }
  }, [patients, patientId, setPatientId]);

  return (
    <div className="flex min-h-svh flex-col bg-surface text-sm">
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <RecallMark />
            <div className="min-w-0 leading-tight">
              <p className="text-[17px] font-semibold tracking-tight text-ink">Recall</p>
              <p className="max-w-[190px] truncate text-[12px] font-medium text-muted sm:max-w-none">
                {user?.fullName ?? user?.email}
                {role && <span className="ml-1.5 text-primary">· {role.replace('_', ' ')}</span>}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout} className="text-[13px]">
            <LogoutIcon />
            Sign out
          </Button>
        </div>
      </header>

      {/* Render the active child route */}
      <Outlet />
    </div>
  );
}
