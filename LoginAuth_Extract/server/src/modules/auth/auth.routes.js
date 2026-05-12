const express = require('express');
const router  = express.Router();

const {
  register,
  verifyEmailOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPasswordWithOtp,
} = require('./auth.controller');
const { validate }    = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyEmailOtpSchema,
  resetPasswordOtpSchema,
} = require('./auth.validation');

// POST /api/auth/register — tạo tài khoản và gửi OTP xác minh email
router.post('/register', validate(registerSchema), register);

// POST /api/auth/verify-email-otp — xác minh OTP email
router.post('/verify-email-otp', validate(verifyEmailOtpSchema), verifyEmailOtp);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/refresh — làm mới access token từ cookie refreshToken
router.post('/refresh', refreshToken);

// POST /api/auth/logout (protected)
router.post('/logout', authenticate, logout);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// POST /api/auth/reset-password-otp
router.post('/reset-password-otp', validate(resetPasswordOtpSchema), resetPasswordWithOtp);

module.exports = router;
