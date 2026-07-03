import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../lib/firebase';
import api from '../lib/axios';
import { pendingSignup } from '../lib/pending-signup';
import type { AuthUser, Role, SignupRole, SyncResponse } from '../types';

/** Idempotently register/refresh the Firebase user in Postgres; returns id + role. */
export async function syncUser(params?: { role?: SignupRole; fullName?: string }): Promise<AuthUser> {
  const body: { role?: Role; full_name?: string } = {};
  if (params?.role) body.role = params.role;
  if (params?.fullName) body.full_name = params.fullName;

  const { data } = await api.post<SyncResponse>('/api/auth/sync', body);

  const fbUser = auth.currentUser;
  return {
    userId: data.user_id,
    email: fbUser?.email ?? '',
    fullName: fbUser?.displayName ?? params?.fullName ?? null,
    role: data.role,
  };
}

/** Firebase email/password sign-in. The AuthProvider handles the ensuing sync. */
export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/** Firebase email/password sign-up; sets display name and stashes role for AuthProvider sync. */
export async function signupWithEmail(
  email: string,
  password: string,
  fullName: string,
  role: SignupRole
): Promise<void> {
  // Stash before createUser fires onAuthStateChanged, so AuthProvider syncs the right role.
  pendingSignup.set({ role, fullName });
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });
}

const googleProvider = new GoogleAuthProvider();

/** Firebase Google sign-in. The AuthProvider handles the ensuing sync. */
export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

/** Firebase Google sign-up; stashes role for AuthProvider to sync on the next auth change. */
export async function signupWithGoogle(role: SignupRole): Promise<void> {
  // Stash the role. The full name will be extracted from the Google profile by the AuthProvider
  pendingSignup.set({ role, fullName: '' });
  await signInWithPopup(auth, googleProvider);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Map Firebase auth error codes to user-facing copy. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Use a stronger password of at least 8 characters';
      case 'auth/invalid-email':
        return 'That email address looks invalid';
      case 'auth/too-many-requests':
        return 'Too many attempts — please wait and try again';
      case 'auth/network-request-failed':
        return 'Network error — check your connection';
      default:
        return 'Something went wrong. Please try again';
    }
  }
  return 'Something went wrong. Please try again';
}
