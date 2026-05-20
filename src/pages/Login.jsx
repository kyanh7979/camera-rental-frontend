import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import useAuth from '../hooks/useAuth.js';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Button from '../components/ui/Button.jsx';
import InputField from '../components/ui/InputField.jsx';
import { showError, showSuccess } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import { login } from '../services/authService.js';

function Login() {
  const { login: loginAuth, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || ROUTES.HOME;
  const fromRegister = searchParams.get('registered') === 'true';

  const validate = () => {
    const next = {};
    if (!form.email) next.email = 'Vui lòng nhập email';
    if (!form.password) next.password = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await login(form.email, form.password);
      const data = response.data?.data || response.data || response;
      const token = data.token || data.accessToken;
      const user = data.user || data.data?.user;

      if (token && user) {
        loginAuth(token, user);
        showSuccess(`Chào mừng ${user.fullName || user.email}!`);

        // Mọi tài khoản đều về trang chủ sau login
        navigate(redirectTo, { replace: true });
      } else {
        showError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Tài khoản hoặc mật khẩu không đúng.';
      showError(message);
    }
  };

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-soft-gold">
              <FiMail className="text-slate-950 text-xl" />
            </div>
            <span className="text-xl font-bold tracking-[0.15em]">LENSRENT</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="card-bg rounded-2xl p-6 shadow-lg">
          {fromRegister && (
            <div
              className="mb-4 rounded-lg p-3 text-sm"
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                color: '#14b8a6'
              }}
            >
              Đăng ký thành công! Vui lòng đăng nhập với tài khoản mới.
            </div>
          )}

          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">Đăng nhập</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Truy cập hồ sơ, thiết bị đã thuê và bộ thiết bị đã lưu của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              error={errors.email}
              icon={FiMail}
              required
              autoComplete="email"
            />

            <InputField
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              icon={FiLock}
              required
              autoComplete="current-password"
            />

            <div className="pt-1 text-right">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm transition-colors hover:text---primary"
                style={{ color: 'var(----primary)' }}
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <div className="pt-3 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="font-medium transition-colors hover:underline"
                  style={{ color: 'var(----primary)' }}
                >
                  Tạo tài khoản
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2024 LensRent. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}

export default Login;
