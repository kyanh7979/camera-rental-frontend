import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw, FiMapPin, FiClock, FiPhone, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

const POLICIES = [
  {
    icon: <FiMapPin className="w-6 h-6" />,
    title: 'Linh hoạt địa điểm giao nhận',
    items: [
      'Hỗ trợ nhận thiết bị tại cửa hàng hoặc giao tận nơi.',
      'Có thể hẹn địa điểm giao nhận phù hợp.'
    ]
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: 'Linh hoạt thời gian',
    items: [
      'Hỗ trợ nhận và trả thiết bị theo lịch hẹn.',
      'Có hỗ trợ giao ngoài giờ trong trường hợp cần thiết.',
      'Hỗ trợ giao gấp cho khách hàng cần sử dụng khẩn cấp.'
    ]
  },
  {
    icon: <FiRefreshCw className="w-6 h-6" />,
    title: 'Hỗ trợ gia hạn thuê',
    items: [
      'Khách hàng có thể gia hạn thời gian thuê trực tuyến nhanh chóng.',
      'Hệ thống cập nhật trạng thái đơn hàng realtime.'
    ]
  },
  {
    icon: <FiPhone className="w-6 h-6" />,
    title: 'Hỗ trợ đổi thiết bị',
    items: [
      'Hỗ trợ đổi thiết bị nếu phát sinh lỗi kỹ thuật.',
      'Hỗ trợ nhanh trong suốt thời gian thuê.'
    ]
  },
  {
    icon: <FiCheck className="w-6 h-6" />,
    title: 'Thanh toán & thông báo tiện lợi',
    items: [
      'Thanh toán QR nhanh bằng PayOS.',
      'Telegram Bot tự động gửi thông báo trạng thái đơn hàng.'
    ]
  }
];

const BADGES = [
  'Giao hàng nhanh trong ngày',
  'Theo dõi đơn hàng realtime',
  'Hỗ trợ giao ngoài giờ',
  'Gia hạn thuê nhanh chóng'
];

function FlexibleDelivery() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Back */}
      <button
        onClick={() => navigate(ROUTES.HOME)}
        className="inline-flex items-center gap-2 text-sm transition-colors hover:text-cyan-400"
        style={{ color: 'var(--text-muted)' }}
      >
        <FiArrowLeft className="w-4 h-4" />
        Quay lại trang chủ
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
          <FiRefreshCw className="w-8 h-8" style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Giao nhận linh hoạt
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Nhanh chóng — Tiện lợi — Phù hợp mọi nhu cầu
        </p>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {BADGES.map((badge, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              color: 'var(--primary)'
            }}>
            <FiCheck className="w-3 h-3" />
            {badge}
          </div>
        ))}
      </motion.div>

      {/* Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POLICIES.map((policy, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' }}>
                {policy.icon}
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {policy.title}
              </h3>
            </div>
            <ul className="space-y-2">
              {policy.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}>
                  <FiCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center p-6 rounded-2xl border"
        style={{
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          borderColor: 'rgba(6, 182, 212, 0.2)'
        }}
      >
        <FiRefreshCw className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Cần hỗ trợ thêm?
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Liên hệ 1900 1234 hoặc Telegram để được tư vấn giao nhận phù hợp
        </p>
      </motion.div>
    </div>
  );
}

export default FlexibleDelivery;
