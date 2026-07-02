import type { SignupRole } from '../types';

/**
 * Bridges the signup form to the AuthProvider's sync step.
 *
 * Firebase's onAuthStateChanged fires as soon as an account is created, and the
 * provider is the single place that calls POST /api/auth/sync (so we never
 * double-create a user). The form stashes the chosen role/name here just before
 * creating the account; the provider consumes it on the resulting auth change.
 */
interface PendingSignup {
  role: SignupRole;
  fullName: string;
}

let pending: PendingSignup | null = null;

export const pendingSignup = {
  set(value: PendingSignup): void {
    pending = value;
  },
  /** Read once and clear — later (login/rehydrate) syncs carry no role. */
  take(): PendingSignup | null {
    const value = pending;
    pending = null;
    return value;
  },
};
