import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiCamera } from 'react-icons/fi';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import InputField from '../components/ui/InputField.jsx';
import Button from '../components/ui/Button.jsx';
import { showError, showSuccess } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import { forgotPassword } from '../services/authService.js';
import { validateEmail } from '../utils/validators.js';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      showSuccess('Đã gửi liên kết đặt lại mật khẩu đến email của bạn.');
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-gold to-slate-600 shadow-soft-gold">
              <FiCamera className="text-slate-950 text-xl" />
            </div>
            <span className="text-xl font-bold tracking-[0.15em]">LENSRENT</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="card-bg rounded-2xl p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">Quên mật khẩu</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Nhập email đã đăng ký để khôi phục tài khoản.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center py-4">
              <div 
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#22c55e' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#22c55e' }}>Gửi thành công!</h3>
              <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Vui lòng kiểm tra email để đặt lại mật khẩu.
              </p>
              <p className="mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                Nếu không thấy email, hãy kiểm tra thư mục <strong style={{ color: 'var(--text-secondary)' }}>Spam/Junk</strong>.
              </p>
              <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
                Quay lại đăng nhập
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  error={error}
                  icon={FiMail}
                  required
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm transition-colors hover:underline"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2024 LensRent. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
