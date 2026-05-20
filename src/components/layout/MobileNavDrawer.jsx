import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import useUIStore from '../../store/uiStore.js';
import useWishlistStore from '../../store/wishlistStore.js';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';

function MobileNavDrawer() {
  const { isMobileNavOpen, closeMobileNav } = useUIStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isMobileNavOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileNav}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-72 glass-panel border-l p-5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
                MENU
              </span>
              <button
                onClick={closeMobileNav}
                className="flex h-8 w-8 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                <FiX />
              </button>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <NavLink
                to={ROUTES.HOME}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 transition ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/40'
                      : 'hover:bg-cyan-500/10'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                })}
              >
                Trang chủ
              </NavLink>
              <NavLink
                to={ROUTES.CAMERAS}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 transition ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/40'
                      : 'hover:bg-cyan-500/10'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                })}
              >
                Máy ảnh
              </NavLink>
              <NavLink
                to={ROUTES.PROFILE}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 transition ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/40'
                      : 'hover:bg-cyan-500/10'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                })}
              >
                Hồ sơ
              </NavLink>
              <NavLink
                to={ROUTES.WISHLIST}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 transition ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/40'
                      : 'hover:bg-cyan-500/10'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                })}
              >
                <span className="flex items-center gap-2">
                  Yêu thích
                  {wishlistItems.length > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                          style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                      {wishlistItems.length}
                    </span>
                  )}
                </span>
              </NavLink>

              {/* Policy links */}
              <NavLink
                to={ROUTES.WARRANTY_POLICY}
                onClick={closeMobileNav}
                className="rounded-xl px-3 py-2 transition hover:bg-cyan-500/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Bảo hành & hỗ trợ
              </NavLink>
              <NavLink
                to={ROUTES.SHIPPING_POLICY}
                onClick={closeMobileNav}
                className="rounded-xl px-3 py-2 transition hover:bg-cyan-500/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Giao hàng
              </NavLink>
              <NavLink
                to={ROUTES.FLEXIBLE_DELIVERY}
                onClick={closeMobileNav}
                className="rounded-xl px-3 py-2 transition hover:bg-cyan-500/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Giao nhận linh hoạt
              </NavLink>

              {/* Admin Link - Only visible for admins */}
              {isAdmin && (
                <NavLink
                  to={ROUTES.ADMIN_PRODUCTS}
                  onClick={closeMobileNav}
                  className="rounded-xl px-3 py-2 transition hover:bg-cyan-500/10"
                  style={{ color: 'var(--primary)' }}
                >
                  <span className="flex items-center gap-2">
                    <FiSettings className="w-4 h-4" />
                    Trang quản trị
                  </span>
                </NavLink>
              )}

              {/* Auth Actions */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    closeMobileNav();
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition mt-2"
                  style={{ color: '#ef4444' }}
                >
                  <FiLogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate(ROUTES.LOGIN);
                    closeMobileNav();
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition mt-2"
                  style={{ color: 'var(--primary)' }}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileNavDrawer;

