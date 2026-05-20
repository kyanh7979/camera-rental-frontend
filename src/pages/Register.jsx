import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCamera, FiPhone } from 'react-icons/fi';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Button from '../components/ui/Button.jsx';
import InputField from '../components/ui/InputField.jsx';
import { showError, showSuccess } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import { register } from '../services/authService.js';
import { validateEmail, validatePassword, validateConfirmPassword, validateFullName, validatePhone } from '../utils/validators.js';
import { notifyNewUser } from '../services/telegramService.js';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (values = form) => {
    const next = {};

    const nameError = validateFullName(values.fullName);
    if (nameError) next.fullName = nameError;

    const emailError = validateEmail(values.email);
    if (emailError) next.email = emailError;

    const phoneError = validatePhone(values.phone);
    if (phoneError) next.phone = phoneError;

    const passwordError = validatePassword(values.password);
    if (passwordError) next.password = passwordError;

    const confirmError = validateConfirmPassword(values.password, values.confirmPassword);
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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setForm(prev => ({ ...prev, phone: raw }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const isFormValid = () => {
    const formOk = validate();
    return formOk && agreedToTerms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!agreedToTerms) {
      showError('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.');
      return;
    }

    try {
      await register(form.fullName, form.email, form.password, form.phone);

      showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');

      notifyNewUser({
        fullname: form.fullName,
        email: form.email,
        phone: form.phone || '',
        createdAt: new Date().toISOString()
      });

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
              onBlur={handleBlur}
              placeholder="Nhập tên của bạn"
              error={touched.fullName ? errors.fullName : null}
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
              onBlur={handleBlur}
              placeholder="email@example.com"
              error={touched.email ? errors.email : null}
              icon={FiMail}
              required
              autoComplete="email"
            />

            <InputField
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="0xxxxxxxxx (9-11 chữ số)"
              error={touched.phone ? errors.phone : null}
              icon={FiPhone}
              required
              autoComplete="tel"
            />

            <InputField
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ít nhất 6 ký tự"
              error={touched.password ? errors.password : null}
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
              onBlur={handleBlur}
              placeholder="Nhập lại mật khẩu"
              error={touched.confirmPassword ? errors.confirmPassword : null}
              icon={FiLock}
              required
              autoComplete="new-password"
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                Tôi đồng ý với{' '}
                <span className="font-medium cursor-pointer hover:underline" style={{ color: 'var(--primary)' }}>
                  Điều khoản sử dụng
                </span>{' '}
                và{' '}
                <span className="font-medium cursor-pointer hover:underline" style={{ color: 'var(--primary)' }}>
                  Chính sách bảo mật
                </span>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!agreedToTerms}
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
