import { useEffect, useState, useCallback, useRef } from "react";
import { FiCamera, FiShoppingBag, FiUsers, FiDollarSign, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import dashboardService from "../../services/dashboardService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { getStatusDisplay } from "../../constants/orderStatus.js";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeRentals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchCalledRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchCalledRef.current) {
      return;
    }
    fetchCalledRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getStats();
      const data = response.data;

      setStats({
        totalProducts: data.totalCameras || 0,
        totalOrders: data.totalOrders || 0,
        totalUsers: data.totalUsers || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingOrders: data.pendingOrders || 0,
        activeRentals: data.activeRentals || 0,
      });
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      fetchCalledRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRetry = () => {
    fetchCalledRef.current = false;
    fetchData();
  };

  const getStatusBadge = (status) => {
    const display = getStatusDisplay(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${display.bg} ${display.text}`}>
        {display.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FiAlertCircle className="text-red-400 text-5xl" />
        <p className="text-slate-400 text-center">{error}</p>
        <button
          onClick={handleRetry}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className="text-sm" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tổng quan hệ thống cho Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tổng sản phẩm</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
              <FiCamera className="text-blue-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tổng đơn thuê</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
              <FiShoppingBag className="text-purple-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tổng người dùng</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <FiUsers className="text-green-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tổng doanh thu</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <FiDollarSign className="text-yellow-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chờ xác nhận</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>{stats.pendingOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <FiAlertCircle className="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang thuê</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#8b5cf6' }}>{stats.activeRentals}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
              <FiShoppingBag className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đơn hoàn thành</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>
                {stats.totalOrders - stats.pendingOrders - stats.activeRentals}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <FiShoppingBag className="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Cameras */}
      <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Máy ảnh được thuê nhiều nhất</h3>
        <div className="space-y-3">
          <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Dữ liệu top cameras sẽ được hiển thị khi có đủ dữ liệu
          </div>
        </div>
      </div>
    </div>
  );
}
