import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import AuthCard    from '../../components/AuthCard/AuthCard';
import AuthInput   from '../../components/AuthInput/AuthInput';
import AuthButton  from '../../components/AuthButton/AuthButton';

/**
 * LoginPage – trang đăng nhập.
 * - Sử dụng useAuth() (Redux Hook) để dispatch loginUser thunk
 * - Sử dụng Axios (qua authAPI) để gọi POST /auth/login
 * - Validation phía client trước khi gửi
 */
export default function LoginPage() {
  const { login, loading } = useAuth();

  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]         = useState({});

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.email)
      errs.email = 'Vui lòng nhập email.';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Email không đúng định dạng.';
    if (!formData.password)
      errs.password = 'Vui lòng nhập mật khẩu.';
    return errs;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    await login(formData);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12
                    bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <AuthCard>
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Chào mừng trở lại</h1>
          <p className="text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục học tập</p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            placeholder="Địa chỉ email"
            value={formData.email}
            onChange={handleChange}
            icon={<FiMail size={16} />}
            error={errors.email}
            autoComplete="email"
          />

          {/* Password */}
          <AuthInput
            id="login-password"
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
            autoComplete="current-password"
          />

          {/* Forgot Password link */}
          <div className="text-right -mt-2 mb-4">
            <Link
              to="/forgot-password"
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit */}
          <AuthButton id="login-submit" loading={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </AuthButton>
        </form>

        {/* ── Footer ── */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Tạo tài khoản miễn phí
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
