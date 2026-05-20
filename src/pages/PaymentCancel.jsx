import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import Button from '../components/ui/Button.jsx';

function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Thanh toán bị hủy</h1>
        <p className="text-slate-400 mb-6">
          Thanh toán của bạn đã bị hủy. Bạn có thể thử lại hoặc quay lại giỏ hàng.
        </p>

        <div className="space-y-3">
          <Button onClick={() => navigate(ROUTES.CHECKOUT)} className="w-full">
            Thử lại
          </Button>
          <Button onClick={() => navigate(ROUTES.CART)} variant="outline" className="w-full">
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
