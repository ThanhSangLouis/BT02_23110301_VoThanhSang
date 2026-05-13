import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/slices/authSlice';
import { useEffect } from 'react';
import { loadUser } from './store/slices/authSlice';
import { useDispatch } from 'react-redux';

// Auth Pages
import LoginPage        from './pages/Auth/LoginPage';
import RegisterPage     from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import DashboardPage    from './pages/Dashboard/DashboardPage';

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

// Component to handle initial route based on auth status
function InitialRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Load user on app mount if token exists
  useEffect(() => {
    dispatch(loadUser());
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

        {/* Fallback */}
        <Route path="*" element={<InitialRoute />} />
      </Routes>
    </div>
  );
}
