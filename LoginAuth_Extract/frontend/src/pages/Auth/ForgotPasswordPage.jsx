import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { selectAuthLoading } from '../../store/slices/authSlice';
import AuthCard   from '../../components/AuthCard/AuthCard';
import AuthInput  from '../../components/AuthInput/AuthInput';
import AuthButton from '../../components/AuthButton/AuthButton';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * ForgotPasswordPage – quên mật khẩu + đặt lại mật khẩu bằng OTP.
 *
 * Flow:
 *   1. Nhập email → gửi OTP
 *   2. Nhập OTP + mật khẩu mới → đặt lại
 */
export default function ForgotPasswordPage() {
  const { forgotPassword, resetPasswordOtp } = useAuth();
  const loading = useSelector(selectAuthLoading);

  const [email, setEmail]               = useState('');
  const [otp, setOtp]                   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]             = useState({});
  const [sent, setSent]                 = useState(false);

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email)                         errs.email = 'Vui lòng nhập email.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không đúng định dạng.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const success = await forgotPassword({ email });
    if (success) setSent(true);
  };

  // ── Step 2: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!otp || !/^\d{6}$/.test(otp))
      errs.otp = 'Nhập OTP 6 chữ số.';
    if (!newPassword)
      errs.newPassword = 'Nhập mật khẩu mới.';
    else if (!PASSWORD_REGEX.test(newPassword))
      errs.newPassword = 'Mật khẩu cần tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.';
    if (!confirmPassword)
      errs.confirmPassword = 'Nhập lại mật khẩu mới.';
    else if (confirmPassword !== newPassword)
      errs.confirmPassword = 'Hai mật khẩu không trùng nhau.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    await resetPasswordOtp({ email, otp, newPassword });
  };

  // ── Render Step 1 ─────────────────────────────────────────────────────────
  const renderRequestForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🔑</div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Quên mật khẩu?</h1>
        <p className="text-gray-400 text-sm mt-1">Chúng tôi sẽ gửi OTP đặt lại vào email của bạn</p>
      </div>
      <form onSubmit={handleRequestOtp} noValidate>
        <AuthInput
          id="forgot-email"
          name="email"
          type="email"
          placeholder="Nhập địa chỉ email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
          icon={<FiMail size={16} />}
          error={errors.email}
          autoComplete="email"
        />
        <AuthButton id="forgot-submit" loading={loading}>
          {loading ? 'Đang gửi...' : 'Gửi OTP đặt lại'}
        </AuthButton>
      </form>
    </>
  );

  // ── Render Step 2 ─────────────────────────────────────────────────────────
  const renderResetForm = () => (
    <>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <FiCheckCircle className="text-green-400" size={40} />
        </div>
        <h2 className="text-xl font-bold text-white">Kiểm tra email của bạn</h2>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
          OTP đã được gửi tới <strong className="text-brand-400">{email}</strong>.
          OTP có hiệu lực trong 10 phút.
        </p>
      </div>

      <form onSubmit={handleResetPassword} noValidate>
        {/* OTP */}
        <AuthInput
          id="reset-otp"
          name="otp"
          type="text"
          placeholder="Mã OTP 6 chữ số"
          value={otp}
          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors((p) => ({ ...p, otp: '' })); }}
          icon={<FiMail size={16} />}
          error={errors.otp}
          autoComplete="one-time-code"
        />

        {/* New Password */}
        <AuthInput
          id="reset-new-password"
          name="newPassword"
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
          icon={<FiLock size={16} />}
          error={errors.newPassword}
          autoComplete="new-password"
        />

        {/* Confirm New Password */}
        <AuthInput
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
          icon={<FiLock size={16} />}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <AuthButton id="reset-submit" loading={loading}>
          {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </AuthButton>
      </form>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12
                    bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <AuthCard>
        {!sent ? renderRequestForm() : renderResetForm()}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link
            to="/login"
            className="flex items-center justify-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
          >
            <FiArrowLeft size={14} />
            Quay lại Đăng nhập
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
