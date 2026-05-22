import { FiSend, FiPhone, FiMail, FiCamera, FiMessageCircle, FiZap } from 'react-icons/fi';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

function Footer() {
  const navigate = useNavigate();

  const featureBadges = [
    { icon: <FiZap size={12} />, label: 'Hỗ trợ nhanh' },
    { icon: <FiCamera size={12} />, label: 'Thuê linh hoạt' },
    { icon: <FiMessageCircle size={12} />, label: 'Giao tận nơi' },
  ];

  return (
    <footer
      className="relative border-t transition-colors duration-300"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.4) 30%, rgba(6, 182, 212, 0.4) 70%, transparent 100%)'
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1.1fr]">

          {/* Column 1: Logo & Description + Feature Badges */}
          <div>
            {/* Logo */}
            <div
              className="flex cursor-pointer items-center gap-2 mb-4"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                }}
              >
                <FiCamera className="text-white text-lg" />
              </div>
              <span
                className="text-base font-bold tracking-[0.15em]"
                style={{ color: 'var(--text-primary)' }}
              >
                LENSRENT
              </span>
            </div>

            {/* Description */}
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Dịch vụ cho thuê máy ảnh và thiết bị quay phim chuyên nghiệp.
              Đa dạng sản phẩm từ các thương hiệu hàng đầu.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2">
              {featureBadges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span style={{ color: 'var(--primary)' }}>{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              {[
                { label: 'Trang chủ', route: ROUTES.HOME },
                { label: 'Máy ảnh', route: ROUTES.CAMERAS },
                { label: 'Bảo hành & hỗ trợ', route: ROUTES.WARRANTY_POLICY },
                { label: 'Giao hàng', route: ROUTES.SHIPPING_POLICY },
                { label: 'Giao nhận linh hoạt', route: ROUTES.FLEXIBLE_DELIVERY },
                { label: 'Giỏ hàng', route: ROUTES.CART },
                { label: 'Tài khoản', route: ROUTES.PROFILE },
              ].map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => navigate(item.route)}
                    className="flex items-center gap-1.5 group transition-all duration-200 hover:-translate-x-0.5"
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0 transition-all duration-200"
                      style={{ backgroundColor: 'var(--border-color)' }}
                    />
                    <span className="group-hover:text-cyan-400 transition-colors">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Social - Glassmorphism Card */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              Kết nối
            </h4>

            {/* Glassmorphism Contact Card */}
            <div
              className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'rgba(var(--bg-primary-rgb, 255, 255, 255), 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(var(--border-color-rgb, 200, 200, 200), 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(6, 182, 212, 0.04)',
              }}
            >
              {/* CTA Text */}
              <p
                className="text-xs mb-3 leading-relaxed font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cần hỗ trợ thuê máy? Liên hệ LensRent ngay.
              </p>

              {/* Social Buttons Row */}
              <div className="flex items-center gap-2 mb-3">
                {/* Telegram */}
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Liên hệ qua Telegram"
                  className="social-footer-btn"
                  title="Telegram"
                >
                  <FiSend size={15} />
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1Cc8GWdgub/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Liên hệ qua Facebook"
                  className="social-footer-btn"
                  title="Facebook"
                >
                  <FaFacebookF size={14} />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/yousei_1110?igsh=bndrbTNrOGR1ZGF6&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Liên hệ qua Instagram"
                  className="social-footer-btn"
                  title="Instagram"
                >
                  <FaInstagram size={14} />
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me/0359506390"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Nhắn tin qua Zalo"
                  className="social-footer-btn zalo-footer-btn"
                  title="Nhắn Zalo LensRent"
                >
                  <span className="text-[11px] font-bold leading-none">Zalo</span>
                </a>

                {/* Divider */}
                <div className="flex-1 h-px mx-1" style={{ backgroundColor: 'var(--border-color)', opacity: 0.4 }} />

                {/* Quick Phone */}
                <a
                  href="tel:0359506390"
                  aria-label="Gọi ngay 035 950 6390"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}
                >
                  <FiPhone size={11} />
                  <span>Gọi ngay</span>
                </a>
              </div>

              {/* Contact Links */}
              <div className="space-y-1.5">
                {/* Phone */}
                <a
                  href="tel:0359506390"
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all duration-200 contact-link group"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)' }}>
                    <FiPhone size={11} className="text-cyan-400" />
                  </div>
                  <span className="font-medium group-hover:text-cyan-400 transition-colors">035 950 6390</span>
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me/0359506390"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all duration-200 contact-link group"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(0, 104, 255, 0.12)' }}>
                    <FiMessageCircle size={11} className="text-[#0068ff]" />
                  </div>
                  <span className="font-medium group-hover:text-[#0068ff] transition-colors">Zalo</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:lensrentcamera@gmail.com"
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all duration-200 contact-link group"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)' }}>
                    <FiMail size={11} className="text-cyan-400" />
                  </div>
                  <span className="font-medium group-hover:text-cyan-400 transition-colors truncate">lensrentcamera@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div
          className="mt-8 pt-6 border-t text-center"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>LensRent</span>
            {' · '}Premium Camera Rental Experience
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
