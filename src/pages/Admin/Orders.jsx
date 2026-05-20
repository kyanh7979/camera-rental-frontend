import { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiEye, FiX, FiCheck, FiXCircle, FiLoader } from "react-icons/fi";
import api from "../../services/api.js";
import { showSuccess, showError } from "../../components/ui/ToastNotification.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import Button from "../../components/ui/Button.jsx";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang gọi API /rentals...");
      const res = await api.get("/rentals");
      console.log("📦 Response nhận được:", res);
      console.log("📦 res.data:", res?.data);
      console.log("📦 res.data.data:", res?.data?.data);
      console.log("📦 res.data.data.content:", res?.data?.data?.content);
      
      const responseData = res?.data;

      let ordersList = [];
      if (responseData?.data?.content) {
        ordersList = responseData.data.content;
        console.log("✅ Parse từ responseData.data.content - Số items:", ordersList.length);
      } else if (Array.isArray(responseData?.data)) {
        ordersList = responseData.data;
        console.log("✅ Parse từ responseData.data (array) - Số items:", ordersList.length);
      } else if (Array.isArray(responseData)) {
        ordersList = responseData;
        console.log("✅ Parse từ responseData (array) - Số items:", ordersList.length);
      } else {
        console.log("⚠️ Không parse được ordersList - data structure:", JSON.stringify(responseData, null, 2));
      }

      setOrders(ordersList);
    } catch (err) {
      console.error("❌ Fetch orders error:", err);
      console.error("❌ Error response:", err.response?.data);
      showError("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      await api.put(`/rentals/${orderId}/status`, { status: newStatus });
      showSuccess("Cập nhật trạng thái thành công!");
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error("Update status error:", err);
      showError(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    try {
      await api.delete(`/rentals/${orderId}`);
      showSuccess("Xóa đơn hàng thành công!");
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setShowModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Delete order error:", err);
      showError("Xóa đơn hàng thất bại");
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Map frontend status to backend status
  const mapStatus = (status) => {
    const statusMap = {
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      PICKED_UP: 'RENTING',
      RENTING: 'RENTING',
      RETURNED: 'RETURNED',
      CANCELLED: 'CANCELLED',
      COMPLETED: 'COMPLETED',
    };
    return statusMap[status?.toUpperCase()] || status;
  };

  // Map backend status to frontend display
  const getDisplayStatus = (status) => {
    const statusMap = {
      PENDING: { display: 'PENDING', label: 'Chờ xác nhận', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      CONFIRMED: { display: 'CONFIRMED', label: 'Đã xác nhận', bg: 'bg-blue-500/20', text: 'text-blue-400' },
      RENTING: { display: 'RENTING', label: 'Đang thuê', bg: 'bg-purple-500/20', text: 'text-purple-400' },
      RETURNED: { display: 'RETURNED', label: 'Đã trả thiết bị', bg: 'bg-green-500/20', text: 'text-green-400' },
      CANCELLED: { display: 'CANCELLED', label: 'Đã hủy', bg: 'bg-red-500/20', text: 'text-red-400' },
      COMPLETED: { display: 'COMPLETED', label: 'Hoàn thành', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    };
    return statusMap[status?.toUpperCase()] || { display: status, label: status || 'Không rõ', bg: 'bg-slate-500/20', text: 'text-slate-400' };
  };

  const getStatusBadge = (status) => {
    const style = getDisplayStatus(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getNextStatuses = (currentStatus) => {
    const status = mapStatus(currentStatus);
    const flow = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['RENTING', 'CANCELLED'],
      RENTING: ['RETURNED', 'CANCELLED'],
      RETURNED: ['COMPLETED'],
    };
    return flow[status] || [];
  };

  // Normalize order data for consistent access
  const normalizeOrder = (order) => ({
    ...order,
    userName: order.user?.fullName || order.user?.name || order.userName,
    userEmail: order.user?.email || order.userEmail,
    userPhone: order.user?.phone || order.userPhone,
    rentalDate: order.rentalDate || order.startDate,
    returnDate: order.returnDate || order.endDate,
    rentalDays: order.rentalDays || order.days,
    totalPrice: order.totalPrice || order.totalAmount,
  });

  const filteredOrders = orders.filter((order) => {
    const normalized = normalizeOrder(order);
    const matchSearch =
      searchTerm === "" ||
      order.id?.toString().includes(searchTerm) ||
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normalized.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normalized.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normalized.userPhone?.includes(searchTerm);

    const orderStatus = mapStatus(order.status);
    const matchStatus = filterStatus === "ALL" || orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusLabels = {
    ALL: 'Tất cả',
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    RENTING: 'Đang thuê',
    RETURNED: 'Đã trả',
    CANCELLED: 'Đã hủy',
    COMPLETED: 'Hoàn thành',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý đơn thuê</h2>
          <p className="text-slate-400 text-sm mt-1">Tổng cộng: {filteredOrders.length} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel border-slate-700/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, mã đơn, tên khách hàng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="glass-panel border-slate-700/50 p-12 text-center">
          <FiXCircle className="mx-auto text-4xl text-slate-600 mb-3" />
          <p className="text-slate-400">Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <div className="glass-panel border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày thuê</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày trả</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredOrders.map((order) => {
                  const normalized = normalizeOrder(order);
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-white font-medium text-sm">#{order.id}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">{order.orderCode || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{normalized.userName || 'N/A'}</p>
                        <p className="text-slate-500 text-xs">{normalized.userEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{formatDate(normalized.rentalDate)}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{formatDate(normalized.returnDate)}</td>
                      <td className="px-4 py-3 text-yellow-400 font-semibold text-sm">
                        {formatCurrency(normalized.totalPrice || 0)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(order)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <FiEye className="text-blue-400" />
                          </button>
                          {getNextStatuses(order.status).length > 0 && getNextStatuses(order.status).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() => handleUpdateStatus(order.id, nextStatus)}
                              disabled={isUpdating}
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                              title={nextStatus === 'CANCELLED' ? 'Hủy đơn' : 'Cập nhật trạng thái'}
                            >
                              <FiCheck className={nextStatus === 'CANCELLED' ? 'text-red-400' : 'text-green-400'} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedOrder && (() => {
        const normalized = normalizeOrder(selectedOrder);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-2xl border-slate-700/80 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Chi tiết đơn thuê #{selectedOrder.id}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <FiX className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Order Code & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Mã đơn</span>
                  <span className="text-white font-mono font-medium">{selectedOrder.orderCode || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Trạng thái</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Thông tin khách hàng</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Tên</p>
                      <p className="text-white text-sm">{normalized.userName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-white text-sm">{normalized.userEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Số điện thoại</p>
                      <p className="text-white text-sm">{normalized.userPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Rental Info */}
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Thông tin thuê</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Ngày thuê</p>
                      <p className="text-white text-sm">{formatDate(normalized.rentalDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Ngày trả dự kiến</p>
                      <p className="text-white text-sm">{formatDate(normalized.returnDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Số ngày thuê</p>
                      <p className="text-white text-sm">{normalized.rentalDays || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Ngày tạo</p>
                      <p className="text-white text-sm">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Danh sách thiết bị</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{item.cameraName || 'N/A'}</p>
                            <p className="text-slate-400 text-xs">ID: {item.cameraId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 text-sm">
                              {formatCurrency(item.subtotal)} / {item.rentalDays || 1} ngày
                            </p>
                            <p className="text-slate-400 text-xs">x{item.quantity || 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Không có thông tin chi tiết</p>
                  )}
                </div>

                {/* Total */}
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Tổng tiền</span>
                    <span className="text-xl font-bold text-yellow-400">
                      {formatCurrency(normalized.totalPrice || 0)}
                    </span>
                  </div>
                  {selectedOrder.depositAmount > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-400 text-sm">Đặt cọc</span>
                      <span className="text-blue-400 font-medium">
                        {formatCurrency(selectedOrder.depositAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Note */}
                {selectedOrder.note && (
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Ghi chú</p>
                    <p className="text-white text-sm">{selectedOrder.note}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>
                    Đóng
                  </Button>
                  {getNextStatuses(selectedOrder.status).length > 0 && !getNextStatuses(selectedOrder.status).includes('CANCELLED') && (
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        const nextStatus = getNextStatuses(selectedOrder.status)[0];
                        handleUpdateStatus(selectedOrder.id, nextStatus);
                        closeModal();
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <FiLoader className="animate-spin mx-auto" /> : 'Cập nhật tiếp'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
