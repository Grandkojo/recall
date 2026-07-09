import type { SignupRole } from '../types';

/** Stashes chosen role/name so AuthProvider can sync it on the next auth change. */
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
