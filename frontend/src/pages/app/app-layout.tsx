import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useGetPatients } from '../../hooks/usePatients';
import { usePatientStore } from '../../store/patientStore';

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
    <div className={`flex min-h-svh flex-col bg-surface ${patients && patients.length > 0 ? 'pb-20' : 'pb-0'}`}>
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

      {/* Render the active child route */}
      <Outlet />
    </div>
  );
}
