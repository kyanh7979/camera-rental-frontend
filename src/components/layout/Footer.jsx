import { FiSend, FiPhone, FiMail, FiCamera, FiMessageCircle } from 'react-icons/fi';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      className="border-t transition-colors duration-300"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div
              className="flex cursor-pointer items-center gap-2 mb-4"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
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
            <p
              className="text-sm leading-relaxed max-w-md"
              style={{ color: 'var(--text-secondary)' }}
            >
              Dịch vụ cho thuê máy ảnh và thiết bị quay phim chuyên nghiệp.
              Đa dạng sản phẩm từ các thương hiệu hàng đầu.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>
                <button
                  onClick={() => navigate(ROUTES.HOME)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.CAMERAS)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Máy ảnh
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.WARRANTY_POLICY)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Bảo hành & hỗ trợ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.SHIPPING_POLICY)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Giao hàng
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.FLEXIBLE_DELIVERY)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Giao nhận linh hoạt
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.CART)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Giỏ hàng
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Tài khoản
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Social - Enhanced */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
              Kết nối
            </h4>

            {/* Contact Card */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              {/* CTA Text */}
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cần hỗ trợ thuê máy? Liên hệ LensRent ngay.
              </p>

              {/* Social Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Telegram */}
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Liên hệ qua Telegram"
                  className="social-icon-lg"
                  title="Telegram"
                >
                  <FiSend size={16} />
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1Cc8GWdgub/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Liên hệ qua Facebook"
                  className="social-icon-lg"
                  title="Facebook"
                >
                  <FaFacebookF size={15} />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/yousei_1110?igsh=bndrbTNrOGR1ZGF6&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Liên hệ qua Instagram"
                  className="social-icon-lg"
                  title="Instagram"
                >
                  <FaInstagram size={15} />
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me/0359506390"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Nhắn tin qua Zalo"
                  className="social-icon-lg zalo-btn"
                  title="Zalo"
                >
                  <span className="text-xs font-bold">Z</span>
                </a>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {/* Phone */}
                <a
                  href="tel:0359506390"
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all hover:bg-cyan-500/10 group"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                    <FiPhone size={12} className="text-cyan-400" />
                  </div>
                  <span className="group-hover:text-cyan-400 transition-colors font-medium">035 950 6390</span>
                  <span className="text-[10px] ml-auto opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-all">Gọi ngay</span>
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me/0359506390"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all hover:bg-[#0068ff]/10 group"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(0, 104, 255, 0.15)' }}>
                    <FiMessageCircle size={12} className="text-[#0068ff]" />
                  </div>
                  <span className="group-hover:text-[#0068ff] transition-colors font-medium">Zalo</span>
                  <span className="text-[10px] ml-auto opacity-60 group-hover:opacity-100 group-hover:text-[#0068ff] transition-all">Nhắn Zalo</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:lensrentcamera@gmail.com"
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all hover:bg-cyan-500/10 group"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                    <FiMail size={12} className="text-cyan-400" />
                  </div>
                  <span className="group-hover:text-cyan-400 transition-colors font-medium truncate">lensrent@gmail.com</span>
                  <span className="text-[10px] ml-auto opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-all">Gửi email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t text-center text-xs"
          style={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)'
          }}
        >
          © {new Date().getFullYear()} LensRent. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
