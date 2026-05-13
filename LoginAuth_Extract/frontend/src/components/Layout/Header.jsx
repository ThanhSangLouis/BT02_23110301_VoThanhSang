import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

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
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 text-sm">Xin chào, {user?.username}</span>
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
        </nav>
      </div>
    </header>
  );
}
