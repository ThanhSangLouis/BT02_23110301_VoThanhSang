import axios from 'axios';

/**
 * axiosClient – Axios instance pre-configured for the BT02 API.
 *
 * - baseURL: reads from VITE_API_URL env var (fallback: localhost:5000/api)
 * - withCredentials: true  → HttpOnly cookie (refreshToken) sent automatically
 * - Response interceptor:  → auto-refresh on 401
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Response Interceptor ──────────────────────────────────────────────────────

// Helper: persist user to localStorage
export const persistUser = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch { /* ignore */ }
};

// Helper: load persisted user
export const loadPersistedUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

// Helper: clear persisted user
export const clearPersistedUser = () => {
  try {
    localStorage.removeItem('user');
  } catch { /* ignore */ }
};

axiosClient.interceptors.response.use(
  // Unwrap .data automatically so callers get the payload directly
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;
    const refreshUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`;

    // Only attempt refresh for 401 errors on protected endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      try {
        // Refresh token lives in an HttpOnly cookie – server reads it automatically
        await axios.post(refreshUrl, {}, { withCredentials: true });
        // Retry the original request after successful refresh
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear persisted data and dispatch event
        clearPersistedUser();
        window.dispatchEvent(new Event('session-expired'));
        console.warn('Token refresh failed, user will be logged out');
        return Promise.reject(new Error('SESSION_EXPIRED'));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
