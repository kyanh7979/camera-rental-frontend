import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';
import orderService from '../services/orderService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, formatDateTime } from '../utils/dateFormat.js';

const ORDER_STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  CONFIRMED: { label: 'Đã xác nhận', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  PAID: { label: 'Đã thanh toán', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  RENTING: { label: 'Đang thuê', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
  RETURNED: { label: 'Đã trả thiết bị', bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' },
  COMPLETED: { label: 'Hoàn thành', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  CANCELLED: { label: 'Đã hủy', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Chưa thanh toán', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  PROCESSING: { label: 'Đang xử lý', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  COMPLETED: { label: 'Đã thanh toán', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  FAILED: { label: 'Thanh toán lỗi', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  REFUNDED: { label: 'Đã hoàn tiền', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
};

function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Chỉ fetch orders khi có user đã đăng nhập
    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
      setError('Vui lòng đăng nhập để xem đơn thuê');
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders(0, 20);
      const ordersData = response.data?.content || response.data?.data?.content || [];
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);

      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Yêu cầu bị timeout. Vui lòng thử lại sau.');
      } else {
        setError('Không thể tải danh sách đơn thuê. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatusStyle = (status) => {
    const config = ORDER_STATUS_CONFIG[status] || { label: status, bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
    return {
      backgroundColor: config.bg,
      color: config.color,
      border: `1px solid ${config.color}30`,
    };
  };

  const getPaymentStatusStyle = (status) => {
    const config = PAYMENT_STATUS_CONFIG[status] || { label: status, bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
    return {
      backgroundColor: config.bg,
      color: config.color,
      border: `1px solid ${config.color}30`,
    };
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl" style={{ color: 'var(--text-primary)' }}>
            Hồ sơ
          </h1>
          <p className="mt-1 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
            Quản lý thông tin cá nhân và xem lại lịch sử thuê thiết bị.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1.4fr]">
        {/* Account Info Card */}
        <div className="glass-panel p-5 text-xs" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
            Tài khoản
          </p>

          <div className="mt-3 space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Họ và tên</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name || user?.fullName || 'N/A'}</p>
            </div>

            <div>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Email</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="glass-panel p-5" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
            Đơn thuê của tôi
          </p>

          {isLoading && (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-shimmer rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex justify-between">
                    <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}></div>
                    <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}></div>
                  </div>
                  <div className="mt-2 h-3 w-full rounded" style={{ backgroundColor: 'var(--bg-hover)' }}></div>
                  <div className="mt-2 h-3 w-3/4 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl p-4 text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
              <button
                onClick={fetchOrders}
                className="btn btn-secondary mt-3 text-xs"
              >
                Thử lại
              </button>
            </div>
          )}

          {!isLoading && !error && orders.length === 0 && (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <svg className="mb-4 h-16 w-16" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Bạn chưa có đơn thuê nào.
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Hãy thuê một thiết bị để xem lịch sử tại đây.
              </p>
              <a
                href="/cameras"
                className="btn btn-primary mt-4 text-xs"
              >
                Xem máy ảnh
              </a>
            </div>
          )}

          {!isLoading && !error && orders.length > 0 && (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border p-4 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {order.orderCode}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={getOrderStatusStyle(order.status)}
                      >
                        {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-2">
                    {order.items && order.items.length > 0 ? (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {order.items.map((item) => item.cameraName).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                        Không có thông tin sản phẩm
                      </p>
                    )}
                  </div>

                  {/* Date Range */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Thuê: {formatDate(order.startDate)}</span>
                    <span>Trả: {formatDate(order.endDate)}</span>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={getPaymentStatusStyle(order.paymentStatus)}
                      >
                        {PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label || order.paymentStatus || 'Chưa xác định'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-ghost text-[11px] h-7 px-2"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--bg-overlay)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            style={{ borderColor: 'var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Chi tiết đơn thuê
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-ghost h-8 w-8 p-0"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mã đơn</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selectedOrder.orderCode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ngày tạo</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ngày thuê</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(selectedOrder.startDate)} - {formatDate(selectedOrder.endDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Trạng thái đơn</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={getOrderStatusStyle(selectedOrder.status)}
                >
                  {ORDER_STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Thanh toán</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={getPaymentStatusStyle(selectedOrder.paymentStatus)}
                >
                  {PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus || 'Chưa xác định'}
                </span>
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Sản phẩm thuê
                </p>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between rounded-lg p-2"
                        style={{ backgroundColor: 'var(--bg-hover)' }}
                      >
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                            {item.cameraName}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {item.rentalDays} ngày × {item.quantity} cái
                          </p>
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                    Không có thông tin sản phẩm
                  </p>
                )}
              </div>

              {selectedOrder.note && (
                <div>
                  <p className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>Ghi chú</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedOrder.note}
                  </p>
                </div>
              )}

              <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Tổng cộng
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
                {selectedOrder.depositAmount > 0 && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Đặt cọc
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(selectedOrder.depositAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-secondary text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
