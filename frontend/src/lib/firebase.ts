import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Firebase is the sole authentication provider — the backend verifies the ID
 * tokens this SDK issues (backend/app/api/deps.py -> verify_id_token).
 * Config comes from VITE_FIREBASE_* env vars (see .env.example).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
