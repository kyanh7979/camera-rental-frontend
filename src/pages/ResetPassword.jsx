import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiLock, FiCamera } from 'react-icons/fi';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import InputField from '../components/ui/InputField.jsx';
import Button from '../components/ui/Button.jsx';
import { showError, showSuccess } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import { resetPasswordNoAuth } from '../services/authService.js';
import { validatePassword, validateConfirmPassword } from '../utils/validators.js';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
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
            <div className="text-center py-4">
              <div 
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ef4444' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#ef4444' }}>Liên kết không hợp lệ</h3>
              <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </p>
              <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
                Quay lại đăng nhập
              </Button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2024 LensRent. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const next = {};
    
    const passwordError = validatePassword(form.password);
    if (passwordError) next.password = passwordError;
    
    const confirmError = validateConfirmPassword(form.password, form.confirmPassword);
    if (confirmError) next.confirmPassword = confirmError;
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    console.log("=== RESET PASSWORD DEBUG ===");
    console.log("Token:", token);
    console.log("Token length:", token?.length);
    console.log("Password length:", form.password?.length);

    try {
      const result = await resetPasswordNoAuth(token, form.password);
      console.log("Reset password success:", result);
      setIsSuccess(true);
      showSuccess('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const backendMessage = err.response?.data?.message;
      const errorMsg = backendMessage || err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      setErrors({ general: errorMsg });
      showError(errorMsg);
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
            <h1 className="text-xl font-semibold">Đặt lại mật khẩu</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Nhập mật khẩu mới cho tài khoản của bạn.
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
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#22c55e' }}>Thành công!</h3>
              <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Mật khẩu của bạn đã được đặt lại thành công.
              </p>
              <p className="mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                Đang chuyển hướng đến trang đăng nhập...
              </p>
              <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <>
              {errors.general && (
                <div 
                  className="mb-4 rounded-lg border px-4 py-3 text-sm"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                  }}
                >
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Mật khẩu mới"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  error={errors.password}
                  icon={FiLock}
                  required
                  autoComplete="new-password"
                />

                <InputField
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  error={errors.confirmPassword}
                  icon={FiLock}
                  required
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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

export default ResetPassword;
