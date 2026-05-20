import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiCamera, FiShoppingBag, FiUsers, FiLogOut, FiMenu, FiX, FiImage } from 'react-icons/fi';
import useAuthStore from '../store/authStore.js';
import { showSuccess } from '../components/ui/ToastNotification.jsx';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FiCamera, label: 'Sản phẩm' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/admin/banners', icon: FiImage, label: 'Banner trang chủ' },
  ];

  const handleLogout = () => {
    logout();
    showSuccess('Đã đăng xuất!');
    window.location.href = '/';
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <span className="text-xl font-bold text-white whitespace-nowrap">Camera Rental</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <FiX className="text-slate-400" size={20} />
            ) : (
              <FiMenu className="text-slate-400" size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email || 'admin@example.com'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top bar */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-white">
            {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
