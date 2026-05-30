import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { fetchCart } from '../../store/slices/cartSlice';
import { fetchMyPoints } from '../../store/slices/pointsSlice';
import { FaShoppingCart, FaBox } from 'react-icons/fa';

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { cart } = useSelector((state) => state.cart);
  const pointsBalance = useSelector((state) => state.points.pointsBalance);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchMyPoints({ page: 1, limit: 1 }));
    }
  }, [dispatch, isAuthenticated]);

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setSearch('');
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/home" className="text-xl font-bold text-blue-600">📚 BookStore</Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </form>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <div className="text-gray-600 text-sm">
                  <p>Xin chào, <span className="font-medium">{user?.username}</span></p>
                  <p className="text-xs text-gray-500">
                    Điểm tích lũy: <span className="font-semibold text-blue-600">{Number(pointsBalance || 0).toLocaleString()}</span>
                    {' '}•{' '}
                    <Link to="/points" className="text-blue-600 hover:underline">Xem</Link>
                  </p>
                </div>
                <button onClick={handleLogout} disabled={loading} className="text-blue-600 hover:underline text-sm">
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="text-blue-600 hover:underline text-sm">Đăng nhập</Link>
            )}
          </div>
        </div>

        <nav className="flex gap-6 py-2 border-t text-sm">
          <Link to="/home" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/products" className="hover:text-blue-600">Tất cả sách</Link>
          <Link to="/news" className="hover:text-blue-600">Tin tức</Link>
          {isAuthenticated && (
            <>
              <Link to="/orders" className="hover:text-blue-600 flex items-center gap-1">
                <FaBox size={14} />
                Đơn hàng
              </Link>
              <Link to="/wishlist" className="hover:text-blue-600">Yêu thích</Link>
              <Link to="/recently-viewed" className="hover:text-blue-600">Đã xem</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                  <FaBox size={14} />
                  Quản trị
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
