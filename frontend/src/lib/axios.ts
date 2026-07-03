import axios, { type InternalAxiosRequestConfig } from 'axios';
import { auth } from './firebase';

/** Backend base URL (serves /api/... on :8001); override with VITE_API_URL. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Attach the current Firebase ID token to every request (SDK auto-refreshes near expiry).
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, force-refresh the token once and retry; if that fails too, sign out.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    const user = auth.currentUser;

    if (error.response?.status === 401 && original && !original._retry && user) {
      original._retry = true;
      try {
        const token = await user.getIdToken(true);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        await auth.signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
