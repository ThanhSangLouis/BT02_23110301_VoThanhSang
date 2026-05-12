import axiosClient from './axiosClient';

/**
 * authAPI – thin wrapper over axiosClient for all auth endpoints.
 * Uses Axios (not fetch) as required by the assignment.
 */
export const authAPI = {
  /** POST /auth/login  → { success, data: { user, accessToken? } } */
  login: (data) => axiosClient.post('/auth/login', data),

  /** POST /auth/register  → { success, data } */
  register: (data) => axiosClient.post('/auth/register', data),

  /** POST /auth/verify-email-otp  → { success, data: { user } } */
  verifyEmailOtp: (data) => axiosClient.post('/auth/verify-email-otp', data),

  /** POST /auth/logout */
  logout: () => axiosClient.post('/auth/logout'),

  /** POST /auth/forgot-password */
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),

  /** POST /auth/reset-password-otp */
  resetPasswordOtp: (data) => axiosClient.post('/auth/reset-password-otp', data),

  /** POST /auth/refresh */
  refresh: () => axiosClient.post('/auth/refresh'),

  /** GET /users/me  → authenticated user info */
  getMe: () => axiosClient.get('/users/me'),
};
