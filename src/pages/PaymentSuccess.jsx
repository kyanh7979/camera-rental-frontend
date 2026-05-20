import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import orderService from '../services/orderService.js';
import Button from '../components/ui/Button.jsx';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [paymentStatus, setPaymentStatus] = useState('LOADING');
  const [orderData, setOrderData] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [error, setError] = useState(null);

  const pollingCountRef = useRef(0);
  const maxPollingAttempts = 30;
  const pollingInterval = 3000;

  // Try multiple params — PayOS may return orderCode, id, or orderId
  const resolvedOrderCode = (() => {
    const fromUrl =
      searchParams.get('orderCode') ||
      searchParams.get('orderId') ||
      searchParams.get('id') ||
      searchParams.get('code') ||
      null;
    if (fromUrl) return fromUrl;

    // Fallback to localStorage saved by Checkout.jsx
    return (
      localStorage.getItem('lastOrderCode') ||
      localStorage.getItem('lastOrderId') ||
      null
    );
  })();

  // Resolve orderId similarly (numeric ID, not orderCode)
  const resolvedOrderId = (() => {
    const fromUrl =
      searchParams.get('orderId') ||
      searchParams.get('id') ||
      null;
    if (fromUrl) return fromUrl;
    return (
      localStorage.getItem('lastOrderId') ||
      localStorage.getItem('lastOrderId')
    );
  })();

  useEffect(() => {
    if (!resolvedOrderCode && !resolvedOrderId) {
      setPaymentStatus('NO_ORDER_CODE');
      return;
    }

    const checkPaymentStatus = async () => {
      pollingCountRef.current += 1;
      setPollingCount(pollingCountRef.current);

      try {
        // Try orderCode first (PayOS primary identifier)
        if (resolvedOrderCode) {
          try {
            const status = await orderService.getPaymentStatus(resolvedOrderCode);
            setOrderData(status);

            const isPaid =
              status.status === 'PAID' ||
              status.status === 'COMPLETED' ||
              status.paymentStatus === 'PAID' ||
              status.paymentStatus === 'COMPLETED';

            if (isPaid) {
              setPaymentStatus('PAID');
              // Clean up localStorage after successful read
              localStorage.removeItem('lastOrderCode');
              localStorage.removeItem('lastOrderId');
              return;
            }

            const isFailed =
              status.status === 'CANCELLED' ||
              status.status === 'FAILED' ||
              status.paymentStatus === 'CANCELLED' ||
              status.paymentStatus === 'FAILED';

            if (isFailed) {
              setPaymentStatus('FAILED');
              return;
            }
          } catch (statusErr) {
            // orderCode polling failed, try orderId below
          }
        }

        // Try orderId as fallback
        if (resolvedOrderId) {
          try {
            const order = await orderService.getOrderById(resolvedOrderId);
            setOrderData(order);

            const isPaid =
              order.status === 'PAID' ||
              order.status === 'COMPLETED' ||
              order.paymentStatus === 'PAID' ||
              order.paymentStatus === 'COMPLETED';

            if (isPaid) {
              setPaymentStatus('PAID');
              localStorage.removeItem('lastOrderCode');
              localStorage.removeItem('lastOrderId');
              return;
            }

            const isFailed =
              order.status === 'CANCELLED' ||
              order.status === 'FAILED';

            if (isFailed) {
              setPaymentStatus('FAILED');
              return;
            }
          } catch (orderErr) {
            // orderId also failed
          }
        }

        // Max polling reached
        if (pollingCountRef.current >= maxPollingAttempts) {
          setPaymentStatus('TIMEOUT');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        if (pollingCountRef.current >= maxPollingAttempts) {
          setPaymentStatus('TIMEOUT');
        }
      }
    };

    checkPaymentStatus();

    const interval = setInterval(() => {
      if (
        pollingCountRef.current < maxPollingAttempts &&
        paymentStatus === 'LOADING'
      ) {
        checkPaymentStatus();
      } else {
        clearInterval(interval);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, []);

  const handleGoToOrders = () => {
    navigate(ROUTES.PROFILE);
  };

  const handleGoHome = () => {
    navigate(ROUTES.HOME);
  };

  // ── NO ORDER CODE FOUND ──────────────────────────────────────────────────
  if (paymentStatus === 'NO_ORDER_CODE') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Không tìm thấy mã đơn hàng
          </h1>
          <p className="text-slate-400 mb-6 text-sm">
            Không có thông tin đơn hàng trong URL và không tìm thấy đơn hàng gần nhất trong bộ nhớ trình duyệt.
            Vui lòng kiểm tra trong lịch sử đơn hàng.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToOrders} className="w-full">
              Xem đơn hàng của tôi
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Quay lại trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAYMENT SUCCESS ──────────────────────────────────────────────────────
  if (paymentStatus === 'PAID') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-slate-400 mb-4">
            Đơn hàng của bạn đã được xác nhận
          </p>

          {orderData && (
            <div className="bg-slate-800/50 rounded-lg p-4 text-left mb-6">
              <div className="space-y-2 text-sm">
                {(orderData.orderCode || resolvedOrderCode) && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã đơn:</span>
                    <span className="text-white font-mono">
                      {orderData.orderCode || resolvedOrderCode}
                    </span>
                  </div>
                )}
                {orderData.customerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khách hàng:</span>
                    <span className="text-white">{orderData.customerName}</span>
                  </div>
                )}
                {(orderData.totalAmount || orderData.amount) && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tổng tiền:</span>
                    <span className="text-green-400 font-bold">
                      {Number(orderData.totalAmount || orderData.amount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
                {orderData.startDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày thuê:</span>
                    <span className="text-white">
                      {orderData.startDate} - {orderData.endDate}
                    </span>
                  </div>
                )}
                {orderData.status && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trạng thái:</span>
                    <span className="text-green-400">{orderData.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 mb-4">
            Thông báo đã được gửi qua Telegram
          </p>

          <div className="flex gap-3">
            <Button onClick={handleGoToOrders} className="flex-1">
              Xem đơn hàng
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              Tiếp tục thuê
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAYMENT FAILED ──────────────────────────────────────────────────────
  if (paymentStatus === 'FAILED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Thanh toán không thành công
          </h1>
          <p className="text-slate-400 mb-6">
            Đơn hàng đã bị hủy hoặc thanh toán không thành công.
            Vui lòng thử lại.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate(ROUTES.CART)} className="flex-1">
              Quay lại giỏ hàng
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              Trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── TIMEOUT / MAX POLLING ────────────────────────────────────────────────
  if (paymentStatus === 'TIMEOUT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Chưa xác nhận được thanh toán
          </h1>
          <p className="text-slate-400 mb-2 text-sm">
            Hệ thống đã kiểm tra nhiều lần nhưng chưa nhận được phản hồi từ PayOS.
          </p>
          <p className="text-slate-500 mb-6 text-sm">
            Đơn hàng của bạn có thể đã thanh toán thành công. Vui lòng kiểm tra trong
            {' '}<strong className="text-white">Hồ sơ đơn hàng</strong>.
          </p>

          {(resolvedOrderCode || resolvedOrderId) && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
              <p className="text-xs text-slate-500 mb-1">Mã đơn đang kiểm tra:</p>
              <p className="text-white font-mono text-sm">
                {resolvedOrderCode || resolvedOrderId}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToOrders} className="w-full">
              Kiểm tra đơn hàng
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Quay lại trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING / POLLING ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 text-center max-w-md w-full">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
          <svg
            className="w-10 h-10 text-blue-400 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Đang xác nhận thanh toán...
        </h1>
        <p className="text-slate-400 mb-2">
          Vui lòng chờ trong giây lát
        </p>
        <p className="text-slate-500 text-sm mb-2">
          Đang kiểm tra với PayOS ({pollingCount}/{maxPollingAttempts})
        </p>

        {(resolvedOrderCode || resolvedOrderId) && (
          <p className="text-xs text-slate-600 font-mono mb-6">
            Mã đơn: {resolvedOrderCode || resolvedOrderId}
          </p>
        )}

        <div className="bg-slate-800/50 rounded-lg p-4 text-left mb-6">
          <p className="text-sm text-slate-400">
            Nếu thanh toán đã thành công nhưng trạng thái không cập nhật, vui lòng:
          </p>
          <ul className="text-sm text-slate-500 mt-2 space-y-1 list-disc list-inside">
            <li>Kiểm tra điện thoại đã chuyển khoản đúng số tiền</li>
            <li>Đợi 1-2 phút để PayOS xử lý</li>
            <li>Liên hệ hỗ trợ nếu cần</li>
          </ul>
        </div>

        <Button onClick={handleGoToOrders} variant="outline" className="w-full">
          Kiểm tra đơn hàng
        </Button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
