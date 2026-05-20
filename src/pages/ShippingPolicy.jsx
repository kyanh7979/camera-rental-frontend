import { motion } from 'framer-motion';
import { FiArrowLeft, FiTruck, FiCheck, FiPackage, FiClock, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

const POLICIES = [
  {
    icon: <FiZap className="w-6 h-6" />,
    title: 'Giao hàng nhanh chóng',
    items: [
      'Hỗ trợ giao nhanh trong ngày.',
      'Xử lý đơn ngay sau thanh toán PayOS thành công.',
      'Hỗ trợ nhận tại cửa hàng hoặc giao tận nơi.'
    ]
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: 'Thời gian giao hàng',
    items: [
      'Nội thành: 1–3 giờ.',
      'Ngoại thành/tỉnh khác: 1–3 ngày.',
      'Thiết bị cao cấp có thể cần chuẩn bị thêm.'
    ]
  },
  {
    icon: <FiPackage className="w-6 h-6" />,
    title: 'Kiểm tra thiết bị khi nhận',
    items: [
      'Cho phép kiểm tra trước khi nhận.',
      'Hướng dẫn kiểm tra phụ kiện.',
      'Hỗ trợ phản hồi nếu có vấn đề.'
    ]
  },
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: 'Giao nhận linh hoạt',
    items: [
      'Có hỗ trợ giao ngoài giờ.',
      'Hỗ trợ giao gấp cho khách cần khẩn cấp.',
      'Cập nhật trạng thái đơn hàng bằng Telegram Bot.'
    ]
  },
  {
    icon: <FiCheck className="w-6 h-6" />,
    title: 'Cam kết dịch vụ',
    items: [
      'Đóng gói thiết bị cẩn thận.',
      'Hỗ trợ nhanh nếu có sự cố giao nhận.',
      'Mang lại trải nghiệm thuê hiện đại và tiện lợi.'
    ]
  }
];

const BADGES = [
  'Giao hàng nhanh trong ngày',
  'Thanh toán QR tiện lợi',
  'Theo dõi đơn hàng realtime',
  'Hỗ trợ kỹ thuật nhanh'
];

function ShippingPolicy() {
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
          <FiTruck className="w-8 h-8" style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Chính sách giao hàng & nhận thiết bị
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Nhanh chóng — An toàn — Linh hoạt
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
        <FiTruck className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Cần giao gấp?
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Liên hệ 1900 1234 hoặc Telegram để đặt giao hàng nhanh
        </p>
      </motion.div>
    </div>
  );
}

export default ShippingPolicy;
