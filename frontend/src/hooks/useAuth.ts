import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { logout as firebaseLogout } from '../services/auth';

/** Auth-state view with role perms: canUpload (CAREGIVER/FAMILY), canManage (CAREGIVER). */
export function useAuth() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  const role = user?.role ?? null;

  const logout = async () => {
    await firebaseLogout();
    // Drop any cached memory data so the next user starts clean.
    qc.clear();
  };

  return {
    user,
    status,
    role,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    canUpload: role === 'CAREGIVER' || role === 'FAMILY_CONTRIBUTOR',
    canManage: role === 'CAREGIVER',
    logout,
  };
}
