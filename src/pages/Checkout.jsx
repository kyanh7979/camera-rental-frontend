import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCamera } from 'react-icons/fi';
import useCartStore from '../store/cartStore.js';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { showSuccess, showError } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import { createPayOSPaymentFromCart, getPayOSPaymentStatus } from '../services/paymentService';
import { getCameraById } from '../services/cameraService.js';
import { QRCodeSVG } from 'qrcode.react';

function Checkout() {
  const location = useLocation();
  const { clearCart, getTotal, removeFromCart } = useCartStore();
  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: authUser?.name || '',
    phone: authUser?.phone || authUser?.phoneNumber || '',
    email: authUser?.email || '',
    address: authUser?.address || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payOSData, setPayOSData] = useState(null);
  const [orderCode, setOrderCode] = useState(null);

  const cartItems = useCartStore((state) => state.items);
  const cartTotal = getTotal();

  const rentNowItem = location.state?.rentNowItem || null;
  const isRentNowMode = !!rentNowItem;

  const displayItems = isRentNowMode ? [rentNowItem] : cartItems;
  const displayTotal = isRentNowMode
    ? (rentNowItem.pricePerDay || 0) * (rentNowItem.rentalDays || 1)
    : cartTotal;

  const isEmpty = displayItems.length === 0;

  useEffect(() => {
    if (isEmpty && !payOSData) {
      // Don't redirect immediately - let user see the empty state
    }
  }, [isEmpty, payOSData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const checkAndRemoveOutOfStock = async (itemsToCheck) => {
    const outOfStockItems = [];

    for (const item of itemsToCheck) {
      try {
        const res = await getCameraById(item.id);
        const camera = res.data?.data || res.data;
        const availability = camera?.availability;

        const isOutOfStock =
          (typeof availability === 'number' && availability <= 0) ||
          (typeof availability === 'string' && availability.toLowerCase().includes('hết'));

        if (isOutOfStock) {
          outOfStockItems.push(item);
        }
      } catch {
        outOfStockItems.push(item);
      }
    }

    if (outOfStockItems.length > 0) {
      for (const item of outOfStockItems) {
        removeFromCart(item.id);
      }
      showError(`${outOfStockItems.length} sản phẩm đã bị xóa khỏi giỏ hàng vì hết hàng`);
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !authUser) {
      showError('Vui lòng đăng nhập trước khi thanh toán!');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!form.name || !form.email || !form.address) {
      showError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (isRentNowMode) {
      // ─── Rent Now flow (single item, no cart) ───
      setIsSubmitting(true);
      try {
        const orderData = {
          startDate: rentNowItem.startDate || new Date().toISOString().split('T')[0],
          endDate: rentNowItem.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalAmount: Math.round(displayTotal),
          note: 'Thuê camera - Thuê ngay',
          items: [
            {
              cameraId: Number(rentNowItem.cameraId || rentNowItem.id),
              rentalDays: Number(rentNowItem.rentalDays) || 1,
              quantity: 1,
              pricePerDay: Number(rentNowItem.pricePerDay) || 0
            }
          ]
        };

        const res = await createPayOSPaymentFromCart(orderData);
        const data = res.data.data || res.data;

        console.log('✅ PayOS Response (Rent Now):', JSON.stringify(data, null, 2));

        setPayOSData(data);
        setOrderCode(data.orderCode);
        showSuccess('Đã tạo mã QR thanh toán!');
      } catch (err) {
        console.error('❌ Checkout Error (Rent Now):', err);
        const errorMsg = err.response?.data?.message || 'Lỗi tạo thanh toán. Vui lòng thử lại.';
        showError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // ─── Cart flow (original) ───
      const currentItems = useCartStore.getState().items;
      if (currentItems.length === 0) {
        showError('Giỏ hàng trống!');
        return;
      }

      setIsSubmitting(true);

      try {
        await checkAndRemoveOutOfStock(currentItems);

        const validItems = useCartStore.getState().items;

        if (validItems.length === 0) {
          showError('Tất cả sản phẩm trong giỏ hàng đã hết hàng!');
          setIsSubmitting(false);
          return;
        }

        const totalAmount = Math.round(useCartStore.getState().getTotal());
        const orderData = {
          startDate: validItems[0]?.startDate || new Date().toISOString().split('T')[0],
          endDate: validItems[0]?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalAmount: totalAmount,
          note: 'Thue camera',
          items: validItems.map(item => ({
            cameraId: Number(item.id),
            rentalDays: Number(item.rentalDays) || 1,
            quantity: Number(item.quantity) || 1,
            pricePerDay: Number(item.pricePerDay) || 0
          }))
        };

        const res = await createPayOSPaymentFromCart(orderData);
        const data = res.data.data || res.data;

        console.log('✅ PayOS Response:', JSON.stringify(data, null, 2));

        setPayOSData(data);
        setOrderCode(data.orderCode);
        showSuccess('Đã tạo mã QR thanh toán!');
      } catch (err) {
        console.error('❌ Checkout Error:', err);
        const errorMsg = err.response?.data?.message || 'Lỗi tạo thanh toán. Vui lòng thử lại.';
        showError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (!orderCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await getPayOSPaymentStatus(orderCode);
        const paymentStatus = res.data?.paymentStatus || res.data?.status;

        if (paymentStatus === 'PAID' || paymentStatus === 'COMPLETED') {
          showSuccess('Thanh toán thành công!');
          if (!isRentNowMode) {
            clearCart();
          }
          navigate(ROUTES.PAYMENT_SUCCESS);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderCode]);

  if (isEmpty && !payOSData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-card)' }}>
            <FiCamera className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Giỏ hàng trống
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Bạn chưa chọn sản phẩm nào để thuê.
          </p>
          <Button onClick={() => navigate(ROUTES.CAMERAS)}>
            Khám phá máy ảnh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Thông tin thanh toán
        </h2>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên *" className="input" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="SĐT" className="input" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email *" className="input" />
        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ *" className="input" />

        {!payOSData ? (
          <Button
            type="submit"
            className="w-full h-11 bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo mã QR...' : 'Tạo mã QR thanh toán'}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-green-500 bg-green-500/10">
              <p className="text-green-400 font-medium text-center mb-2">
                Đã tạo mã QR thanh toán PayOS
              </p>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Vui lòng quét mã QR bên phải để thanh toán
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setPayOSData(null)}
              variant="outline"
              className="w-full"
            >
              Hủy và tạo lại
            </Button>
          </div>
        )}
      </form>

      <div className="glass-panel p-6">
        <h2 className="text-white font-semibold mb-4">
          Đơn hàng của bạn
        </h2>

        {isRentNowMode && rentNowItem.startDate && rentNowItem.endDate && (
          <div className="mb-4 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Thuê ngay</span>
              {' · '}
              Nhận: {rentNowItem.startDate}
              {' · '}
              Trả: {rentNowItem.endDate}
              {' · '}
              {rentNowItem.rentalDays} ngày
            </p>
          </div>
        )}

        <div className="space-y-3">
          {displayItems.map((item) => (
            <div key={item.id || item.cameraId} className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>
                {item.name} x{item.rentalDays || 1} ngày
              </span>
              <span className="text-yellow-400">
                {formatCurrency((item.pricePerDay || 0) * (item.rentalDays || 1))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-3 flex justify-between text-lg font-semibold">
          <span className="text-white">Tổng</span>
          <span className="text-yellow-400">
            {formatCurrency(displayTotal)}
          </span>
        </div>

        {payOSData && (
          <div className="mt-6 text-center">
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Quét mã QR để thanh toán</p>
            {payOSData.qrCode ? (
              <div className="mx-auto inline-block p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={payOSData.qrCode}
                  size={200}
                  level="M"
                />
              </div>
            ) : (
              <p className="text-red-400">Không có mã QR</p>
            )}
            <p className="text-sm text-yellow-400 mt-3">
              Số tiền: {formatCurrency(displayTotal)}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Sau khi thanh toán thành công, hệ thống sẽ tự động xác nhận đơn hàng trong vài giây.
            </p>
            <p className="text-xs mt-2 text-cyan-400/80">
              Vui lòng quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
