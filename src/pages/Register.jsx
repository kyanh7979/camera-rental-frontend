import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Button from '../components/ui/Button.jsx';
import InputField from '../components/ui/InputField.jsx';
import { showError, showSuccess } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import { register } from '../services/authService.js';
import { validateEmail, validatePassword, validateConfirmPassword, validateFullName } from '../utils/validators.js';
import { notifyNewUser } from '../services/telegramService.js';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    
    const nameError = validateFullName(form.fullName);
    if (nameError) next.fullName = nameError;
    
    const emailError = validateEmail(form.email);
    if (emailError) next.email = emailError;
    
    const passwordError = validatePassword(form.password);
    if (passwordError) next.password = passwordError;
    
    const confirmError = validateConfirmPassword(form.password, form.confirmPassword);
    if (confirmError) next.confirmPassword = confirmError;
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(form.fullName, form.email, form.password);

      // Đăng ký thành công - KHÔNG tự đăng nhập
      showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');

      // Gửi Telegram notification — fail-safe, không block navigation
      notifyNewUser({
        fullname: form.fullName,
        email: form.email,
        phone: form.phone || '',
        createdAt: new Date().toISOString()
      });

      // Chuyển sang trang đăng nhập với message
      navigate(`${ROUTES.LOGIN}?registered=true`, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể đăng ký. Vui lòng thử lại.';
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
              <FiCamera className="text-slate-950 text-xl" />
            </div>
            <span className="text-xl font-bold tracking-[0.15em]">LENSRENT</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="card-bg rounded-2xl p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">Tạo tài khoản</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Lưu danh sách yêu thích, xem lịch sử thuê và tự động điền khi thanh toán.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Họ và tên"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nhập tên của bạn"
              error={errors.fullName}
              icon={FiUser}
              required
              autoComplete="name"
            />

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
            >
              Tạo tài khoản
            </Button>

            <div className="pt-3 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="font-medium transition-colors hover:underline"
                  style={{ color: 'var(----primary)' }}
                >
                  Đăng nhập
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

export default Register;
