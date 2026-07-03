import axios, { type InternalAxiosRequestConfig } from 'axios';
import { auth } from './firebase';

/**
 * Backend base URL. The Recall backend serves under /api/... on port 8001
 * (see backend/readme.md). Override with VITE_API_URL for other environments.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Attach the current Firebase ID token to every request. The SDK returns a
 * cached token and transparently refreshes it when it's close to expiry, so
 * there is no separate refresh-token flow to manage.
 */
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * On a 401, force-refresh the ID token once and retry — covers the case where
 * a cached token expired mid-session. If the forced refresh still fails, the
 * session is genuinely invalid and the AuthProvider will react to sign-out.
 */
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
