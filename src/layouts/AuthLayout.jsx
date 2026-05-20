import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d4af37] to-[#92400e] bg-clip-text text-transparent">
              LENSRENT
            </h1>
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-[#1e293b]/80 backdrop-blur-sm border border-[#334155]/50 rounded-2xl p-6 shadow-xl">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[#64748b] text-xs mt-6">
          © 2024 LensRent. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
