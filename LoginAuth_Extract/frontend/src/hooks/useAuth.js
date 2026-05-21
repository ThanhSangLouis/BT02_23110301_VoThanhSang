import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  loginUser,
  registerUser,
  verifyEmailOtp,
  logoutUser,
  forgotPassword,
  resetPasswordOtp,
  loadUser,
  clearError,
  selectAuth,
} from '../store/slices/authSlice';

/**
 * useAuth – custom hook cung cấp state auth và các action.
 * Sử dụng Redux Hooks (useDispatch / useSelector) để quản lý state.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error, requiresEmailVerification } =
    useSelector(selectAuth);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async ({ email, password }) => {
      dispatch(clearError());
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        const userRole = result.payload?.user?.role || result.payload?.role;
        toast.success(`Chào mừng trở lại, ${result.payload?.username || 'bạn'}! 👋`);
        navigate(userRole === 'admin' ? '/admin' : '/home');
      } else {
        toast.error(result.payload || 'Đăng nhập thất bại');
      }
    },
    [dispatch, navigate]
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async ({ email, username, password }) => {
      dispatch(clearError());
      const result = await dispatch(registerUser({ email, username, password }));
      if (registerUser.fulfilled.match(result)) {
        toast.success('OTP đã gửi vào email. Vui lòng xác minh để kích hoạt tài khoản.');
        return { requiresEmailVerification: true };
      } else {
        toast.error(result.payload || 'Đăng ký thất bại');
        return null;
      }
    },
    [dispatch]
  );

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const verifyEmailOtpAction = useCallback(
    async ({ email, otp }) => {
      dispatch(clearError());
      const result = await dispatch(verifyEmailOtp({ email, otp }));
      if (verifyEmailOtp.fulfilled.match(result)) {
        toast.success('Email đã xác minh! Tài khoản đã được kích hoạt.');
        const userRole = result.payload?.user?.role || result.payload?.role;
        navigate(userRole === 'admin' ? '/admin' : '/home');
        return true;
      } else {
        toast.error(result.payload || 'Xác minh OTP thất bại');
        return false;
      }
    },
    [dispatch, navigate]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    toast.success('Đã đăng xuất');
    navigate('/login');
  }, [dispatch, navigate]);

  // ── Forgot Password ────────────────────────────────────────────────────────
  const forgotPasswordAction = useCallback(
    async ({ email }) => {
      dispatch(clearError());
      const result = await dispatch(forgotPassword({ email }));
      if (forgotPassword.fulfilled.match(result)) {
        toast.success('OTP đã gửi! Kiểm tra email của bạn 📧');
        return true;
      } else {
        toast.error(result.payload || 'Không thể gửi OTP');
        return false;
      }
    },
    [dispatch]
  );

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetPasswordOtpAction = useCallback(
    async ({ email, otp, newPassword }) => {
      dispatch(clearError());
      const result = await dispatch(resetPasswordOtp({ email, otp, newPassword }));
      if (resetPasswordOtp.fulfilled.match(result)) {
        toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
        navigate('/login');
        return true;
      } else {
        toast.error(result.payload || 'Đặt lại mật khẩu thất bại');
        return false;
      }
    },
    [dispatch, navigate]
  );

  // ── Load Current User ──────────────────────────────────────────────────────
  const loadCurrentUser = useCallback(() => dispatch(loadUser()), [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    requiresEmailVerification,
    login,
    register,
    verifyEmailOtp:    verifyEmailOtpAction,
    logout,
    forgotPassword:    forgotPasswordAction,
    resetPasswordOtp:  resetPasswordOtpAction,
    loadUser:          loadCurrentUser,
    clearError:        () => dispatch(clearError()),
  };
}
