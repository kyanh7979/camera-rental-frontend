import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';

/**
 * AdminRoute - Bảo vệ routes chỉ dành cho admin
 * - Nếu chưa đăng nhập → redirect đến login
 * - Nếu không phải admin → redirect đến trang chủ
 * - Nếu là admin → cho phép truy cập
 */
function AdminRoute({ children }) {
  const { isAuthenticated, isHydrated, isAdmin, user } = useAuth();
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

  if (!isAdmin) {
    return (
      <Navigate
        to={ROUTES.HOME}
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;
