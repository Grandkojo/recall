import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { pendingSignup } from '../../lib/pending-signup';
import { syncUser } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { AxiosError } from 'axios';

/**
 * Single owner of the auth lifecycle. Subscribes to Firebase and, on every
 * session change, syncs the user with the backend exactly once:
 *  - sign-in / sign-up / reload with a live session -> POST /api/auth/sync
 *  - sign-out -> clear the store
 * Being the only caller of syncUser() guarantees we never double-create a user.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        clear();
        return;
      }

      setStatus('loading');
      try {
        // Present only right after signup; carries the chosen role/name.
        const signup = pendingSignup.take();
        const user = await syncUser(signup ?? undefined);
        setUser(user);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 428) {
          setStatus('needs_role');
        } else {
          // Backend sync failed — don't sit half-authenticated. Signing out
          // re-triggers this listener with null, landing on 'unauthenticated'.
          await auth.signOut();
        }
      }
    });

    return unsubscribe;
  }, [setUser, setStatus, clear]);

  return <>{children}</>;
}
