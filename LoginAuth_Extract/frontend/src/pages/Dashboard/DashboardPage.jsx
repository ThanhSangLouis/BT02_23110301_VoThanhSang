import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import AuthButton from '../../components/AuthButton/AuthButton';
import { FiLogOut, FiUser, FiMail, FiShield } from 'react-icons/fi';

/**
 * DashboardPage – trang sau khi đăng nhập thành công.
 * Hiển thị thông tin user từ Redux store.
 */
export default function DashboardPage() {
  const user    = useSelector(selectUser);
  const { logout, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900
                    flex items-center justify-center px-4 py-12">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8
                      w-full max-w-md shadow-2xl shadow-black/40 animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700
                          rounded-full flex items-center justify-center mx-auto mb-4
                          text-3xl font-bold text-white shadow-lg shadow-brand-600/30">
            {user?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Chào mừng, {user?.username || 'bạn'}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Bạn đã đăng nhập thành công</p>
        </div>

        {/* User Info */}
        <div className="space-y-3 mb-8">
          {user?.email && (
            <div className="flex items-center gap-3 bg-dark-700 rounded-xl px-4 py-3">
              <FiMail className="text-brand-400 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Email</p>
                <p className="text-gray-200 text-sm font-medium">{user.email}</p>
              </div>
            </div>
          )}
          {user?.username && (
            <div className="flex items-center gap-3 bg-dark-700 rounded-xl px-4 py-3">
              <FiUser className="text-brand-400 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Tên đăng nhập</p>
                <p className="text-gray-200 text-sm font-medium">{user.username}</p>
              </div>
            </div>
          )}
          {user?.role && (
            <div className="flex items-center gap-3 bg-dark-700 rounded-xl px-4 py-3">
              <FiShield className="text-brand-400 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Vai trò</p>
                <p className="text-gray-200 text-sm font-medium capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Redux State Badge */}
        <div className="bg-brand-600/10 border border-brand-600/30 rounded-xl px-4 py-3 mb-6">
          <p className="text-brand-300 text-xs font-mono text-center">
            ✅ State được quản lý bởi Redux Toolkit
          </p>
        </div>

        {/* Logout */}
        <AuthButton
          id="logout-btn"
          type="button"
          loading={loading}
          onClick={logout}
          variant="secondary"
        >
          <FiLogOut size={16} />
          {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </AuthButton>
      </div>
    </div>
  );
}
