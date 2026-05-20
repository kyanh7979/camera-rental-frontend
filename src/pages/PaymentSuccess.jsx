import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import orderService from '../services/orderService.js';
import Button from '../components/ui/Button.jsx';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [orderData, setOrderData] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [error, setError] = useState(null);

  const orderCode = searchParams.get('orderCode');
  const maxPollingAttempts = 30;
  const pollingInterval = 3000;

  useEffect(() => {
    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng. Vui lòng kiểm tra lại.');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const status = await orderService.getPaymentStatus(orderCode);
        console.log('Payment status check:', status);
        setOrderData(status);
        setPollingCount(prev => prev + 1);

        const isPaid = status.status === 'PAID' || status.paymentStatus === 'COMPLETED';

        if (isPaid) {
          setPaymentStatus('PAID');
          return;
        }

        if (status.status === 'CANCELLED' || status.status === 'FAILED') {
          setPaymentStatus('FAILED');
          return;
        }

      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    };

    checkPaymentStatus();

    const interval = setInterval(() => {
      if (pollingCount < maxPollingAttempts && paymentStatus === 'PENDING') {
        checkPaymentStatus();
      } else {
        clearInterval(interval);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [orderCode, pollingCount, paymentStatus]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Đã xảy ra lỗi</h1>
          <p className="text-slate-400 mb-2">{error}</p>
          <Button onClick={() => navigate(ROUTES.PROFILE)} className="w-full mt-4">
            Xem đơn hàng của tôi
          </Button>
        </div>
      );
    }

    if (paymentStatus === 'PAID') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h1>
          <p className="text-slate-400 mb-4">
            Đơn hàng của bạn đã được xác nhận
          </p>

          {orderData && (
            <div className="bg-slate-800/50 rounded-lg p-4 text-left mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã đơn:</span>
                  <span className="text-white font-mono">{orderData.orderCode}</span>
                </div>
                {orderData.customerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khách hàng:</span>
                    <span className="text-white">{orderData.customerName}</span>
                  </div>
                )}
                {orderData.amount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tổng tiền:</span>
                    <span className="text-green-400 font-bold">
                      {Number(orderData.amount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
                {orderData.startDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày thuê:</span>
                    <span className="text-white">{orderData.startDate} - {orderData.endDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 mb-4">
            Thông báo đã được gửi qua Telegram
          </p>

          <div className="flex gap-3">
            <Button onClick={() => navigate(ROUTES.PROFILE)} className="flex-1">
              Xem đơn hàng
            </Button>
            <Button onClick={() => navigate(ROUTES.HOME)} variant="outline" className="flex-1">
              Tiếp tục thuê
            </Button>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'FAILED') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thất bại</h1>
          <p className="text-slate-400 mb-6">
            Đơn hàng đã bị hủy hoặc thanh toán không thành công.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate(ROUTES.CART)} className="flex-1">
              Quay lại giỏ hàng
            </Button>
            <Button onClick={() => navigate(ROUTES.HOME)} variant="outline" className="flex-1">
              Trang chủ
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Đang xác nhận thanh toán...</h1>
        <p className="text-slate-400 mb-2">
          Vui lòng chờ trong giây lát
        </p>
        <p className="text-slate-500 text-sm mb-6">
          Đang kiểm tra với PayOS ({pollingCount}/{maxPollingAttempts})
        </p>

        {orderCode && (
          <p className="text-xs text-slate-600 font-mono mb-6">
            Mã đơn: {orderCode}
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

        <Button onClick={() => navigate(ROUTES.PROFILE)} variant="outline" className="w-full">
          Kiểm tra đơn hàng
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 text-center max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
}

export default PaymentSuccess;
