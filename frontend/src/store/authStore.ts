import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

/**
 * 'loading'         — Firebase is still resolving the persisted session
 * 'authenticated'   — Firebase user present AND synced with the backend
 * 'unauthenticated' — no Firebase user
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  /** local backend profile (id/role) merged from POST /api/auth/sync */
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

/**
 * The Firebase SDK is the source of truth for the *session* (it persists the
 * ID token itself). This store only caches the backend profile so the role is
 * available synchronously on reload; AuthProvider re-syncs to keep it fresh.
 */
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
