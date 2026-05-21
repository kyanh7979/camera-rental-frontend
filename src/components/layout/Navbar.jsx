import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiCamera,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore.js';
import useWishlistStore from '../../store/wishlistStore.js';
import useAuth from '../../hooks/useAuth.js';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { ROUTES } from '../../constants/routes.js';
import { CAMERA_BRANDS } from '../../constants/filters.js';

function Navbar() {
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [brandOpen, setBrandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBrandOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const cartCount = items.length;
  const wishlistCount = wishlistItems.length;

  const navBase =
    'relative px-3 py-1 text-sm font-medium transition-colors duration-200';
  const navActive =
    'text-cyan-400 after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-px after:bg-gradient-to-r after:from-transparent after:via-cyan-400 after:to-transparent';

  return (
    <header 
      className="sticky top-0 z-30 border-b backdrop-blur-xl transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <motion.div
          className="flex cursor-pointer items-center gap-2 md:gap-3 flex-shrink-0"
          onClick={() => navigate(ROUTES.HOME)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div 
            className="flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-lg md:rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
            }}
          >
            <FiCamera className="text-white text-lg md:text-xl" />
          </div>
          <div className="flex flex-col leading-tight">
            <span 
              className="text-sm md:text-base font-bold tracking-[0.1em] md:tracking-[0.15em]"
              style={{ color: 'var(--text-primary)' }}
            >
              LENSRENT
            </span>
            <span 
              className="hidden md:block text-[10px] font-medium tracking-wide"
              style={{ color: 'var(--primary)' }}
            >
              Premium Camera Rentals
            </span>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink
            to={ROUTES.HOME}
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : 'hover:text-cyan-400'}`
            }
            style={({ isActive }) => ({
              color: isActive ? undefined : 'var(--text-secondary)'
            })}
          >
            Trang chủ
          </NavLink>
          <NavLink
            to={ROUTES.CAMERAS}
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : 'hover:text-cyan-400'}`
            }
            style={({ isActive }) => ({
              color: isActive ? undefined : 'var(--text-secondary)'
            })}
          >
            Máy ảnh
          </NavLink>

          {/* Brands dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setBrandOpen((v) => !v)}
              className={`${navBase} flex items-center gap-1 hover:text-cyan-400`}
              style={{ color: brandOpen ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              Thương hiệu <FiChevronDown className={`text-[10px] transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {brandOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border p-2 shadow-xl"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                >
                  {CAMERA_BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        navigate(`/brands/${b.toLowerCase()}`);
                        setBrandOpen(false);
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-150 hover:text-cyan-400"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <NavLink
            to={ROUTES.PROFILE}
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : 'hover:text-cyan-400'}`
            }
            style={({ isActive }) => ({
              color: isActive ? undefined : 'var(--text-secondary)'
            })}
          >
            Hồ sơ
          </NavLink>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex md:gap-3">
          <ThemeToggle />

          {/* Admin Button - Only visible for admins */}
          {isAdmin && (
            <motion.button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
              className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
              }}
              whileHover={{
                boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              <FiSettings className="w-4 h-4" />
              <span>Trang quản trị</span>
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={() => navigate(ROUTES.WISHLIST)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHeart />
            {wishlistCount > 0 && (
              <span 
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-lg"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                {wishlistCount}
              </span>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate(ROUTES.CART)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShoppingCart />
            {cartCount > 0 && (
              <span 
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-lg"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                {cartCount}
              </span>
            )}
          </motion.button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  }}
                >
                  <FiUser className="text-sm" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {user?.name || user?.fullName || 'User'}
                </span>
              </div>
              <motion.button
                onClick={logout}
                className="flex h-9 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut className="w-4 h-4" />
                Đăng xuất
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="h-10 rounded-xl px-4 md:px-5 text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.08)'
                }}
                whileHover={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(6, 182, 212, 0.12))',
                  boxShadow: '0 4px 16px rgba(6, 182, 212, 0.18)'
                }}
              >
                Đăng nhập
              </motion.button>
              <motion.button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="h-10 rounded-xl px-4 md:px-5 text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.08)'
                }}
                whileHover={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(6, 182, 212, 0.12))',
                  boxShadow: '0 4px 16px rgba(6, 182, 212, 0.18)'
                }}
              >
                Đăng ký
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1.5 md:hidden flex-shrink-0">
          <ThemeToggle />

          <motion.button
            type="button"
            onClick={() => navigate(ROUTES.CART)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShoppingCart className="text-base" />
            {cartCount > 0 && (
              <span 
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate(ROUTES.WISHLIST)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHeart className="text-base" />
            {wishlistCount > 0 && (
              <span 
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <FiX className="text-base" /> : <FiMenu className="text-base" />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-72 max-w-[85vw] shadow-2xl md:hidden"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-color)'
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between px-4 py-4 border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  Menu
                </span>
                <motion.button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiX />
                </motion.button>
              </div>

              {/* Menu Content */}
              <div className="flex flex-col gap-1 p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 65px)' }}>
                {/* Auth Section */}
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div 
                      className="flex items-center gap-3 rounded-xl p-3 mb-2"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                      >
                        <FiUser className="text-lg" />
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {user?.name || user?.fullName || 'User'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <MobileMenuItem 
                        icon={<FiSettings />} 
                        label="Trang quản trị" 
                        onClick={() => { navigate(ROUTES.ADMIN_PRODUCTS); setMobileMenuOpen(false); }}
                      />
                    )}
                    
                    <MobileMenuItem 
                      icon={<FiUser />} 
                      label="Hồ sơ" 
                      onClick={() => { navigate(ROUTES.PROFILE); setMobileMenuOpen(false); }}
                    />
                    
                    <MobileMenuItem 
                      icon={<FiHeart />} 
                      label={`Yêu thích (${wishlistCount})`}
                      onClick={() => { navigate(ROUTES.WISHLIST); setMobileMenuOpen(false); }}
                    />

                    <div className="my-2 border-t" style={{ borderColor: 'var(--border-color)' }} />

                    <MobileMenuItem 
                      icon={<FiLogOut />} 
                      label="Đăng xuất" 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      danger
                    />
                  </>
                ) : (
                  <>
                    <p className="px-3 py-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Tài khoản
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => { navigate(ROUTES.LOGIN); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        color: 'var(--primary)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Đăng nhập
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => { navigate(ROUTES.REGISTER); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        color: 'var(--primary)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Đăng ký
                    </motion.button>

                    <div className="my-2 border-t" style={{ borderColor: 'var(--border-color)' }} />
                  </>
                )}

                {/* Navigation */}
                <p className="px-3 py-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Khám phá
                </p>
                <MobileMenuItem 
                  icon={<FiCamera />} 
                  label="Trang chủ" 
                  onClick={() => { navigate(ROUTES.HOME); setMobileMenuOpen(false); }}
                />
                <MobileMenuItem 
                  icon={<FiCamera />} 
                  label="Máy ảnh" 
                  onClick={() => { navigate(ROUTES.CAMERAS); setMobileMenuOpen(false); }}
                />

                {/* Brands */}
                <p className="px-3 py-2 text-xs font-medium mt-2" style={{ color: 'var(--text-muted)' }}>
                  Thương hiệu
                </p>
                {CAMERA_BRANDS.map((b) => (
                  <MobileMenuItem 
                    key={b}
                    label={b}
                    onClick={() => { navigate(`/brands/${b.toLowerCase()}`); setMobileMenuOpen(false); }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// Mobile Menu Item Component
function MobileMenuItem({ icon, label, onClick, danger = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors w-full text-left"
      style={{ 
        color: danger ? 'var(--error)' : 'var(--text-secondary)',
        backgroundColor: 'transparent'
      }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  );
}

export default Navbar;
