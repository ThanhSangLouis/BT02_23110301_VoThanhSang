const authService = require('./auth.service');
const { ApiResponse } = require('../../shared/utils/apiResponse');
const { AppError } = require('../../shared/errors/AppError');

// Express 5 natively catches async errors — no asyncHandler wrapper needed

// Helper: set JWT in HttpOnly cookies
function setAuthCookies(res, { accessToken, refreshToken }) {
  const isProd  = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'none' : 'lax';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite,
    maxAge:   15 * 60 * 1000,          // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite,
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// POST /api/auth/register
const register = async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.success(result, 'OTP đã gửi. Vui lòng xác minh email để kích hoạt tài khoản.'));
};

// POST /api/auth/verify-email-otp
const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyEmailOtp(email, otp);
  setAuthCookies(res, result);
  const { accessToken, refreshToken, ...rest } = result;
  res.status(200).json(ApiResponse.success(rest, result.message));
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  setAuthCookies(res, result);
  const { accessToken, refreshToken, ...rest } = result;
  res.status(200).json(ApiResponse.success(rest, 'Đăng nhập thành công'));
};

// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  // Read refresh token from HttpOnly cookie
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Không tìm thấy refresh token', 401);
  const result = await authService.refreshToken(token);
  setAuthCookies(res, result);
  res.status(200).json(ApiResponse.success(null, 'Token đã được làm mới'));
};

// POST /api/auth/logout
const logout = async (req, res) => {
  await authService.logout(req.user._id);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json(ApiResponse.success(null, 'Đăng xuất thành công'));
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json(ApiResponse.success(null, result.message));
};

// POST /api/auth/reset-password-otp
const resetPasswordWithOtp = async (req, res) => {
  const result = await authService.resetPasswordWithOtp(req.body);
  res.status(200).json(ApiResponse.success(null, result.message));
};

module.exports = {
  register,
  verifyEmailOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPasswordWithOtp,
};
