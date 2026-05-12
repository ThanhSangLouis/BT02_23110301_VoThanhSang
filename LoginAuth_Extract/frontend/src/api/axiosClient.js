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
axiosClient.interceptors.response.use(
  // Unwrap .data automatically so callers get the payload directly
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;
    const refreshUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      originalRequest?.url !== '/auth/refresh' &&
      originalRequest?.url !== refreshUrl
    ) {
      originalRequest._retry = true;
      try {
        // Refresh token lives in an HttpOnly cookie – server reads it automatically
        await axios.post(refreshUrl, {}, { withCredentials: true });
        return axiosClient(originalRequest);
      } catch {
        // Refresh failed – caller handles the unauthorized state
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
