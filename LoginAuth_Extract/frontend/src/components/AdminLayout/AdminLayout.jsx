import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { FiShoppingBag, FiUsers, FiPackage, FiLogOut } from 'react-icons/fi';

const adminNavItems = [
  { to: '/admin', label: 'Đơn hàng', icon: FiShoppingBag, end: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: FiPackage },
  { to: '/admin/users', label: 'Người dùng', icon: FiUsers },
];

export default function AdminLayout() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-dark-900 text-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-brand-400">BookStore Admin</h1>
            <nav className="flex gap-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <FiLogOut size={18} />
              <span className="text-sm">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
