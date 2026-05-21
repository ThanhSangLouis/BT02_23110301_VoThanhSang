import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectAuthLoading, setUser, resetAuth } from './store/slices/authSlice';
import { useEffect, useState } from 'react';
import { loadUser, logoutUser } from './store/slices/authSlice';
import { loadPersistedUser, clearPersistedUser, persistUser } from './api/axiosClient';

// Auth Pages
import LoginPage        from './pages/Auth/LoginPage';
import RegisterPage     from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import DashboardPage    from './pages/Dashboard/DashboardPage';

// Admin Pages
import AdminLayout     from './components/AdminLayout/AdminLayout';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminUsersPage  from './pages/Admin/AdminUsersPage';

// Cart & Order Pages
import CartPage         from './pages/Cart/CartPage';
import CheckoutPage     from './pages/Checkout/CheckoutPage';
import OrderHistoryPage from './pages/Order/OrderHistoryPage';
import OrderDetailPage  from './pages/Order/OrderDetailPage';

// Public Pages
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Product/ProductsPage';
import ProductDetailPage from './pages/Product/ProductDetailPage';
import NewsPage from './pages/News/NewsPage';
import NewsDetailPage from './pages/News/NewsDetailPage';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

// Component to handle initial route based on auth status
function InitialRoute() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    console.log('[InitialRoute] Mounted, checking auth...');
    let cancelled = false;
    const checkAuth = async () => {
      const persistedUser = loadPersistedUser();
      console.log('[InitialRoute] Persisted user:', persistedUser);
      if (persistedUser && !cancelled) {
        dispatch(setUser(persistedUser));
      }
      try {
        console.log('[InitialRoute] Calling loadUser API...');
        const serverUser = await dispatch(loadUser()).unwrap();
        console.log('[InitialRoute] Server user:', serverUser);
        if (serverUser && !cancelled) persistUser(serverUser);
      } catch (error) {
        console.log('[InitialRoute] loadUser error:', error);
        if (!cancelled) {
          const errorMsg = error?.message || error;
          if (errorMsg === 'SESSION_EXPIRED') {
            clearPersistedUser();
            dispatch(resetAuth());
          }
        }
      } finally {
        if (!cancelled) setInitComplete(true);
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, [dispatch]);

  // Still initializing - show loading
  if (!initComplete) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin to admin page, others to home
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/home" replace />;
}

export default function App() {
  // Auth initialization is handled by InitialRoute component
  // Session expiry events are still listened here for global logout

  // Listen for SESSION_EXPIRED events from axios interceptor
  const dispatch = useDispatch();
  useEffect(() => {
    const handleSessionExpired = () => {
      clearPersistedUser();
      dispatch(resetAuth());
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Redirect root based on auth status */}
        <Route path="/" element={<InitialRoute />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Public Routes - Only accessible when logged in */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/product/:slug"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <NewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news/:slug"
          element={
            <ProtectedRoute>
              <NewsDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Cart & Order Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<InitialRoute />} />
      </Routes>
    </div>
  );
}
