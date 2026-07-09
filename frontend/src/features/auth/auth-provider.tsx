import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { pendingSignup } from '../../lib/pending-signup';
import { syncUser } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { AxiosError } from 'axios';

/** Sole owner of auth lifecycle: syncs user to backend on session change, clears store on sign-out. */
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
          // Backend sync failed — sign out so the listener re-fires with null → 'unauthenticated'.
          await auth.signOut();
        }
      }
    });

    return unsubscribe;
  }, [setUser, setStatus, clear]);

  return <>{children}</>;
}
