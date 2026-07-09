import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

/** Auth lifecycle: loading | authenticated (synced) | unauthenticated | needs_role. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'needs_role';

interface AuthState {
  /** local backend profile (id/role) merged from POST /api/auth/sync */
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

/** Caches the backend profile for sync reads on reload; Firebase owns the session. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'loading',
      setUser: (user) => set({ user, status: 'authenticated' }),
      setStatus: (status) => set({ status }),
      clear: () => set({ user: null, status: 'unauthenticated' }),
    }),
    {
      name: 'recall-auth',
      // Never persist `status` — it must start as 'loading' until Firebase resolves.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
