import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  setUser,
  resetAuth,
  loadUser,
} from './store/slices/authSlice';
import { useEffect, useState, useRef } from 'react';
import {
  loadPersistedUser,
  clearPersistedUser,
  persistUser,
} from './api/axiosClient';

// Auth Pages
import LoginPage         from './pages/Auth/LoginPage';
import RegisterPage      from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import DashboardPage     from './pages/Dashboard/DashboardPage';

// Admin Pages
import AdminLayout      from './components/AdminLayout/AdminLayout';
import AdminOrdersPage  from './pages/Admin/AdminOrdersPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminUsersPage   from './pages/Admin/AdminUsersPage';

// Cart & Order Pages
import CartPage         from './pages/Cart/CartPage';
import CheckoutPage     from './pages/Checkout/CheckoutPage';
import OrderHistoryPage from './pages/Order/OrderHistoryPage';
import OrderDetailPage  from './pages/Order/OrderDetailPage';

// Public Pages
import HomePage         from './pages/Home/HomePage';
import ProductsPage     from './pages/Product/ProductsPage';
import ProductDetailPage from './pages/Product/ProductDetailPage';
import NewsPage         from './pages/News/NewsPage';
import NewsDetailPage   from './pages/News/NewsDetailPage';

// ── Loading Screen ─────────────────────────────────────────────────────────────
function LoadingScreen({ message = 'Dang kiem tra phien dang nhap...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

// ── Auth Initializer (runs at App level) ──────────────────────────────────────
// This component initializes auth state BEFORE any route renders.
// It reads localStorage, calls /api/users/me, persists user back,
// and only then unblocks the route tree.
function AuthInitializer({ children }) {
  const dispatch  = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const [authResult, setAuthResult] = useState(null); // { isAuthenticated, user }
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      console.log('[AuthInit] Starting auth initialization...');

      // Step 1: Restore user from localStorage (fast, no network)
      const persistedUser = loadPersistedUser();
      console.log('[AuthInit] localStorage user:', persistedUser ? 'FOUND' : 'NONE');
      if (persistedUser) {
        dispatch(setUser(persistedUser));
      }

      // Step 2: Validate session with server (network call)
      // This verifies the JWT cookie is still valid
      console.log('[AuthInit] Calling /api/users/me to validate cookie session...');
      try {
        const serverUser = await dispatch(loadUser()).unwrap();
        console.log('[AuthInit] Server user loaded:', serverUser?.username, '| role:', serverUser?.role);

        // Update localStorage with fresh server data
        persistUser(serverUser);

        setAuthResult({ isAuthenticated: true, user: serverUser });
        console.log('[AuthInit] Auth VALID — user stays logged in');
      } catch (err) {
        console.log('[AuthInit] Server validation FAILED:', err);

        if (err?.message === 'SESSION_EXPIRED') {
          // Token refresh also failed — session truly expired
          console.log('[AuthInit] SESSION_EXPIRED — clearing all auth data');
          clearPersistedUser();
          dispatch(resetAuth());
          setAuthResult({ isAuthenticated: false, user: null });
        } else {
          // Network error or other — if we have persisted user, keep them logged in
          // (server might be temporarily down but cookie is still valid)
          if (persistedUser) {
            console.log('[AuthInit] Network error but has localStorage user — keeping logged in');
            setAuthResult({ isAuthenticated: true, user: persistedUser });
          } else {
            console.log('[AuthInit] No localStorage user — redirecting to login');
            setAuthResult({ isAuthenticated: false, user: null });
          }
        }
      } finally {
        console.log('[AuthInit] Auth initialization complete');
        setAuthReady(true);
      }
    };

    initAuth();
  }, [dispatch]);

  // Still initializing — block entire app
  if (!authReady) {
    return <LoadingScreen />;
  }

  // Auth is ready — render the app with auth context available
  // We pass isAuthenticated from authResult to avoid reading stale Redux state
  return children;
}

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ── Admin Route ────────────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user             = useSelector(selectUser);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

// ── Initial Route (handles "/" path) ─────────────────────────────────────────
function InitialRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectUser);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/home" replace />;
}

// ── Global Session-Expiry Listener ───────────────────────────────────────────
function SessionExpiryHandler() {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('[App] SESSION_EXPIRED event received — clearing auth');
      clearPersistedUser();
      dispatch(resetAuth());
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [dispatch]);
  return null;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthInitializer>
      <SessionExpiryHandler />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Root "/" → redirect to /home or /admin based on role */}
          <Route path="/" element={<InitialRoute />} />

          {/* Auth Routes (public) */}
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

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
            <Route index          element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="users"    element={<AdminUsersPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<InitialRoute />} />
        </Routes>
      </div>
    </AuthInitializer>
  );
}
