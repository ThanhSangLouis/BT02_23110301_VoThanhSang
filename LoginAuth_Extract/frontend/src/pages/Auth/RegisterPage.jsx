import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import AuthCard          from '../../components/AuthCard/AuthCard';
import AuthInput         from '../../components/AuthInput/AuthInput';
import AuthButton        from '../../components/AuthButton/AuthButton';
import PasswordStrength  from '../../components/PasswordStrength/PasswordStrength';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * RegisterPage – trang đăng ký tài khoản mới.
 * Sau khi đăng ký thành công, hiển thị bước xác minh OTP qua email.
 */
export default function RegisterPage() {
  const { register, verifyEmailOtp, loading } = useAuth();

  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirm: '' });
  const [otp, setOtp]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]     = useState({});
  const [otpStep, setOtpStep]   = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.email)
      errs.email = 'Vui lòng nhập email.';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Email không đúng định dạng.';

    if (!formData.username)
      errs.username = 'Vui lòng nhập tên đăng nhập.';
    else if (formData.username.length < 3)
      errs.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
    else if (formData.username.length > 30)
      errs.username = 'Tên đăng nhập tối đa 30 ký tự.';
    else if (!/^[a-zA-Z0-9]+$/.test(formData.username))
      errs.username = 'Chỉ sử dụng chữ cái và số.';

    if (!formData.password)
      errs.password = 'Vui lòng nhập mật khẩu.';
    else if (!PASSWORD_REGEX.test(formData.password))
      errs.password = 'Mật khẩu cần: tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.';

    if (!formData.confirm)
      errs.confirm = 'Vui lòng nhập lại mật khẩu.';
    else if (formData.password !== formData.confirm)
      errs.confirm = 'Hai mật khẩu không trùng nhau.';

    return errs;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpStep) {
      if (!/^\d{6}$/.test(otp)) { setErrors({ otp: 'Nhập OTP 6 chữ số.' }); return; }
      setErrors({});
      await verifyEmailOtp({ email: formData.email, otp });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const { confirm, ...submitData } = formData;
    const result = await register(submitData);
    if (result?.requiresEmailVerification) setOtpStep(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12
                    bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <AuthCard>
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {otpStep ? 'Xác minh Email' : 'Tạo tài khoản'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {otpStep
              ? `OTP đã gửi tới ${formData.email}`
              : 'Bắt đầu hành trình học tập hôm nay'}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          {otpStep ? (
            /* OTP step */
            <AuthInput
              id="register-otp"
              name="otp"
              type="text"
              placeholder="Mã OTP 6 chữ số"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                if (errors.otp) setErrors((p) => ({ ...p, otp: '' }));
              }}
              icon={<FiMail size={16} />}
              error={errors.otp}
              autoComplete="one-time-code"
            />
          ) : (
            <>
              {/* Email */}
              <AuthInput
                id="register-email"
                name="email"
                type="email"
                placeholder="Địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                icon={<FiMail size={16} />}
                error={errors.email}
                autoComplete="email"
              />

              {/* Username */}
              <AuthInput
                id="register-username"
                name="username"
                type="text"
                placeholder="Tên đăng nhập (3–30 ký tự)"
                value={formData.username}
                onChange={handleChange}
                icon={<FiUser size={16} />}
                error={errors.username}
                autoComplete="username"
              />

              {/* Password */}
              <AuthInput
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                icon={<FiLock size={16} />}
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
                error={errors.password}
                autoComplete="new-password"
              />

              {/* Password strength meter */}
              <PasswordStrength password={formData.password} />

              {/* Confirm password */}
              <AuthInput
                id="register-confirm"
                name="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={formData.confirm}
                onChange={handleChange}
                icon={<FiLock size={16} />}
                error={errors.confirm}
                autoComplete="new-password"
              />
            </>
          )}

          <AuthButton id="register-submit" loading={loading}>
            {loading
              ? (otpStep ? 'Đang xác minh...' : 'Đang tạo tài khoản...')
              : (otpStep ? 'Xác minh OTP'    : 'Tạo Tài Khoản')}
          </AuthButton>
        </form>

        {/* ── Footer ── */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Đăng nhập
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
