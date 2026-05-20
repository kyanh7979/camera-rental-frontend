import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';

/**
 * ProtectedRoute - Bảo vệ routes yêu cầu đăng nhập
 * - Nếu chưa đăng nhập → redirect đến login
 * - Nếu đã đăng nhập → cho phép truy cập
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
