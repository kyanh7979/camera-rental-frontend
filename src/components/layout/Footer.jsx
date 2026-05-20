import { FiSend, FiPhone, FiMail, FiCamera } from 'react-icons/fi';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

function Footer() {
  const navigate = useNavigate();

  const socialIconStyle = {
    backgroundColor: 'var(--bg-primary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-secondary)'
  };

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

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
              Kết nối
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                style={socialIconStyle}
                title="Telegram"
              >
                <FiSend />
              </a>
              <a
                href="https://www.facebook.com/share/1Cc8GWdgub/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                style={socialIconStyle}
                title="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.instagram.com/yousei_1110?igsh=bndrbTNrOGR1ZGF6&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                style={socialIconStyle}
                title="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
            <div className="space-y-2">
              <a 
                href="tel:0359506390" 
                className="flex items-center gap-2 text-xs hover:text-cyan-400 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiPhone size={12} />
                <span>Hỗ trợ: 0359506390</span>
              </a>
              <a 
                href="mailto:lensrentcamera@gmail.com" 
                className="flex items-center gap-2 text-xs hover:text-cyan-400 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiMail size={12} />
                <span>lensrentcamera@gmail.com</span>
              </a>
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
